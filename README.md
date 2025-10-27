# 📚 Grade Mind

**Grade Mind** adalah platform web-based yang mengintegrasikan teknologi Artificial Intelligence untuk mengotomatisasi proses penilaian jawaban esai mahasiswa. Sistem ini menggabungkan teknologi Optical Character Recognition (OCR) untuk digitalisasi tulisan tangan dan Large Language Model (LLM) berbasis Ollama untuk analisis dan penilaian jawaban secara otomatis. Dibangun dengan FastAPI sebagai backend REST API, Next.js untuk frontend yang responsif, dan PostgreSQL sebagai database management system, Grade Mind menyediakan solusi end-to-end untuk manajemen kelas, penugasan, dan penilaian yang efisien bagi dosen dan mahasiswa.

## 📋 Daftar Isi

- [Tim Pengembang](#-tim-pengembang)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Struktur Project](#-struktur-project)
- [Instalasi](#-instalasi)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-setup)
  - [Frontend Setup](#2-frontend-setup)
  - [AI Grader Setup](#3-ai-grader-setup)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Catatan Pengembangan](#-catatan-pengembangan)

### Fitur Utama:

- 🔐 Autentikasi pengguna (Dosen & Mahasiswa)
- 📝 Manajemen kelas dan tugas
- 📸 OCR untuk scan jawaban tulisan tangan
- 🤖 Penilaian otomatis menggunakan AI
- 📊 Dashboard monitoring nilai
- 👥 Manajemen peserta kelas

## 👥 Tim Pengembang

| Divisi          | Anggota Tim                      |
| --------------- | -------------------------------- |
| 🎨 **UI/UX**    | Muhammad Azhar Aziz              |
|                 | Christoforus Indra Bagus Pratama |
|                 | Nadin Nabil Hafizh Ayyasy        |
| 🎨 **Frontend** | Alvin Zanua Putra                |
| ⚙️ **Backend**  | Pramuditya Faiz Ardiansyah       |
|                 | Alvin Zanua Putra                |
| 🤖 **AI**       | Muh. Buyung Saloka               |
|                 | Choirul Anam                     |
|                 | Rachmat Ramadhan                 |

## 🛠 Teknologi yang Digunakan

### Frontend

- Next.js 15.5.4
- React 19.1.0
- TypeScript
- Tailwind CSS
- React Query (TanStack Query)

### Backend

- FastAPI
- SQLModel & SQLAlchemy
- PostgreSQL
- FastAPI Users (Authentication)
- Pydantic

### Artificial Intelligence / Machine Learning

- Ollama (LLM)
- Sentence Transformers
- OCR Services

## 📁 Struktur Project

```
grademind/
├── backend/          # FastAPI REST API
├── frontend/         # Next.js Web Application
├── grader-ai/        # AI Grading Service dengan Ollama
└── tr-ocr/           # OCR Processing Service
```

## 🚀 Instalasi

### Prerequisites

Pastikan Anda telah menginstal:

- Node.js (v18 atau lebih baru)
- Python 3.8+
- PostgreSQL
- Docker (optional, untuk PostgreSQL)
- Ollama (untuk AI Grading)
- Rekomendasi Jalankan Project Ini Di Linux

### 1. Backend Setup

```powershell
# Buat virtual environment
python -m venv .venv
.\.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup database dengan Docker (optional)
docker run --name grademind-postgres -e POSTGRES_PASSWORD=admin1234 -e POSTGRES_USER=postgres -e POSTGRES_DB=grademind -p 5432:5432 -d postgres

# Konfigurasi environment
copy .env.example .env
# Edit file .env dan sesuaikan DATABASE_URL serta SECRET_KEY
```

**Contoh .env:**

```env
DATABASE_URL=postgresql+asyncpg://grademind:admin1234@localhost:5432/grademind
SECRET_KEY=your-secret-key-here
```

### 2. Frontend Setup

```powershell
# Masuk ke folder frontend
cd frontend

# Install dependencies
npm install

# Konfigurasi environment
copy .env.example .env
# Edit file .env dan sesuaikan API URL
```

**Contoh .env:**

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. AI Grader Setup

```powershell
# Virtual venv
.\.venv\Scripts\activate

# Masuk ke folder grader-ai
cd grader-ai

# Install dependencies
pip install -r requirements.txt

# Install Ollama
# Download dari: https://ollama.ai
# Setelah install, jalankan model yang dibutuhkan:
ollama pull llama2
```

## ▶️ Menjalankan Aplikasi

### Jalankan Backend

```powershell
.\.venv\Scripts\activate
cd backend
uvicorn main:app --reload
```

Backend akan berjalan di: `http://localhost:8000`
API Docs: `http://localhost:8000/docs`

### Jalankan Frontend

```powershell
cd frontend
npm run build
npm run dev
```

Frontend akan berjalan di: `http://localhost:3000`

### Jalankan AI Grader (Rekomendasi Di Linux OS)

```powershell
.\.venv\Scripts\activate
cd grader-ai
python ollama_auto_grader.py
```

## 📝 Catatan Pengembangan

### Backend

- API documentation tersedia di `/docs` endpoint
- Semua secret keys harus disimpan di `.env` (jangan commit!)
- Gunakan virtual environment untuk isolasi dependencies
- Tambahkan dependencies baru ke `requirements.txt`

### Frontend

- Gunakan React Query untuk data fetching
- Komponen reusable tersedia di folder `src/components`
- API client configuration di `src/lib/api-client.ts`

### AI Grader

- Pastikan Ollama service sudah running
- Model dapat disesuaikan di konfigurasi
- Benchmark model tersedia di `similarity_model_benchmark.py`

---

## `NOTE FOR LINUX`

## With 

```bash
# cek
sudo systemctl status postgresql
# start
sudo systemctl start postgresql
# jika aktif setiap boot
sudo systemctl enable postgresql
# jika ingin nonaktif
sudo systemctl disable postgresql
```

## Adminer Tools Database PostgreSQL

```bash
git clone https://github.com/vrana/adminer.git

cd adminer

php -S localhost:8080

# buka http://localhost:8080/adminer/index.php
```

## Running PostgreSQL In Local

```bash
psql --version
sudo apt update
sudo apt install postgresql postgresql-contrib -y

# Jalankan service
sudo systemctl start postgresql
# Lalu set agar otomatis jalan saat boot:
sudo systemctl enable postgresql
# cek status
sudo systemctl status postgresql


# Masuk ke user postgres
sudo -i -u postgres

# Masuk ke shell postgreSQL
psql

# Perintah SQL
\l        -- lihat daftar database
\du       -- lihat daftar user
CREATE DATABASE tes_db;
CREATE USER alvin WITH PASSWORD 'admin123';
GRANT ALL PRIVILEGES ON DATABASE tes_db TO alvin;

\q
```


## With Docker Container

```bash
docker run --name grademind-postgres \
  -e POSTGRES_PASSWORD=admin1234 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=grademind \
  -p 5432:5432 \
  -d postgres

docker ps
# CONTAINER ID   IMAGE      COMMAND                  STATUS         PORTS                    NAMES
# a1b2c3d4e5f6   postgres   "docker-entrypoint.s…"   Up 5 seconds   0.0.0.0:5432->5432/tcp   grademind-postgres

docker start grademind-postgres
docker exec -it grademind-postgres psql -U postgres -d grademind
grademind=#
```

## venv

```bash
source venv/bin/activate
```

## setup ollama

```bash
# install ollama
curl -fsSL https://ollama.com/install.sh | sh

# cek status
sudo systemctl status ollama

# aktifin
sudo systemctl start ollama

# nonaktif
sudo systemctl stop ollama

# pull dari internet
ollama pull qwen2.5:3b-instruct

# test
ollama list

# running
ollama run qwen2.5:3b-instruct
```

## hasil 

```bash
(venv) azanu-asus@azanu-asus:~/GRADEMIND/main/grader-ai$ sudo systemctl status ollama
● ollama.service - Ollama Service
     Loaded: loaded (/etc/systemd/system/ollama.service; enabled; preset: enabled)
     Active: active (running) since Mon 2025-10-27 00:44:28 WIB; 5min ago
   Main PID: 228386 (ollama)
      Tasks: 12 (limit: 18317)
     Memory: 100.9M (peak: 338.1M)
        CPU: 1.181s
     CGroup: /system.slice/ollama.service
             └─228386 /usr/local/bin/ollama serve

Oct 27 00:44:28 azanu-asus ollama[228386]: Couldn't find '/usr/share/ollama/.ollama/id_ed25519'. Gener>
Oct 27 00:44:28 azanu-asus ollama[228386]: Your new public key is:
Oct 27 00:44:28 azanu-asus ollama[228386]: ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFHIwIJToxwEc6LL/phvPKC>
Oct 27 00:44:28 azanu-asus ollama[228386]: time=2025-10-27T00:44:28.633+07:00 level=INFO source=routes>
Oct 27 00:44:28 azanu-asus ollama[228386]: time=2025-10-27T00:44:28.634+07:00 level=INFO source=images>
Oct 27 00:44:28 azanu-asus ollama[228386]: time=2025-10-27T00:44:28.634+07:00 level=INFO source=images>
Oct 27 00:44:28 azanu-asus ollama[228386]: time=2025-10-27T00:44:28.634+07:00 level=INFO source=routes>
Oct 27 00:44:28 azanu-asus ollama[228386]: time=2025-10-27T00:44:28.635+07:00 level=INFO source=runner>
Oct 27 00:44:29 azanu-asus ollama[228386]: time=2025-10-27T00:44:29.488+07:00 level=INFO source=types.>
Oct 27 00:44:29 azanu-asus ollama[228386]: time=2025-10-27T00:44:29.488+07:00 level=INFO source=routes>

(venv) azanu-asus@azanu-asus:~/GRADEMIND/main/grader-ai$ ollama pull qwen2.5:3b-instruct
pulling manifest 
pulling manifest 
pulling 5ee4f07cdb9b: 100% ▕█████████████████████████████████████████████████████████████████▏ 1.9 GB                         
pulling 66b9ea09bd5b: 100% ▕█████████████████████████████████████████████████████████████████▏   68 B                         
pulling eb4402837c78: 100% ▕█████████████████████████████████████████████████████████████████▏ 1.5 KB                         
pulling b5c0e5cf74cf: 100% ▕█████████████████████████████████████████████████████████████████▏ 7.4 KB                         
pulling 161ddde4c9cd: 100% ▕█████████████████████████████████████████████████████████████████▏  487 B                         
verifying sha256 digest 
writing manifest 
success  
(venv) azanu-asus@azanu-asus:~/GRADEMIND/main/grader-ai$ ollama run qwen2.5:3b-instruct
>>> apa itu coding
Coding merujuk kepada proses membuat instruksi atau perintah bagi mesin komputer untuk dapat menjalankan program atau 
aplikasi yang diinginkan. Ini biasanya dilakukan menggunakan bahasa pemrograman, sebuah cara formal dan struktual dari 
menulis kode.

Beberapa hal penting tentang coding:

1. Tujuan: Coding bertujuan membuat alat bantu manusia (seperti perangkat lunak atau program) agar bisa melakukan tugas 
tertentu.
2. Bahasa Pemrograman: Ini adalah "bahasa" yang digunakan oleh programmer untuk berkomunikasi dengan komputer. Beberapa 
contoh bahasa pemrograman populer termasuk Python, Java, C++, JavaScript, dan lainnya.
3. Struktur Coding: Setiap bahasa pemrograman memiliki struktur dan aturan tertentu yang harus diikuti saat membuat kode.
4. Pengembangan Software: Proses coding seringkali merupakan bagian dari pengembangan software atau aplikasi.

Coding membutuhkan pengetahuan teknis, keterampilan logika, serta kemampuan untuk merumuskan masalah dalam bahasa 
pemrograman. Semua kode yang dibuat oleh programmer bisa diubah menjadi program komputer yang berfungsi jika direkam dan 
disimpan dalam format yang dapat diterima oleh sistem operasi atau perangkat lainnya.

>>> 
```

### running ollama test python

```bash
cd grader-ai

# untuk auto grading dari fast api route ke localhost
python3 ollama_auto_grader.py

# untuk membadingkan hasil similarity presisi nya
python3 similarity_model_benchmark.py
```

## hasil

```bash
(venv) azanu-asus@azanu-asus:~/GRADEMIND/main/grader-ai$ python3 ollama_auto_grader.py 

🧠 Memuat model embedding MiniLM di cuda...
modules.json: 100%|███████████████████████████████████████████████████████████████████████████| 349/349 [00:00<00:00, 1.10MB/s]
config_sentence_transformers.json: 100%|███████████████████████████████████████████████████████| 116/116 [00:00<00:00, 635kB/s]
README.md: 10.5kB [00:00, 3.97MB/s]
sentence_bert_config.json: 100%|████████████████████████████████████████████████████████████| 53.0/53.0 [00:00<00:00, 30.6kB/s]
config.json: 100%|████████████████████████████████████████████████████████████████████████████| 612/612 [00:00<00:00, 4.81MB/s]
model.safetensors: 100%|██████████████████████████████████████████████████████████████████| 90.9M/90.9M [00:11<00:00, 7.81MB/s]
tokenizer_config.json: 100%|██████████████████████████████████████████████████████████████████| 350/350 [00:00<00:00, 2.64MB/s]
vocab.txt: 232kB [00:00, 5.66MB/s]
tokenizer.json: 466kB [00:00, 9.95MB/s]
special_tokens_map.json: 100%|████████████████████████████████████████████████████████████████| 112/112 [00:00<00:00, 52.4kB/s]
config.json: 100%|████████████████████████████████████████████████████████████████████████████| 190/190 [00:00<00:00, 1.04MB/s]
✅ Model MiniLM siap digunakan (load time 19.25 detik)

/home/azanu-asus/GRADEMIND/main/grader-ai/ollama_auto_grader.py:328: DeprecationWarning: 
        on_event is deprecated, use lifespan event handlers instead.

        Read more about it in the
        [FastAPI docs for Lifespan Events](https://fastapi.tiangolo.com/advanced/events/).
        
  @app.on_event("startup")
Starting Ollama Hybrid Auto-Grader on http://127.0.0.1:5555

🧠 Memuat model embedding MiniLM di cuda...
✅ Model MiniLM siap digunakan (load time 4.26 detik)

INFO:     Started server process [231213]
INFO:     Waiting for application startup.

🚀 Melakukan warm-up sistem Auto-Grader...
🔹 Warm-up Ollama Instruct...
✅ Ollama Instruct siap (waktu: 1.46 detik)
🔹 Warm-up MiniLM embedding...
✅ Embedding siap (waktu: 0.01 detik)
🔥 Semua komponen siap digunakan!

INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:5555 (Press CTRL+C to quit)
^CINFO:     Shutting down
INFO:     Waiting for application shutdown.
INFO:     Application shutdown complete.
INFO:     Finished server process [231213]


# UJI SIIMILARITY
(venv) azanu-asus@azanu-asus:~/GRADEMIND/main/grader-ai$ python3 similarity_model_benchmark.py 
🧠 Benchmarking Semantic Similarity Models (CUDA Mode)...

📊 HASIL PER STUDENT CASE:
                       Model Student  Similarity  Load Time (ms)  Inference Time (ms) Device  GPU Mem (MB)
bert-base-multilingual-cased  Case 1      0.9361        93400.29                23.51 cuda:0        687.86
bert-base-multilingual-cased  Case 2      0.8757        93400.29                24.97 cuda:0        687.86
bert-base-multilingual-cased  Case 3      0.7766        93400.29                35.45 cuda:0        687.86
bert-base-multilingual-cased  Case 4      0.9119        93400.29                32.79 cuda:0        687.86
bert-base-multilingual-cased  Case 5      0.8746        93400.29                19.32 cuda:0        687.86
bert-base-multilingual-cased  Case 6      0.8358        93400.29                21.39 cuda:0        687.86
           all-mpnet-base-v2  Case 1      0.9225        64929.26                78.64 cuda:0       1107.21
           all-mpnet-base-v2  Case 2      0.8805        64929.26                21.47 cuda:0       1107.21
           all-mpnet-base-v2  Case 3      0.7251        64929.26                19.72 cuda:0       1107.21
           all-mpnet-base-v2  Case 4      0.9282        64929.26                30.27 cuda:0       1107.21
           all-mpnet-base-v2  Case 5      0.8499        64929.26                19.15 cuda:0       1107.21
           all-mpnet-base-v2  Case 6      0.6984        64929.26                18.84 cuda:0       1107.21
                       LaBSE  Case 1      0.8516       276096.56                39.76 cuda:0       2906.19
                       LaBSE  Case 2      0.7454       276096.56                13.50 cuda:0       2906.19
                       LaBSE  Case 3      0.5787       276096.56                13.57 cuda:0       2906.19
                       LaBSE  Case 4      0.8555       276096.56                22.44 cuda:0       2906.19
                       LaBSE  Case 5      0.7043       276096.56                12.58 cuda:0       2906.19
                       LaBSE  Case 6      0.5671       276096.56                13.21 cuda:0       2906.19
                 E5-small-v2  Case 1      0.9497        78107.06                11.65 cuda:0        458.57
                 E5-small-v2  Case 2      0.9360        78107.06                10.23 cuda:0        458.57
                 E5-small-v2  Case 3      0.8907        78107.06                10.00 cuda:0        458.57
                 E5-small-v2  Case 4      0.9618        78107.06                10.19 cuda:0        458.57
                 E5-small-v2  Case 5      0.9346        78107.06                10.24 cuda:0        458.57
                 E5-small-v2  Case 6      0.8954        78107.06                10.77 cuda:0        458.57
                  E5-base-v2  Case 1      0.9580       143248.08                41.04 cuda:0       1071.16
                  E5-base-v2  Case 2      0.9305       143248.08                12.97 cuda:0       1071.16
                  E5-base-v2  Case 3      0.8507       143248.08                13.89 cuda:0       1071.16
                  E5-base-v2  Case 4      0.9542       143248.08                19.06 cuda:0       1071.16
                  E5-base-v2  Case 5      0.9126       143248.08                12.64 cuda:0       1071.16
                  E5-base-v2  Case 6      0.8788       143248.08                12.53 cuda:0       1071.16
                      MiniLM  Case 1      0.8693         3675.65                 8.25 cuda:0       1157.81
                      MiniLM  Case 2      0.8649         3675.65                 6.28 cuda:0       1157.81
                      MiniLM  Case 3      0.6292         3675.65                 7.83 cuda:0       1157.81
                      MiniLM  Case 4      0.8452         3675.65                 7.23 cuda:0       1157.81
                      MiniLM  Case 5      0.8012         3675.65                10.45 cuda:0       1157.81
                      MiniLM  Case 6      0.6216         3675.65                 6.16 cuda:0       1157.81

📊 STATISTIK RINGKASAN PER MODEL:
                       Model  Avg Similarity  Min Similarity  Max Similarity  Std Dev
                  E5-base-v2        0.914133          0.8507          0.9580 0.042596
                 E5-small-v2        0.928033          0.8907          0.9618 0.028896
                       LaBSE        0.717100          0.5671          0.8555 0.126384
                      MiniLM        0.771900          0.6216          0.8693 0.116035
           all-mpnet-base-v2        0.834100          0.6984          0.9282 0.099365
bert-base-multilingual-cased        0.868450          0.7766          0.9361 0.056670

💾 CSV kasus siswa disimpan sebagai benchmark_cases_cuda.csv
💾 CSV ringkasan disimpan sebagai benchmark_summary_cuda.csv

```


**Last Updated:** October 2025
Copy Right C 2025 