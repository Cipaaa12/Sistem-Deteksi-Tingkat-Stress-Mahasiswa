from flask import Flask, render_template, request, jsonify, session
from datetime import datetime
import pickle
import re
import os
from deep_translator import GoogleTranslator

# Mengambil jalur absolut dari folder tempat file app.py ini berada
base_dir = os.path.dirname(os.path.abspath(__file__))

# Mengatur Flask agar membaca folder UI secara dinamis dan akurat di dalam folder 'frontend'
app = Flask(__name__, 
            template_folder=os.path.join(base_dir, '../frontend/templates'), 
            static_folder=os.path.join(base_dir, '../frontend/static'))
app.secret_key = 'kunci_rahasia_stresscare_2026' 

# Load model dan vectorizer secara dinamis dari folder backend
model_path = os.path.join(base_dir, "model_stress_baru.pkl")
vkt_path = os.path.join(base_dir, "vkt_stress_baru.pkl")

with open(model_path, "rb") as f:
    model_nb = pickle.load(f)

with open(vkt_path, "rb") as f:
    tfidf = pickle.load(f)

def clean_input(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    return " ".join(text.split())

def hitung_tingkat_stres_ml(teks_indonesia):
    if not teks_indonesia or teks_indonesia.strip() == "":
        return "Ringan"

    teks_bersih_id = teks_indonesia.lower()
    
    # 1. BYPASS EMERGENCY SECARA AGRESIF (Kondisi Darurat Mutlak)
    kata_darurat = [
        "bunuh diri", "akhiri hidup", "pengen mati", "ingin mati", 
        "suicide", "self harm", "bndr", "mati aja", "potong urat"
    ]
    for kata in kata_darurat:
        if kata in teks_bersih_id:
            return "Tinggi"

    # 2. ANTISIPASI KALIMAT SANGAT POSITIF / SANTAI
    kata_santai = ["senang", "bahagia", "aman", "gembira", "santai", "alhamdulillah", "happy"]
    if any(kata in teks_bersih_id for kata in kata_santai) and not any(k in teks_bersih_id for k in ["stres", "stress", "depresi", "gila", "benci"]):
        return "Ringan"

    # 3. KALIBRASI KATA MANUAL UNTUK KELUHAN RINGAN (Seperti "cape dikit")
    # Jika mengeluh capek/pusing tapi ada kata penurun intensitas seperti "dikit", "biasa", "wajar"
    kata_keluhan_ringan = ["cape", "capek", "lelah", "pusing", "jenuh"]
    kata_penurun = ["dikit", "sedikit", "biasa", "wajar", "aja", "doang"]
    if any(k in teks_bersih_id for k in kata_keluhan_ringan) and any(p in teks_bersih_id for p in kata_penurun):
        # Biarkan masuk ke Sedang atau Ringan, jangan biarkan tembus ke Tinggi
        pass

    # 4. PROSES TRANSLASI KE BAHASA INGGRIS
    try:
        translated_text = GoogleTranslator(source='id', target='en').translate(teks_indonesia)
    except Exception as e:
        print(f"Translasi otomatis gagal: {e}")
        translated_text = teks_indonesia

    cleaned_text = clean_input(translated_text)
    if not cleaned_text:
        return "Ringan"

    text_vector = tfidf.transform([cleaned_text])
    
    # 5. AMBIL PREDIKSI MULTIKLASIFIKASI DAN PROBABILITASNYA
    prediksi_kelas = model_nb.predict(text_vector)[0]
    probabilities = model_nb.predict_proba(text_vector)[0]
    max_prob = max(probabilities)

    # 6. LOGIKA PENENTUAN SKALA YANG LEBIH ADIL DAN TIDAK SENSITIF
    if str(prediksi_kelas) == "1" or prediksi_kelas == 1:
        # Naikkan batas minimal ke 0.80 agar keluhan biasa/kecil tidak gampang lompat ke "Tinggi"
        if max_prob >= 0.80:
            return "Tinggi"
        else:
            return "Sedang"
    else:
        # Jika model memprediksi kelas 0 (normal)
        if max_prob < 0.60:
            return "Sedang"
        return "Ringan"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    curhatan = request.form.get('curhatan')
    
    if not curhatan:
        return jsonify({
            'hasil_prediksi': 'Ringan', 
            'daftar_riwayat_nyata': session.get('riwayat_stres', [])
        })
    
    hasil_prediksi = hitung_tingkat_stres_ml(curhatan)
        
    hari_id = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]
    bulan_id = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
    
    now = datetime.now()
    hari_nama = hari_id[now.weekday()]
    bulan_nama = bulan_id[now.month - 1]
    waktu_str = f"{hari_nama}, {now.day} {bulan_nama} {now.year} - {now.strftime('%H:%M')}"
    
    if 'riwayat_stres' not in session:
        session['riwayat_stres'] = []
        
    data_baru = {
        'hasil': hasil_prediksi,
        'waktu': waktu_str
    }
    
    list_riwayat = session['riwayat_stres']
    list_riwayat.insert(0, data_baru)
    session['riwayat_stres'] = list_riwayat
    session.modified = True 
    
    return jsonify({
        'hasil_prediksi': hasil_prediksi,
        'daftar_riwayat_nyata': session['riwayat_stres']
    })

@app.route('/clear_history', methods=['POST'])
def clear_history():
    session.pop('riwayat_stres', None)
    return jsonify({'status': 'success'})

if __name__ == '__main__':
    app.run(debug=True)