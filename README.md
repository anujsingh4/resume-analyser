# 🤖 AI Resume Analyser

A full-stack web application that analyses resumes against job descriptions using AI. Upload your resume, paste a job description, and get an instant match score, keyword analysis, and AI-powered improvement suggestions powered by OpenAI GPT-4.

🔗 **Live Demo:** [your-app-url.vercel.app](https://your-app-url.vercel.app)

---

## 📸 Screenshots

> Upload your resume and paste a job description to get started

![AI Resume Analyser](https://via.placeholder.com/800x450.png?text=AI+Resume+Analyser+Screenshot)

---

## ✨ Features

- 📄 **Resume Upload** — Supports PDF, DOC, and DOCX formats up to 5MB
- 🔍 **Text Extraction** — Automatically extracts all text from uploaded resumes
- 🎯 **Keyword Matching** — Compares resume keywords against job description and calculates a match score
- 🤖 **AI Analysis** — Uses OpenAI GPT-4o-mini to generate intelligent gap analysis and suggestions
- 📊 **Match Report** — Visual score ring showing how well your resume matches the job
- 💡 **Improvement Suggestions** — Section-by-section suggestions to improve your resume
- 🗂️ **Analysis History** — Saves all past analyses to PostgreSQL so you can review them anytime
- 📱 **Responsive UI** — Clean, modern interface that works on all screen sizes

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React.js | UI framework |
| CSS3 | Styling and animations |
| Fetch API | HTTP requests to backend |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express.js | Web server framework |
| Multer | File upload handling |
| pdf2json | PDF text extraction |
| Mammoth | DOCX text extraction |
| OpenAI SDK | GPT-4 AI integration |
| node-postgres (pg) | PostgreSQL database client |

### Database
| Technology | Purpose |
|---|---|
| PostgreSQL | Storing analysis history |

### Deployment
| Service | Purpose |
|---|---|
| Vercel | Frontend hosting |
| Render | Backend hosting |
| Render PostgreSQL | Database hosting |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) v18 or higher
- [PostgreSQL](https://www.postgresql.org/) v15 or higher
- An [OpenAI API key](https://platform.openai.com/api-keys)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/resume-analyser.git
cd resume-analyser
```

**2. Install backend dependencies**
```bash
cd backend
npm install
```

**3. Install frontend dependencies**
```bash
cd ../frontend
npm install
```

**4. Set up environment variables**

Create a `.env` file inside the `backend` folder:
```env
PORT=8080
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=postgresql://localhost:5432/resume_analyser
```

**5. Set up the database**
```bash
psql postgres -c "CREATE DATABASE resume_analyser;"
psql resume_analyser -c "
CREATE TABLE analyses (
  id                      SERIAL PRIMARY KEY,
  filename                VARCHAR(255) NOT NULL,
  match_score             INTEGER NOT NULL,
  matched_count           INTEGER NOT NULL,
  missing_count           INTEGER NOT NULL,
  top_matched             TEXT[],
  top_missing             TEXT[],
  ai_summary              TEXT,
  fit_verdict             VARCHAR(50),
  strength_areas          TEXT[],
  gap_areas               TEXT[],
  missing_skills          JSONB,
  resume_improvements     JSONB,
  job_description_preview TEXT,
  created_at              TIMESTAMP DEFAULT NOW()
);"
```

**6. Start the backend**
```bash
cd backend
node server.js
# Server running on http://localhost:8080
```

**7. Start the frontend**
```bash
cd frontend
npm start
# App running on http://localhost:3000
```

---

## 📁 Project Structure

```
resume-analyser/
├── backend/
│   ├── routes/
│   │   ├── upload.js          # File upload endpoint
│   │   ├── analyse.js         # Keyword matching endpoint
│   │   ├── aiAnalyse.js       # AI analysis endpoint
│   │   └── history.js         # Analysis history endpoints
│   ├── utils/
│   │   ├── pdfExtractor.js    # PDF text extraction
│   │   ├── keywordMatcher.js  # Keyword matching algorithm
│   │   ├── aiAnalyser.js      # OpenAI integration
│   │   └── db.js              # PostgreSQL connection
│   ├── server.js              # Express server entry point
│   ├── package.json
│   └── .env                   # Environment variables (not committed)
│
└── frontend/
    ├── public/
    │   ├── index.html
    │   └── favicon.ico
    └── src/
        ├── App.js             # Main application component
        ├── App.css            # Global styles
        └── History.js         # Analysis history page
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/upload` | Upload and extract text from resume |
| `POST` | `/api/analyse` | Run keyword matching against job description |
| `POST` | `/api/ai-analyse` | Full AI analysis (keywords + GPT-4) |
| `GET` | `/api/history` | Get all past analyses |
| `GET` | `/api/history/:id` | Get a single analysis by ID |

---

## 🧠 How It Works

```
User uploads resume (PDF/DOCX)
        ↓
Text extracted using pdf2json / Mammoth
        ↓
Keywords extracted from resume and job description
        ↓
Keyword matching algorithm calculates match score
        ↓
Resume + job description sent to OpenAI GPT-4o-mini
        ↓
AI returns gap analysis, missing skills, and suggestions
        ↓
Results saved to PostgreSQL database
        ↓
Results displayed to user with score ring and tabs
```

---

## 🌍 Deployment

### Frontend — Vercel
1. Push code to GitHub
2. Import repo on [vercel.com](https://vercel.com)
3. Set root directory to `frontend`
4. Deploy

### Backend — Render
1. Create a new Web Service on [render.com](https://render.com)
2. Set root directory to `backend`
3. Set start command to `node server.js`
4. Add environment variables (`OPENAI_API_KEY`, `DATABASE_URL`)
5. Deploy

### Database — Render PostgreSQL
1. Create a new PostgreSQL instance on Render
2. Copy the Internal Database URL
3. Add it as `DATABASE_URL` in your backend environment variables
4. Run the table creation SQL via Render's PSQL console

---

## 💰 API Cost

This project uses `gpt-4o-mini` which is extremely affordable:

| Usage | Approximate Cost |
|---|---|
| Per analysis | ~$0.002 |
| 100 analyses | ~$0.20 |
| 1000 analyses | ~$2.00 |

A $5 OpenAI credit will last for thousands of analyses.

---

## 🔮 Future Improvements

- [ ] User authentication with JWT
- [ ] Google Gemini as alternative AI provider
- [ ] Downloadable PDF report of analysis
- [ ] Cover letter generator based on job description
- [ ] Resume scoring breakdown by section
- [ ] Dark mode support

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Anuj**
- GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)
- LinkedIn: [your-linkedin](https://linkedin.com/in/your-linkedin)

---

> Built with ❤️ using React, Node.js, PostgreSQL, and OpenAI GPT-4
