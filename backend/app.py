from flask import Flask, render_template, request, jsonify, session
from datetime import datetime
import pickle
import re
import os
from deep_translator import GoogleTranslator
from supabase import create_client, Client  # 💡 Menggunakan library resmi Supabase Cloud

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

# 💡 Kredensial & Inisialisasi Koneksi ke Supabase Cloud Database
SUPABASE_URL = "https://bvdnsxknhedtudpearza.supabase.co"
# GANTI teks di bawah ini dengan key panjang (Publishable key) yang sudah kamu copy ke Notepad tadi ya!
SUPABASE_KEY = "sb_publishable_w_wBj9WOcTDyoas7RybRUw_TlO4IXyb" 

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

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
    kata_keluhan_ringan = ["cape", "capek", "lelah", "pusing", "jenuh"]
    kata_penurun = ["dikit", "sedikit", "biasa", "wajar", "aja", "doang"]
    if any(k in teks_bersih_id for k in kata_keluhan_ringan) and any(p in teks_bersih_id for p in kata_penurun):
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
        if max_prob >= 0.80:
            return "Tinggi"
        else:
            return "Sedang"
    else:
        if max_prob < 0.60:
            return "Sedang"
        return "Ringan"

# 💡 Fungsi untuk mengambil riwayat terupdate dari database Supabase secara nyata
def ambil_riwayat_dari_db():
    try:
        # Mengambil data dari tabel Supabase, diurutkan berdasarkan waktu input terbaru
        response = supabase.table("riwayat_prediksi").select("*").order("waktu_input", desc=True).execute()
        rows = response.data
        
        # Penyesuaian nama key agar sesuai dengan format JavaScript di frontend kamu (hasil & waktu)
        data_frontend = []
        for r in rows:
            waktu_indo = "-"
            if 'waktu_input' in r and r['waktu_input']:
                # Mengubah format string ISO timestamp dari Supabase cloud ke objek waktu Python
                dt = datetime.fromisoformat(r['waktu_input'].replace('Z', '+00:00'))
                hari_indo = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]
                bulan_indo = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
                
                nama_hari = hari_indo[dt.weekday()]
                nama_bulan = bulan_indo[dt.month]
                waktu_indo = f"{nama_hari}, {dt.day} {nama_bulan} {dt.year} - {dt.strftime('%H:%M')}"

            data_frontend.append({
                'hasil': r.get('hasil_prediksi', 'Ringan'),
                'waktu': waktu_indo
            })
            
        return data_frontend
    except Exception as e:
        print(f"Gagal mengambil data dari Supabase: {e}")
        return []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    curhatan = request.form.get('curhatan')
    
    # 💡 Mengambil identitas dari form HTML
    nama = request.form.get('nama', 'Anonim')
    umur = request.form.get('umur', 0)
    semester = request.form.get('semester', 'Tidak Diketahui')
    jenis_kelamin = request.form.get('jenis_kelamin', 'Laki-laki')
    
    if not curhatan:
        return jsonify({
            'hasil_prediksi': 'Ringan', 
            'daftar_riwayat_nyata': ambil_riwayat_dari_db()
        })
    
    hasil_prediksi = hitung_tingkat_stres_ml(curhatan)
        
    # 💡 Perintah menyimpan log keluhan ke database Supabase Cloud
    try:
        data_input = {
            "nama": nama,
            "umur": int(umur) if umur else 0,
            "semester": semester,
            "jenis_kelamin": jenis_kelamin,
            "teks_keluhan": curhatan,
            "hasil_prediksi": hasil_prediksi
        }
        supabase.table("riwayat_prediksi").insert(data_input).execute()
    except Exception as e:
        print(f"Gagal menyimpan ke Supabase: {e}")
    
    return jsonify({
        'hasil_prediksi': hasil_prediksi,
        'daftar_riwayat_nyata': ambil_riwayat_dari_db()
    })

@app.route('/clear_history', methods=['POST'])
def clear_history():
    # 💡 Mengosongkan isi seluruh baris tabel di database Supabase secara nyata
    try:
        # Menghapus seluruh data dengan trik filter id lebih besar dari 0
        supabase.table("riwayat_prediksi").delete().gt("id", 0).execute()
    except Exception as e:
        print(f"Gagal mengosongkan Supabase: {e}")
        
    return jsonify({'status': 'success'})

if __name__ == '__main__':
    app.run(debug=True)