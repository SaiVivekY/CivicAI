#CivicAI

### AI for Civic & Legal Empowerment

> **Understand Your Rights. Know Your Next Step.**

CivicAI is an AI-powered civic-tech platform designed to help Indian citizens understand civic rights, government procedures, and common legal situations in simple and accessible language.

Citizens often struggle to navigate complicated government portals, legal terminology, and lengthy documents. CivicAI aims to bridge this gap by allowing users to describe their problem naturally and receive a clear explanation, actionable next steps, and relevant guidance.

---

## 💡 Problem

Important government and legal information is often difficult for ordinary citizens to understand and access.

Information may be:

- Spread across multiple government portals
- Buried inside lengthy PDFs and notices
- Written using complex bureaucratic language
- Difficult to connect to a specific personal situation

As a result, people may not know what their rights are or what they should do next.

---

## 🚀 Solution

CivicAI acts as an intelligent interface between citizens and civic information.

A user can simply describe their situation, for example:

> "I submitted an RTI application more than 30 days ago but haven't received a response."

CivicAI analyzes the problem and provides:

- Relevant civic/legal category
- Simple explanation of the situation
- Possible next steps
- Documents that may be required
- Relevant sources and references
- Appropriate disclaimer and uncertainty information

The goal is to transform:

**Complex Bureaucracy → Simple Understanding → Actionable Steps**

---

## ✨ Key Features

### 🧠 AI-Powered Guidance
Understand civic and legal problems using natural language instead of complicated terminology.

### 📋 Action Plans
Receive a structured, step-by-step path based on the user's situation.

### 📄 Document Guidance
Identify documents and information that may be useful for taking the next step.

### 🏛️ Civic Categories
The platform is designed to support areas such as:

- RTI & Government Information
- Consumer Rights
- Tenant Issues
- Government Schemes

### ⚡ Fast AI Responses
Powered by the Groq API for fast AI inference.

### 📱 Modern Responsive Interface
A clean civic-tech interface designed for desktop and mobile devices.

---

## ⚙️ How It Works

```text
                    USER
                      │
                      ▼
              CivicAI Frontend
                      │
                      ▼
              FastAPI Backend
                      │
                      ▼
                  Groq API
                      │
                      ▼
              AI-generated guidance
                      │
                      ▼
              Structured Response
                      │
                      ▼
                    USER
```

The API key is kept securely on the backend and is never exposed to the frontend.

---

## 🛠️ Technology Stack

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Python
- FastAPI
- Uvicorn
- Pydantic

### AI
- Groq API
- Groq-supported language model

### Planned AI Infrastructure
- Retrieval-Augmented Generation (RAG)
- ChromaDB
- Embeddings
- Official government document retrieval

---

## 📁 Project Structure

```text
CivicAI/
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── backend/
│   ├── main.py
│   ├── grok_client.py
│   ├── prompts.py
│   ├── requirements.txt
│   └── .env
│
├── .gitignore
└── README.md
```

> `grok_client.py` is the existing filename in the project. The application uses the **Groq API**, not xAI/Grok.

---

## ▶️ Running Locally

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd CivicAI
```

### 2. Install backend dependencies

```bash
cd backend
py -m pip install -r requirements.txt
```

### 3. Configure the Groq API

Create:

```text
backend/.env
```

Add:

```env
GROQ_API_KEY=your_api_key_here
```

**Never upload your `.env` file or API key to GitHub.**

### 4. Start the backend

```bash
py -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

The API will run at:

```text
http://127.0.0.1:8000
```

Interactive API documentation:

```text
http://127.0.0.1:8000/docs
```

### 5. Start the frontend

Open:

```text
frontend/index.html
```

using VS Code **Live Server** or another local web server.

---

## 🧪 Example

### User Input

> I submitted an RTI application to my local government department more than 30 days ago but haven't received a response. What can I do?

### CivicAI provides

- **Category:** RTI / Government Information
- **Situation:** A possible delayed response to an RTI request
- **Action Plan:** Suggested steps to understand and address the situation
- **Documents:** Potentially relevant application and acknowledgement documents
- **Sources:** Relevant references when available

---

## 🔎 Future: RAG & Verified Sources

The next major development is integrating **Retrieval-Augmented Generation (RAG)**.

Instead of relying only on the AI model, CivicAI will retrieve information from trusted government documents before generating an answer.

```text
Official Government Documents
            │
            ▼
        PDF Extraction
            │
            ▼
          Chunking
            │
            ▼
        Embeddings
            │
            ▼
       Vector Database
            │
            ▼
       User Question
            │
            ▼
    Relevant Information
            │
            ▼
          Groq AI
            │
            ▼
    Grounded Response
            │
            ▼
      Source Citations
```

This will help improve reliability, transparency, and traceability.

---

## 🗺️ Roadmap

- [x] CivicAI frontend
- [x] FastAPI backend
- [x] Groq API integration
- [x] AI-powered civic guidance
- [x] Responsive user interface
- [ ] RAG with official government documents
- [ ] Verified source citations
- [ ] RTI drafting assistant
- [ ] Government scheme eligibility reader
- [ ] Conversational form filling
- [ ] Multilingual support
- [ ] Voice-based interaction

---

## 🔐 Security

CivicAI keeps the Groq API key on the backend.

The key should be stored using:

```env
GROQ_API_KEY=your_api_key
```

It should **never** be placed in:

- Frontend JavaScript
- HTML
- CSS
- Public GitHub repositories

The `.env` file should be included in `.gitignore`.

---

## ⚠️ Disclaimer

CivicAI provides **general informational guidance** and is not a substitute for professional legal advice.

AI-generated information may contain errors or may not reflect the latest applicable rules. Users should verify important information using official government sources or consult a qualified professional when necessary.

---

## 🎯 Vision

CivicAI aims to make civic and government information easier for everyone to understand.

Instead of asking:

> "Which government website should I search?"

or:

> "What does this legal document mean?"

citizens should be able to simply say:

> **"This is what happened. What can I do?"**

### 🇮🇳 CivicAI

**Turning complex bureaucracy into a clear path to action.**
