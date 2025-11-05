"""
Database Seeder Service
Seeder untuk mengisi database dengan data dummy realistis

DATA YANG DI-GENERATE:
- ~11,000+ Users total:
  * 69 Dosen (coverage untuk semua departemen)
  * 10,923 Mahasiswa data (33 departemen × 331 mahasiswa)
- Kelas dengan relasi dosen dan mahasiswa
- Assignment dengan questions
- Submissions dengan answers dan nilai otomatis

FORMAT DATA:
- Dosen: Username dari nama (tanpa spasi, lowercase), Password: admin1234
- Mahasiswa: Username = NRP (PPPPYYIXXX), Password: user1234
- NRP Format: Dept(5001-5033) + Tahun(19-25) + Batch(1) + Index(001-331)
"""

import asyncio
import random
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, select
from passlib.context import CryptContext
from faker import Faker 
from core.db import SessionLocal, create_tables
from models.user_model import User, UserRole
from models.kelas import Kelas
from models.class_participant import ClassParticipant
from models.assignment import Assignment, AssignmentType
from models.question import Question
from models.assignment_submission import AssignmentSubmission, SubmissionType
from models.question_answer import QuestionAnswer
from models.nilai import Nilai

# init local fake dari indonesia
fake = Faker('id_ID')  
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Data constants
SUBJECTS = [
    "Pemrograman Web", "Basis Data", "Algoritma dan Struktur Data",
    "Jaringan Komputer", "Sistem Operasi", "Kecerdasan Buatan",
    "Machine Learning", "Data Mining", "Sistem Terdistribusi",
    "Keamanan Informasi", "Pemrograman Mobile", "Cloud Computing"
]

INSTITUTIONS = [
    "Institut Teknologi Sepuluh Nopember",
    "Universitas Gadjah Mada",
    "Institut Teknologi Bandung",
    "Universitas Indonesia",
    "Universitas Brawijaya"
]

ASSIGNMENT_TITLES = [
    "Implementasi REST API",
    "Analisis Kompleksitas Algoritma",
    "Desain Database Relasional",
    "Keamanan Aplikasi Web",
    "Optimasi Query Database",
    "Implementasi Neural Network",
    "Clustering dengan K-Means",
    "Routing Protocol Analysis",
    "Concurrency dan Threading",
    "Cryptography Implementation"
]

QUESTIONS_POOL = [
    {
        "text": "Jelaskan konsep dan implementasi RESTful API beserta best practices yang harus diperhatikan!",
        "answer": "RESTful API adalah arsitektur yang menggunakan HTTP methods (GET, POST, PUT, DELETE) untuk operasi CRUD. Best practices meliputi: menggunakan noun untuk endpoint, versioning API, proper status codes, stateless authentication, dan dokumentasi yang jelas."
    },
    {
        "text": "Apa perbedaan antara SQL dan NoSQL database? Berikan contoh use case masing-masing!",
        "answer": "SQL database bersifat relasional dengan skema terstruktur, cocok untuk transaksi kompleks. NoSQL lebih fleksibel, cocok untuk big data dan scalability horizontal. Contoh: SQL untuk sistem banking, NoSQL untuk social media feeds."
    },
    {
        "text": "Jelaskan perbedaan antara kompleksitas waktu O(n) dan O(log n) dengan contoh algoritma!",
        "answer": "O(n) berarti waktu eksekusi berbanding lurus dengan input (contoh: linear search). O(log n) lebih efisien dengan waktu yang meningkat logaritmik (contoh: binary search pada array terurut)."
    },
    {
        "text": "Bagaimana cara kerja protokol TCP/IP dalam komunikasi jaringan?",
        "answer": "TCP/IP bekerja dalam layers: Application, Transport, Internet, dan Network Access. TCP menangani koneksi reliable dengan three-way handshake, segmentasi data, dan acknowledgment. IP menangani routing dan addressing."
    },
    {
        "text": "Jelaskan konsep deadlock dalam sistem operasi dan cara pencegahannya!",
        "answer": "Deadlock terjadi saat dua atau lebih proses saling menunggu resource yang dipegang oleh proses lain. Pencegahan: resource ordering, timeout mechanism, deadlock detection algorithm, atau banker's algorithm."
    },
    {
        "text": "Apa itu supervised learning dan berikan 3 contoh algoritma beserta use case-nya!",
        "answer": "Supervised learning menggunakan labeled data untuk training. Contoh: 1) Linear Regression untuk prediksi harga, 2) Decision Tree untuk klasifikasi, 3) Neural Network untuk image recognition."
    },
    {
        "text": "Jelaskan perbedaan antara classification dan clustering dalam machine learning!",
        "answer": "Classification adalah supervised learning yang memprediksi kategori berdasarkan labeled data. Clustering adalah unsupervised learning yang mengelompokkan data berdasarkan similarity tanpa label sebelumnya."
    },
    {
        "text": "Bagaimana cara kerja SQL injection dan bagaimana cara mencegahnya?",
        "answer": "SQL injection menyisipkan kode SQL berbahaya melalui input user. Pencegahan: menggunakan prepared statements, parameterized queries, input validation, ORM, dan principle of least privilege untuk database user."
    },
    {
        "text": "Jelaskan konsep normalisasi database hingga 3NF dengan contoh!",
        "answer": "Normalisasi mengurangi redundansi: 1NF (atomic values), 2NF (no partial dependency), 3NF (no transitive dependency). Contoh: tabel mahasiswa-kelas dibagi menjadi tabel terpisah dengan foreign key."
    },
    {
        "text": "Apa itu microservices architecture dan apa kelebihan serta kekurangannya?",
        "answer": "Microservices membagi aplikasi menjadi service kecil yang independent. Kelebihan: scalability, flexibility, fault isolation. Kekurangan: kompleksitas deployment, network latency, data consistency challenges."
    }
]

def generate_nrp(year: int, index: int) -> str:
    """Generate NRP berdasarkan tahun angkatan dan index mahasiswa
    Format NRP: PPPPYYIXXX
    PPPP : Program Studi (5001-5033)
    YY   : 2 digit tahun angkatan (19-25)
    I    : Program/Batch digit (1)
    XXX  : Index mahasiswa (001-333)
    Args:
        year (int): Tahun angkatan (2 digit atau 4 digit)
        index (int): Index mahasiswa (1-333)
    Returns:
        str: NRP yang di-generate
    """
    # untuk 2 digit tahun
    yy = year % 100 if year >= 100 else year
    # angkatan 2019-2025
    if yy < 19 or yy > 25:
        yy = random.randint(19, 25)
    prefixes = [f"{i:04d}" for i in range(5001, 5034)]
    prefix = random.choice(prefixes)
    cohort = f"{yy:02d}1"  # YY + program/batch digit '1'
    # index ke 1..333
    if index < 1 or index > 333:
        index = random.randint(1, 333)
    return f"{prefix}{cohort}{index:03d}"

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

async def seed_users(session: AsyncSession):
    print("Seeding pengguna...")
    users = []
    
    # Membuat 69 role dosen (untuk coverage semua departemen 5001-5033, 2-3 dosen per dept)
    print("Membuat dosen...")
    for i in range(69):
        # Generate nama tanpa gelar
        fullname = fake.name().replace("Dr. ", "").replace("Ir. ", "").replace("Prof. ", "")
        # Username dari fullname tanpa spasi dan lowercase
        username = fullname.replace(" ", "").lower()
        
        # Jika username sudah ada, tambahkan index
        temp_username = username
        counter = 1
        while any(u.username == temp_username for u in users):
            temp_username = f"{username}{counter}"
            counter += 1
        username = temp_username
        
        user = User()
        user.profile_picture = f"https://api.dicebear.com/7.x/avataaars/svg?seed=dosen{i}" # type: ignore
        user.fullname = fullname # type: ignore
        user.username = username # type: ignore
        user.email = f"{username}@grademind.edu"
        user.notelp = fake.phone_number() # type: ignore
        user.institution = random.choice(INSTITUTIONS) # type: ignore
        user.biografi = f"Dosen dengan pengalaman {random.randint(5, 20)} tahun di bidang {random.choice(SUBJECTS)}" # type: ignore
        user.user_role = UserRole.DOSEN # type: ignore
        user.hashed_password = hash_password("admin1234")
        user.is_active = True
        user.is_verified = True
        user.is_superuser = False
        user.created_at = datetime.utcnow() - timedelta(days=random.randint(200, 500)) # type: ignore
        users.append(user)
        session.add(user)
        
        # Commit setiap 20 user untuk menghindari memory issue
        if (i + 1) % 20 == 0:
            await session.commit()
            print(f"  Progress: {i + 1}/69 dosen")
    
    await session.commit()
    print(f"✓ Selesai membuat 69 dosen")
    
    # Membuat mahasiswa untuk setiap departemen (5001-5033)
    # Setiap departemen punya 331 mahasiswa (index 001-331)
    print("Membuat mahasiswa untuk semua departemen...")
    
    departments = list(range(5001, 5034))  # 5001 sampai 5033 (33 departemen)
    current_year = datetime.now().year % 100
    
    mahasiswa_count = 0
    for dept_idx, dept_code in enumerate(departments):
        print(f"  Departemen {dept_code}: Membuat 331 mahasiswa...")
        
        for student_idx in range(1, 332):  # 001 sampai 331
            year = current_year - random.randint(0, 3)  # Mahasiswa tahun 2022-2025
            
            # Generate NRP dengan format PPPPYYIXXX
            yy = year % 100 if year >= 100 else year
            if yy < 19 or yy > 25:
                yy = random.randint(19, 25)
            
            nrp = f"{dept_code:04d}{yy:02d}1{student_idx:03d}"
            
            # Generate nama tanpa gelar
            fullname = fake.name().replace("Dr. ", "").replace("Ir. ", "").replace("Prof. ", "")
            
            user = User()
            user.profile_picture = f"https://api.dicebear.com/7.x/avataaars/svg?seed=mhs{dept_code}{student_idx}" # type: ignore
            user.fullname = fullname # type: ignore
            user.username = nrp # type: ignore
            user.email = f"{nrp}@grademind.edu"
            user.notelp = fake.phone_number() # type: ignore
            user.nrp = nrp # type: ignore
            user.institution = INSTITUTIONS[0]  # type: ignore
            user.biografi = f"Mahasiswa aktif dengan minat di bidang {random.choice(['Web Development', 'Data Science', 'AI/ML', 'Cybersecurity', 'Mobile Development'])}" # type: ignore
            user.user_role = UserRole.MAHASISWA # type: ignore
            user.hashed_password = hash_password("user1234")
            user.is_active = True
            user.is_verified = True
            user.is_superuser = False
            user.created_at = datetime.utcnow() - timedelta(days=random.randint(100, 400)) # type: ignore
            users.append(user)
            session.add(user)
            mahasiswa_count += 1
            
            # Commit setiap 50 mahasiswa untuk menghindari memory issue
            if mahasiswa_count % 50 == 0:
                await session.commit()
                print(f"    Progress: {mahasiswa_count} mahasiswa telah dibuat...")
        
        print(f"  ✓ Departemen {dept_code} selesai (331 mahasiswa)")
    
    await session.commit()
    
    # Refresh all users
    print("Refreshing data...")
    for user in users:
        await session.refresh(user)
    
    total_mahasiswa = 33 * 331  # 10,923 mahasiswa
    print(f"\n✓ Selesai membuat {len(users)} pengguna total:")
    print(f"  - Dosen: 69")
    print(f"  - Mahasiswa: {mahasiswa_count} ({33} departemen × 331 mahasiswa)")
    
    return users


async def seed_classes(session: AsyncSession, users: list):
    print("Seeding kelas, mahasiswa dan dosen...")

    dosen_list = [u for u in users if u.user_role == UserRole.DOSEN]
    mahasiswa_list = [u for u in users if u.user_role == UserRole.MAHASISWA]
    classes = []
    # Membuat 15 kelas (setiap dosen bisa punya 1-2 kelas)
    for i in range(15):
        dosen = random.choice(dosen_list)
        subject = SUBJECTS[i % len(SUBJECTS)]
        
        kelas = Kelas(
            name=f"{subject} - Kelas {chr(65 + (i % 3))}",  # A, B, C
            description=f"Mata kuliah {subject}. Membahas konsep fundamental dan dasar hingga penerapan praktis di dunia nyata.",
            class_code=f"KODE{1000 + i}",
            teacher_id=dosen.id,
            created_at=datetime.utcnow() - timedelta(days=random.randint(60, 180))
        )
        classes.append(kelas)
        session.add(kelas)
    
    await session.commit()
    for kelas in classes:
        await session.refresh(kelas)
    print(f"Membuat {len(classes)} kelas-kelas")
    participants = []
    for kelas in classes:
        # Setiap kelas punya 5-15 mahasiswa
        num_students = random.randint(5, 15)
        selected_students = random.sample(mahasiswa_list, min(num_students, len(mahasiswa_list)))
        
        for student in selected_students:
            participant = ClassParticipant(
                kelas_id=kelas.id,
                user_id=student.id,
                joined_at=kelas.created_at + timedelta(days=random.randint(0, 7))
            )
            participants.append(participant)
            session.add(participant)
    
    await session.commit()
    print(f"Membuat {len(participants)} peserta kelas")
    return classes

async def seed_assignments(session: AsyncSession, classes: list):
    print("Sedang seed assignments dan questions...")
    
    assignments = []
    
    for kelas in classes:
        # Setiap kelas punya 2-4 assignments
        num_assignments = random.randint(2, 4)
        for i in range(num_assignments):
            days_ago = random.randint(10, 60)
            created = kelas.created_at + timedelta(days=random.randint(7, 30))
            assignment = Assignment(
                kelas_id=kelas.id,
                title=random.choice(ASSIGNMENT_TITLES),
                description=f"Tugas untuk menguji pemahaman konsep {random.choice(SUBJECTS).lower()}. Jawab dengan lengkap dan jelas.",
                assignment_type=random.choice([AssignmentType.TEXT_BASED, AssignmentType.FILE_BASED]),
                deadline=created + timedelta(days=random.randint(7, 14)),
                max_score=100,
                minimal_score=random.choice([70, 75, 80]),
                is_published=True,
                created_at=created
            )
            assignments.append(assignment)
            session.add(assignment)
    
    await session.commit()
    for assignment in assignments:
        await session.refresh(assignment)
    print(f"Membuat {len(assignments)} dari tugas")
    
    all_questions = []
    for assignment in assignments:
        # Setiap assignment punya 3-5 pertanyaan
        num_questions = random.randint(3, 5)
        selected_questions = random.sample(QUESTIONS_POOL, min(num_questions, len(QUESTIONS_POOL)))
        
        for idx, q in enumerate(selected_questions):
            question = Question(
                assignment_id=assignment.id,
                question_text=q["text"],
                reference_answer=q["answer"],
                question_order=idx + 1,
                points=random.choice([10, 15, 20, 25])
            )
            all_questions.append(question)
            session.add(question)
    
    await session.commit()
    print(f"Created {len(all_questions)} questions")
    return assignments, all_questions

async def seed_submissions(session: AsyncSession, assignments: list, users: list):
    print("Untuk seeding submissions, answers, and grades...")
    
    mahasiswa_list = [u for u in users if u.user_role == UserRole.MAHASISWA]
    submissions = []
    
    for assignment in assignments:
        # Mendapatkan peserta kelas
        result = await session.execute(
            text("SELECT user_id FROM class_participants WHERE kelas_id = :kelas_id"),
            {"kelas_id": assignment.kelas_id}
        )
        participant_ids = [row[0] for row in result.fetchall()]
        
        if not participant_ids:
            continue
        
        # 60-90% mahasiswa mengumpulkan tugas
        num_submissions = int(len(participant_ids) * random.uniform(0.6, 0.9))
        selected_students = random.sample(
            [m for m in mahasiswa_list if m.id in participant_ids],
            min(num_submissions, len(participant_ids))
        )
        
        for student in selected_students:
            submission = AssignmentSubmission(
                assignment_id=assignment.id,
                student_id=student.id,
                submission_type=random.choice([SubmissionType.TYPED, SubmissionType.OCR]),
                file_path=f"/uploads/submissions/{assignment.id}_{student.id}.pdf" if random.random() > 0.5 else None,
                submitted_at=assignment.created_at + timedelta(
                    days=random.randint(1, (assignment.deadline - assignment.created_at).days)
                )
            )
            submissions.append(submission)
            session.add(submission)
    
    await session.commit()

    for submission in submissions:
        await session.refresh(submission)
    print(f"Membuat {len(submissions)} tugas")
    for submission in submissions:
        # untuk mendapatkan questions dari tugas
        result = await session.execute(
            text("SELECT id, points FROM questions WHERE assignment_id = :assignment_id"),
            {"assignment_id": submission.assignment_id}
        )
        questions = result.fetchall()
        
        total_score = 0
        max_score = 0
        answers = []
        
        for question_id, points in questions:
            # Untuk generating dummy jawaban dan nilai
            rubric_pemahaman = random.uniform(65, 100)
            rubric_kelengkapan = random.uniform(65, 100)
            rubric_kejelasan = random.uniform(65, 100)
            rubric_analisis = random.uniform(65, 100)
            rubric_rata_rata = (rubric_pemahaman + rubric_kelengkapan + rubric_kejelasan + rubric_analisis) / 4
            # Skor akhir dari rata-rata rubrik
            final_score = (rubric_rata_rata / 100) * points
            
            answer = QuestionAnswer(
                submission_id=submission.id,
                question_id=question_id,
                answer_text=fake.paragraph(nb_sentences=random.randint(3, 6)),
                final_score=round(final_score, 2),
                feedback=f"Jawaban {'sangat baik' if final_score/points > 0.85 else 'baik' if final_score/points > 0.7 else 'cukup'}. " + fake.sentence(),
                rubric_pemahaman=round(rubric_pemahaman, 2),
                rubric_kelengkapan=round(rubric_kelengkapan, 2),
                rubric_kejelasan=round(rubric_kejelasan, 2),
                rubric_analisis=round(rubric_analisis, 2),
                rubric_rata_rata=round(rubric_rata_rata, 2),
                embedding_similarity=round(random.uniform(0.7, 0.95), 3),
                llm_time=round(random.uniform(0.5, 2.5), 2),
                similarity_time=round(random.uniform(0.1, 0.5), 2)
            )
            answers.append(answer)
            session.add(answer)
            
            total_score += final_score
            max_score += points
        
        # Membuat nilai keseluruhan untuk submission
        nilai = Nilai(
            submission_id=submission.id,
            total_score=round(total_score, 2),
            max_score=max_score,
            percentage=round((total_score / max_score * 100), 2) if max_score > 0 else 0,
            avg_pemahaman=round(sum(a.rubric_pemahaman for a in answers) / len(answers), 2),
            avg_kelengkapan=round(sum(a.rubric_kelengkapan for a in answers) / len(answers), 2),
            avg_kejelasan=round(sum(a.rubric_kejelasan for a in answers) / len(answers), 2),
            avg_analisis=round(sum(a.rubric_analisis for a in answers) / len(answers), 2),
            avg_embedding_similarity=round(sum(a.embedding_similarity for a in answers) / len(answers), 3),
            total_llm_time=round(sum(a.llm_time for a in answers), 2),
            total_similarity_time=round(sum(a.similarity_time for a in answers), 2),
            graded_at=submission.submitted_at + timedelta(hours=random.randint(1, 48))
        )
        session.add(nilai)
    await session.commit()
    print(f"Membuat jawaban dan nilai untuk {len(submissions)} submissions selesai.")


async def seed_database():
    print("\n" + "="*60)
    print("Memulai Database Seeder")
    print("="*60 + "\n")
    
    # Create tables
    await create_tables()
    
    session = SessionLocal()  # type: ignore
    try:
        # Seed data
        users = await seed_users(session)  # type: ignore
        classes = await seed_classes(session, users)  # type: ignore
        assignments, questions = await seed_assignments(session, classes)  # type: ignore
        await seed_submissions(session, assignments, users)  # type: ignore
    finally:
        await session.close()  # type: ignore
    
    print("\n" + "="*60)
    print(" Database seeding completed successfully!")
    print("="*60)
    print("\n Summary:")
    print(f"   - Total Users: {len(users)}")
    print(f"   - Dosen: 69")
    print(f"   - Mahasiswa: {len([u for u in users if u.user_role == UserRole.MAHASISWA])} (33 departemen × 331)")
    print(f"   - Classes: {len(classes)}")
    print(f"   - Assignments: {len(assignments)}")
    print(f"   - Questions: {len(questions)}")
    print("\n Login credentials:")
    print("   - Dosen: [username dari nama]@grademind.edu / admin1234")
    print("   - Mahasiswa: [NRP]@grademind.edu / user1234")
    print("\n Contoh Login:")
    print("   - Dosen: Cek database untuk username spesifik / admin1234")
    print("   - Mahasiswa: 5001231001@grademind.edu / user1234")
    print("   - Format NRP: PPPPYYIXXX (Dept: 5001-5033, Index: 001-331)")
    print("="*60 + "\n")


async def reset_and_seed():
    from core.db import reset_tables
    print("⚠️  WARNING: This will delete all existing data!")
    print("🔄 Resetting database...")
    await reset_tables()
    await seed_database()

if __name__ == "__main__":
    # Run seeder
    asyncio.run(seed_database())
    # Uncomment line berikut untuk reset + seed
    # asyncio.run(reset_and_seed())