import pandas as pd
import re
import pickle
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB

# ganti jalurnya ke folder dataset agar sesuai struktur proyekmu
df = pd.read_csv("backend/dataset/Stress.csv")

def clean_text(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    return " ".join(text.split())

df['cleaned_text'] = df['text'].apply(clean_text)

X_train, X_test, y_train, y_test = train_test_split(
    df['cleaned_text'], 
    df['label'], 
    test_size=0.2, 
    random_state=42,
    stratify=df['label']
)

tfidf = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
X_train_tfidf = tfidf.fit_transform(X_train)

model_nb = MultinomialNB(alpha=0.1)
model_nb.fit(X_train_tfidf, y_train)

X_test_tfidf = tfidf.transform(X_test)
print("Akurasi model:", model_nb.score(X_test_tfidf, y_test))

# simpan pkl langsung ke folder utama tempat app.py berada
with open("model_stress_baru.pkl", "wb") as f:
    pickle.dump(model_nb, f)

with open("vkt_stress_baru.pkl", "wb") as f:
    pickle.dump(tfidf, f)