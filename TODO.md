# TODO NOTUL SALOKA

PERLU DIPERBAIKI
- set KKM
- jawaban sementara simpan di session/cookies (biar kalo refresh ga ilang)
- tombol liat analisis jangan di bawah
- button tema ilang
- salah warna KKM di student view
- persentase similarity salah
- auto fetch kalo ada data baru
- kasih pilihan role pas regist
- tampilan similarity diganti ke hasil akhir
- tidak lulus ada minus 1
- persentase kelulusan 102% wkwkwk
- perbaiki warna warna
- buat ekspor hasil ujian

AI
- nurunin aspek similarity
- regresiin nilai biar lebih masuk akal
- hindari prompt injection

## FAIZ

known bugs:
1. takutnya ada page yg masih salah routing namanya (karna habis diganti namanya)
2. edit assignment bug, z-index nya yg salah kayanya
3. hapus peserta dari kelas (blom tau penyebabnya)


# TODO Details

PERLU DIPERBAIKI
- set KKM
- jawaban sementara disimpan di session/cookies (biar kalo refresh tidak hilang jawabannya waktu ketik) 
- tombol lihat analisis jangan di bawah, sudah
- button tema hilang (optional frontend) => fix diganti tema putih only
- salah warna KKM di student view -> pastikan nilai KKM terinput di database misal 75 ya 75, 55 yaa 55  
- persentase similarity salah
- auto fetch kalo ada data baru
- kasih pilihan role waktu register => done
- tampilan similarity diganti ke hasil akhir
- tidak lulus ada -1, bug 
- persentase kelulusan 102% wkwkwk
- perbaiki warna warna => aman 
- buat ekspor hasil ujian saja dari database excel untuk dosen sebagai backup , maybe data dalam excel import dari pandas export xlsx
- jawaban ngga ada enter -. freeland ke database space wrap freeland
- grafik 75-80-85

Tambahan : jika menggunakan oautuh Google atau Github role terset otomatis menjadi MAHASISWA

AI
- nurunin aspek similarity
- regresiin nilai biar lebih masuk akal
- hindari prompt injection


# bug founded fix

- saat membuat kelas tidak perlu refresh lagi, auto fetch
- menghilangkan mode dark, sekarang statis di mode light
- berhasil menerapkan session di ketik jawaban mahasiswa agar live session
- fitur hapus akun dihapus , menghindari bug lur
- fetch dari rata rata LLM

<!-- wefwefwefwefwef -->

oke disini saya ada beberapa tugas untuk anda 
1. Ubah tampilan frontend menjadi luar biasa dan elegan, tambahkan shadown atau semacamnya bebas sekreatif mungkin yang sekiranya nyaman dipanddang oleh user dan jangan terlalu berwarna warni juga, untuk warna RANDOM_URUT_CLASSES jangan dihilngkan biarin, oke pokoknya ubah semua design fronted baik di dalam folder app dan components atau yang lain
2. Hapus footer di semua page karena footer sudah saya taruh di layout.tsx agar footer tidak ganda
3. a) Buat tampilan grafik histogram di frontend di page /kelas/7/tugas/5/hasil-penilaian untuk role dosen yaitu Total Submisi, Dinilai, Nilai Minimal, Rata-rata, Tertinggi
   b) Buat tampilan grafik histogram di frontend di page /kelas/7/tugas/5/hasil-penilaian/3 untuk role mahasiswa yaitu untuk skor rubrik terdiri dari : Pemahaman, Kelengkapan, Kejelasan, 
      Analisis, Similarity Score
   c) Beri nilai value pengganti jika kosong jangan tampilkan "0" tampilkan skor rubrik anda "0"
   NB : untuk grafik buat formatnya : 75-80-85 rentang 5
4. Fix dibagian page saat mahasiswa menjawab soal di kolom jawaban mereka jawabanya ka ngga ada enter ubah agar freeland ke database space wrap freeland, jadi di database juga tersimpan spasi nya gunakan
   global.css atau tailwind bebas
5. buat ekspor hasil ujian saja dari database excel untuk dosen sebagai backup
6. known bugs : - tampilan similarity diganti ke hasil akhir saja, tidak lulus ada yang -1, bug persentase kelulusan 102% di hasil penilaian semua mahsiswa, salah warna KKM di student view -> pastikan nilai KKM terinput di database misal 75 ya 75, 55 yaa 55 


<!-- ====================================================== -->
semua list mahasiswa bisa dicatata ke dalam bentuk excel, dan data itu hanya berasal dari role mahasiswa saja berikut data yang harus anda ambil untuk role mahasiswa

Header :
- Nama dari kelas : misal "Jaringan Komputer"
- Nama tugas : misal "ETS", "Quiz 1", "Tugas 1"
- KKM : misal "75", "65", "55"

Rows :
- NRP
- Nama Lengkap Mahasiswa
- Nama Pengguna
- Nilai
- Jawaban soal 1
- Jawaban soal 2
- dst

NB : sudah saya kirim contoh format excel nya
untuk format penamaan file adalah
NAMAKELAS_TIPE TUGAS_TIMESTAMP BERUPA TANGGAL.xlsx





<!-- Penambahan NRP ke Database -->

Untuk mekanisme penambahan data kolom NRP ke users pada database adalah, jadi disini ada 2 tipe login yaitu auth dan oauth


- untuk auth, jadi pada halaman register setelah memasukkan semua data pada form, dan klik daftar akan ada halaman lagi yaitu input NRP satu form bernama NRP, dan ada opsi apakah anda seorang mahasiswa ITS,  jika tidak lewati. Jadi NRP ini optional tidak unique
- untuk oauth setelah klik google maupun github, ada tambahan input NRP juga seperti auth.

NOTE : ada atau tidaknya NRP ini khusus role mahasiswa, jika mode nya dosen tidak ada, jadi di database ketika memilih dosen isi dengan NULL

- serta tambahkan di page profil juga untuk mengedit


<!-- LOGIN VALIDATION -->

- untuk login/masuk di input email ganti dengan input yaitu bisa Nama Pengguna/Email Pengguna







<!-- fetch llm score -->

untuk di rata rata samping similarity, ubah ke fetch dari grading "rata_rata": llm_score_avg,, lewat backend kemudian ke frontend