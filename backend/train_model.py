import pandas as pd
import re
import pickle
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score, precision_score, recall_score

# 1. Load Dataset
df = pd.read_csv("backend/dataset/Stress.csv")

# 2. Preprocessing / Pembersihan Teks
def clean_text(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    return " ".join(text.split())

df['cleaned_text'] = df['text'].apply(clean_text)

# 3. Split Dataset (Data Latih 80%, Data Uji 20%)
X_train, X_test, y_train, y_test = train_test_split(
    df['cleaned_text'], 
    df['label'], 
    test_size=0.2, 
    random_state=42,
    stratify=df['label']
)

# 4. Ekstraksi Fitur Menggunakan TF-IDF Vectorizer
tfidf = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
X_train_tfidf = tfidf.fit_transform(X_train)

# 5. Training Model Naive Bayes (MultinomialNB)
model_nb = MultinomialNB(alpha=0.1)
model_nb.fit(X_train_tfidf, y_train)

# 6. Pengujian dan Evaluasi Model
X_test_tfidf = tfidf.transform(X_test)
y_pred = model_nb.predict(X_test_tfidf)

# Menghitung Metrik Evaluasi Resmi untuk Bab 4
akurasi = accuracy_score(y_test, y_pred)
presisi = precision_score(y_test, y_pred, average='macro')
recall = recall_score(y_test, y_pred, average='macro')

# Menampilkan Hasil Bersih Tanpa F1-Score
print("\n=== HASIL EVALUASI MODEL NAIVE BAYES ===")
print(f"Akurasi    : {akurasi * 100:.2f}%")
print(f"Precision  : {presisi * 100:.2f}%")
print(f"Recall     : {recall * 100:.2f}%")
print("========================================")

# 7. Menyimpan Model dan Vectorizer ke File .pkl
with open("model_stress_baru.pkl", "wb") as f:
    pickle.dump(model_nb, f)

with open("vkt_stress_baru.pkl", "wb") as f:
    pickle.dump(tfidf, f)