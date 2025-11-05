# GradeMind

**GradeMind** adalah platform web-based yang mengintegrasikan teknologi Artificial Intelligence untuk mengotomatisasi proses penilaian jawaban esai mahasiswa. Sistem ini menggabungkan teknologi Optical Character Recognition (OCR) untuk digitalisasi tulisan tangan dan Large Language Model (LLM) berbasis Ollama untuk analisis dan penilaian jawaban secara otomatis.

## Fitur Utama

- Autentikasi pengguna (Dosen & Mahasiswa)
- Manajemen kelas dan tugas
- OCR untuk scan jawaban tulisan tangan
- Penilaian otomatis menggunakan AI
- Dashboard monitoring nilai
- Manajemen peserta kelas

## Daftar Isi

- [Tim Pengembang](#tim-pengembang)
- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Struktur Project](#struktur-project)
- [Instalasi](#instalasi)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-setup)
  - [Frontend Setup](#2-frontend-setup)
  - [AI Grader Setup](#3-ai-grader-setup)
  - [Database Setup](#4-database-setup)
  - [Ollama Setup](#5-ollama-setup)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Database Seeding](#database-seeding)
- [Benchmark & Perbandingan Model](#benchmark--perbandingan-model)
- [Catatan Pengembangan](#catatan-pengembangan)

## Tim Pengembang

| Divisi       | Anggota Tim                      |
| ------------ | -------------------------------- |
| **UI/UX**    | Muhammad Azhar Aziz              |
|              | Christoforus Indra Bagus Pratama |
| **Frontend** | Alvin Zanua Putra                |
| **Backend**  | Pramuditya Faiz Ardiansyah       |
|              | Alvin Zanua Putra                |
|              | Choirul Anam **(Leader)**        |
| **AI**       | Muh. Buyung Saloka               |
|              | Nadin Nabil Hafizh Ayyasy        |
|              | Rachmat Ramadhan                 |

## Teknologi yang Digunakan

### Frontend

- Next.js 15.5.4
- React 19.1.0
- TypeScript
- Tailwind CSS
- React Query (TanStack Query)

### Backend

- FastAPI
- SQLModel & SQLAlchemy (ORM Database)
- PostgreSQL
- FastAPI Users (Authentication)
- Pydantic

### Artificial Intelligence / Machine Learning

- Ollama (LLM)
- Sentence Transformers
- OCR Services

## Struktur Project

```
grademind/
├── backend/          # FastAPI REST API
├── frontend/         # Next.js Web Application
├── grader-ai/        # AI Grading Service dengan Ollama
└── tr-ocr/           # OCR Processing Service
```

## Instalasi

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
# MAIN CONFIGURATION
DATABASE_URL=postgresql+asyncpg://grademind:admin1234@localhost:5432/grademind
SECRET_KEY="YOUR_SECRET_HERE"
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:8000"

# AI CONFIGURATION
OLLAMA_URL="URL"
USE_LONG_PROMPT="TRUE"
OLLAMA_MODEL="YOUR_OLLAMA_MODEL_HERE"
EMBEDDING_MODEL_NAME="YOUR_EMBEDDING_MODEL_NAME_HERE"

# TUNNEL AND AI SETTINGS
AI_TUNNEL_URL="YOUR_TUNNEL_URL_HERE"
AI_MODEL="YOUR_AI_MODEL_HERE"
AI_TIMEOUT="YOUR_TIMEOUT_TIMENUMBER_HERE"
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
# NEXTAUTH CONFIG
NEXTAUTH_SECRET="YOUR_AUTH_SECRET_HERE"

# BACKEND API URL
NEXT_PUBLIC_API_URL="http://localhost:8000"

# FRONTEND URL
NEXT_PUBLIC_FRONTEND_URL="http://localhost:3000"
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

## Menjalankan Aplikasi

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

### with pm2
```bash
# install pm2 (global)
npm install -g pm2

# masuk ke folder frontend dan build untuk production
cd frontend
npm run build

# jalankan Next.js (production) lewat PM2
pm2 start npm --name grademind -- start
# alternatif (setara):
# pm2 start "npm run start" -n grademind

# mode development (opsional)
pm2 start npm --name nextjs-dev -- run dev

# lihat semua proses
pm2 list

# lihat log realtime untuk app tertentu
pm2 logs grademind

# kontrol proses
pm2 restart grademind
pm2 stop grademind
pm2 delete grademind

# simpan proses agar autostart saat boot
pm2 save

# opsional: generate & tampilkan perintah untuk enable autostart di sistem Anda
pm2 startup
```

Frontend akan berjalan di: `http://localhost:3000`

### Jalankan AI Grader (Rekomendasi Di Linux OS)

```powershell
.\.venv\Scripts\activate
cd grader-ai
python ollama_auto_grader.py
```

## Catatan Pengembangan

### Backend

- API documentation tersedia di `/docs` endpoint
- Semua secret keys harus disimpan di `.env` (jangan commit!)
- Jangan virtual environment `(venv)`
- Tambahkan dependencies baru ke `requirements.txt`
- Contoh Database Monitoring `adminer`, `dbeaver`, dll

### Frontend

- React Query untuk data fetching
- Komponen mekanisme reuse di folder `src/components`
- API client configuration di `src/lib/api-client.ts`

### AI Grader

- Pastikan Ollama service sudah running
- Model dapat disesuaikan di konfigurasi
- Benchmark model tersedia di `similarity_model_benchmark.py`

---

# Catatan untuk Linux Ubuntu

### PostgreSQL Service Management 

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

## Virtual Environment Python `venv`

```bash
source venv/bin/activate
```


## Seeders Database 

Jangan lupa chmod+x file sh nya lalu jalankan sh didalam folder `/backend/services/seeders`
tunggu sampai selesai

```bash
(venv) azanu-asus@azanu-asus:~/GRADEMIND/main/backend/services/seeders$ ./run_seeder.sh

# disini muncul output ORM dari sqlalchemy

============================================================
 Database seeding completed successfully!
============================================================

 Summary:
   - Total Users: 10992
   - Dosen: 69
   - Mahasiswa: 10923 (33 departemen × 331)
   - Classes: 15
   - Assignments: 46
   - Questions: 180

 Login credentials:
   - Dosen: [username dari nama]@grademind.edu / admin1234
   - Mahasiswa: [NRP]@grademind.edu / user1234

 Contoh Login:
   - Dosen: Cek database untuk username spesifik / admin1234
   - Mahasiswa: 5001231001@grademind.edu / user1234
   - Format NRP: PPPPYYIXXX (Dept: 5001-5033, Index: 001-331)
============================================================


Done!

================================================
  Login Credentials
================================================

Total Users: ~11,000+ (69 Dosen + 10,923 Mahasiswa)

Dosen (69 accounts):
  Password: admin1234
  Username: [nama tanpa spasi, lowercase]
  Email: [username]@grademind.edu
  Contoh: budisantoso / admin1234

Mahasiswa (10,923 accounts = 33 dept × 331):
  Password: user1234
  Format: [NRP]/user1234 (atau [NRP]@grademind.edu/user1234)
  Format NRP: PPPPYYIXXX (10 digit)

  Contoh Login:
    5001231001/user1234 (Dept 5001, index 001)
    5012241331/user1234 (Dept 5012, index 331)
    5033251155@grademind.edu/user1234 (Dept 5033, index 155)

Catatan:
  - Setiap departemen (5001-5033) punya 331 mahasiswa
  - Dosen username dari nama (tanpa spasi, lowercase)
  - Mahasiswa username = NRP
  - Cek database untuk username/NRP spesifik
================================================
```

## Setup Ollama

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

## Hasil 

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

### Running ollama test python

```bash
cd grader-ai

# untuk auto grading dari fast api route ke localhost
python3 ollama_auto_grader.py

# untuk membadingkan hasil similarity presisi nya
python3 similarity_model_benchmark.py
```

## Hasil

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
```

### Ollama grader AI akan berjalan di: `http://localhost:5555/grade`


## UJI SIIMILARITY

```bash
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

## Tabel Perbandingan Similarity

### Perbandingan Model Similarity (Embedding)

Berikut adalah hasil benchmark dari berbagai model semantic similarity yang diuji menggunakan GPU (CUDA):

| Model | Avg Similarity | Min Similarity | Max Similarity | Std Dev | Load Time (ms) | Avg Inference (ms) | GPU Memory (MB) |
|-------|----------------|----------------|----------------|---------|----------------|-------------------|-----------------|
| **E5-base-v2** | **0.9141** | 0.8507 | 0.9580 | 0.0426 | 143,248.08 | 18.69 | 1,071.16 |
| **E5-small-v2** | **0.9280** | 0.8907 | 0.9618 | 0.0289 | 78,107.06 | 10.51 | 458.57 |
| LaBSE | 0.7171 | 0.5671 | 0.8555 | 0.1264 | 276,096.56 | 19.18 | 2,906.19 |
| MiniLM | 0.7719 | 0.6216 | 0.8693 | 0.1160 | 3,675.65 | 7.70 | 1,157.81 |
| all-mpnet-base-v2 | 0.8341 | 0.6984 | 0.9282 | 0.0994 | 64,929.26 | 31.35 | 1,107.21 |
| bert-base-multilingual | 0.8685 | 0.7766 | 0.9361 | 0.0567 | 93,400.29 | 26.24 | 687.86 |

**Keterangan:**
- Similarity Score: Range 0-1 (semakin tinggi semakin baik)
- Load Time: Waktu loading model pertama kali
- Inference Time: Rata-rata waktu pemrosesan per case

### Perbandingan Model LLM (Ollama)

Hasil benchmark dari berbagai Large Language Model yang diuji untuk auto-grading:

| Model LLM | Developer | Size | Avg Error | Avg Inference Time (s) | Keterangan |
|-----------|-----------|------|-----------|----------------------|------------|
| **Qwen 2.5 3B** | Alibaba | 1.9 GB | **8.81** | **1.868** | **Winner - Best Balance** |
| Llama3.2 3B | Meta | 2.0 GB | 10.20 | 2.134 | Fast & Accurate |
| Phi-3 Mini (3.8B) | Microsoft | 2.2 GB | 23.63 | 4.225 | Consistent but slower |
| Mistral 7B | Mistral AI | 4.4 GB | 18.26 | 4.411 | Good for complex |
| Llama 3 8B | Meta | 4.7 GB | 14.38 | 4.337 | Large but accurate |
| Qwen 2.5 7B | Alibaba | 4.7 GB | 11.32 | 5.416 | Accurate but slow |
| Gemma 7B | Google | 5.0 GB | 12.75 | 16.502 | Slowest inference |
| Gemma 2B | Google | 1.7 GB | 23.50 | 1.148 | Fast but inconsistent |

**Keterangan:**
- Error: Rata-rata selisih dari ground truth (semakin rendah semakin baik)
- Size: Ukuran model yang perlu diunduh
- Inference Time: Waktu rata-rata untuk grading per soal

### Rekomendasi

**Untuk Production:**
- **LLM**: Qwen 2.5 3B (Balance terbaik antara akurasi dan kecepatan)Institut Teknologi Sepuluh Nopember

- **Similarity**: E5-small-v2 (Akurasi tinggi dengan inference cepat)

**Untuk Development/Testing:**
- **LLM**: Llama3.2 3B (Cepat dan cukup akurat)
- **Similarity**: MiniLM (Load time tercepat, cocok untuk iterasi cepat)

**Untuk Maximum Accuracy:**
- **LLM**: Qwen 2.5 7B atau Llama 3 8B
- **Similarity**: E5-base-v2 (Akurasi tertinggi)



<br>


---



# **GradeMind** - Automated Essay Grading with AI
