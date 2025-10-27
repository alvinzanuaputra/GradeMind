# TODO NOTUL SALOKA

PERLU DIPERBAIKI
- set KKM
- jawaban sementara simpan di session/cookies (biar kalo refresh ga ilang)
- tombil liat analisis jangan di bawah
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
- buat ekspor hasil ujian saja dari database , maybe data dalam excel import dari pandas export xlsx
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