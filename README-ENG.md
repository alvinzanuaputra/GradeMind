# 📚 Grade Mind

**Grade Mind** is a web-based platform that integrates Artificial Intelligence technology to automate the essay grading process for students. The system combines Optical Character Recognition (OCR) technology for handwriting digitization and Ollama-based Large Language Model (LLM) for automatic answer analysis and grading. Built with FastAPI as the backend REST API, Next.js for responsive frontend, and PostgreSQL as the database management system, Grade Mind provides an end-to-end solution for efficient class management, assignments, and grading for teachers and students.

## 📋 Table of Contents

- [Development Team](#-development-team)
- [Technologies Used](#-technologies-used)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-setup)
  - [Frontend Setup](#2-frontend-setup)
  - [AI Grader Setup](#3-ai-grader-setup)
- [Running the Application](#️-running-the-application)
- [Development Notes](#-development-notes)

## 📖 Project Description

Grade Mind is a web application that helps teachers automatically grade student essay answers. This application uses OCR technology to read handwriting and AI to assess answer quality based on predetermined criteria.

### Key Features:

- 🔐 User authentication (Teachers & Students)
- 📝 Class and assignment management
- 📸 OCR for scanning handwritten answers
- 🤖 Automatic grading using AI
- 📊 Grade monitoring dashboard
- 👥 Class participant management

## 👥 Development Team

| Division        | Team Members                     | 
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

## 🛠 Technologies Used

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

### AI/ML

- Ollama (LLM)
- Sentence Transformers
- OCR Services

## 📁 Project Structure

```
main/
├── backend/          # FastAPI REST API
├── frontend/         # Next.js Web Application
├── grader-ai/        # AI Grading Service with Ollama
└── tr-ocr/           # OCR Processing Service
```

## 🚀 Installation

### Prerequisites

Make sure you have installed:

- Node.js (v18 or newer)
- Python 3.8+
- PostgreSQL
- Docker (optional, for PostgreSQL)
- Ollama (for AI Grading)

### 1. Backend Setup

```powershell
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv .venv
.\.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup database with Docker (optional)
docker run --name grademind-postgres -e POSTGRES_PASSWORD=12345 -e POSTGRES_USER=grademind -e POSTGRES_DB=grademind_db -p 5432:5432 -d postgres

# Configure environment
copy .env.example .env
# Edit .env file and configure DATABASE_URL and SECRET_KEY
```

**.env Example:**

```env
DATABASE_URL=postgresql+asyncpg://grademind:12345@localhost:5432/grademind_db
SECRET_KEY=your-secret-key-here
```

### 2. Frontend Setup

```powershell
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Configure environment
copy .env.example .env
# Edit .env file and configure API URL
```

**.env Example:**

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. AI Grader Setup

```powershell
# Navigate to grader-ai folder
cd grader-ai

# Install dependencies
pip install -r requirements.txt

# Install Ollama
# Download from: https://ollama.ai
# After installation, run the required model:
ollama pull llama2
```

## ▶️ Running the Application

### Run Backend

```powershell
cd backend
.\.venv\Scripts\activate
uvicorn main:app --reload
```

Backend will run at: `http://localhost:8000`
API Docs: `http://localhost:8000/docs`

### Run Frontend

```powershell
cd frontend
npm run dev
```

Frontend will run at: `http://localhost:3000`

### Run AI Grader (Optional)

```powershell
cd grader-ai
python ollama_auto_grader.py
```

## 📝 Development Notes

### Backend

- API documentation available at `/docs` endpoint
- All secret keys must be stored in `.env` (don't commit!)
- Use virtual environment for dependency isolation
- Add new dependencies to `requirements.txt`

### Frontend

- Use React Query for data fetching
- Reusable components available in `src/components` folder
- API client configuration in `src/lib/api-client.ts`

### AI Grader

- Make sure Ollama service is running
- Model can be customized in configuration
- Model benchmark available in `similarity_model_benchmark.py`

---

**Last Updated:** October 2025
