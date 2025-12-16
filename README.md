# 🚀 BidWin AI: Agentic RFP Response Automation

> **Transforming B2B Tender Responses from 7 Days to < 5 Minutes.**

![Project Status](https://img.shields.io/badge/Status-Prototype_Complete-success)
![Tech Stack](https://img.shields.io/badge/Stack-FastAPI_React_Docker-blue)
![AI Model](https://img.shields.io/badge/AI-Gemini_2.5_Flash-orange)

**BidWin AI** is an autonomous multi-agent orchestration platform designed for Industrial Manufacturers (e.g., Asian Paints, Polycab) to automate the end-to-end B2B Request for Proposal (RFP) process. It leverages **Agentic AI** to discover, analyze, price, and generate bid proposals with human-level accuracy.

---

## 🏢 The Problem
Large industrial firms face a critical bottleneck: **Speed vs. Accuracy**.
*   **Manual Discovery:** Sales teams miss tenders due to manual portal checks.
*   **Technical bottlenecks:** Mapping vague RFP requirements to thousands of internal SKUs requires senior engineering time.
*   **Pricing Complexity:** Estimating logistics, margins, taxes, and mandatory testing costs creates delays.
*   **Result:** 39% of RFPs are missed or responded to too late.

## 💡 The Solution
BidWin AI replaces sequential manual handoffs with **Parallel Autonomous Agents**:
1.  **Sales Agent:** Scans portals & creates a pipeline.
2.  **Technical Agent:** Extracts Bill of Quantities (BoQ) & matches SKUs using an Ensemble Engine.
3.  **Pricing Agent:** Calculates itemized material + service costs (Tax, Logistics, Margins).
4.  **Main Agent:** Generates a client-ready, branded PowerPoint Proposal.

---

## ✨ Key Features (The "Wow" Factor)

### 🧠 1. Multi-SKU Ensemble Decision Engine
Unlike simple AI wrappers, our Technical Agent uses a **Weighted Voting System** to ensure 99% matching accuracy:
*   **Semantic Judge (50%):** Uses Gemini 1.5 Flash to understand context (e.g., "Anti-corrosive" = "Epoxy").
*   **Keyword Judge (30%):** Uses **Jaccard Similarity algorithms** to calculate exact spec overlap.
*   **Rule Judge (20%):** deterministic logic checks for hard constraints.

### ⚡ 2. Autonomous Orchestration (n8n)
*   **Auto-Pilot Mode:** A single click triggers an **n8n workflow** that chains all agents (`Technical -> Pricing -> Proposal`) automatically.
*   **Real-Time Sync:** The dashboard visualizes the pipeline progress live via short-polling.

### 💬 3. Context-Aware Hybrid RAG
*   **Dual-Brain Assistant:** Users can chat with the RFP. The AI answers using **Two Context Sources**:
    1.  **The PDF:** For legal clauses, penalties, and scope.
    2.  **The Database:** For calculated margins, profit analysis, and SKU reasoning.

### 💰 4. Enterprise Commercials
*   Generates a full **Bill of Quantities (BoQ)**.
*   Calculates **Material Costs** (Base + Logistics + GST).
*   Calculates **Service Costs** (Type Tests, FAT, Inspections) based on extracted requirements.

---

<img width="1404" height="695" alt="image" src="https://github.com/user-attachments/assets/7ceaba83-ecca-4f54-b160-9bd6e13f348b" />
<img width="1834" height="1041" alt="image" src="https://github.com/user-attachments/assets/204b7743-59ce-4cd7-a398-12b6503efe48" />
<img width="1759" height="1034" alt="image" src="https://github.com/user-attachments/assets/eedbfc83-98a9-4cb9-9829-c875b4887ab4" />
<img width="1870" height="974" alt="image" src="https://github.com/user-attachments/assets/4e75c0b7-0dca-4158-9ce6-98b0076dc8fc" />
<img width="1722" height="1001" alt="image" src="https://github.com/user-attachments/assets/7f1c39b2-5321-44b8-914e-646547b16d12" />






## 🛠️ Technology Stack

| Component | Tech Used | Description |
| :--- | :--- | :--- |
| **Frontend** | **React + Vite** | Neo-Brutalist UI with Tailwind CSS & Framer Motion. |
| **Backend** | **FastAPI (Python)** | Async API handling AI logic and PDF processing. |
| **AI Engine** | **LangChain + Gemini** | Context-aware extraction and reasoning. |
| **Database** | **PostgreSQL** | Relational DB with `JSONB` for flexible AI outputs. |
| **Orchestration** | **n8n** | Workflow automation server (Self-hosted). |
| **Infrastructure** | **Docker Compose** | Full containerization of the stack. |

---

## 🚀 Installation & Setup

### Prerequisites
*   Docker & Docker Compose installed.
*   Google Gemini API Key.

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/bidwin-ai.git
cd bidwin-ai
```

### 2. Configure Environment
Create a `.env` file in the root directory:
```ini
# Database
POSTGRES_USER=bidwin_user
POSTGRES_PASSWORD=bidwin_secure_pass
POSTGRES_DB=bidwin_db

# n8n Credentials
N8N_USER=admin
N8N_PASSWORD=admin

# AI Keys
GOOGLE_API_KEY=your_gemini_api_key_here
```

### 3. Run the Infrastructure
```bash
docker-compose up --build
```
*Wait 1-2 minutes for containers to spin up and the database to seed.*

### 4. Access the Application
*   **Frontend Dashboard:** [http://localhost:5173](http://localhost:5173) (or check terminal for port)
*   **Backend API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
*   **n8n Automation:** [http://localhost:5678](http://localhost:5678)

---

## 🎥 Usage Guide (Demo Script)

1.  **Ingestion:**
    *   Click **"Trigger Sales Scan"** to find mock RFPs from the simulated portal.
    *   OR Go to **Manual Upload** and drag-and-drop a PDF.
2.  **Auto-Pilot:**
    *   Open the RFP Detail page.
    *   Click the **Purple "Run n8n Auto-Pilot" Button**.
    *   *Watch the status steps turn green in real-time.*
3.  **Analysis:**
    *   **Overview Tab:** See the extracted Bill of Quantities.
    *   **Technical Tab:** View the "Ensemble Score Breakdown" (Semantic/Keyword/Rule).
    *   **Pricing Tab:** Review the itemized invoice and Grand Total.
4.  **Proposal:**
    *   Click **"Download PPT"**.
    *   Open the generated PowerPoint to see the branded, structured proposal.

---

## 📂 Project Structure

```text
bidwin-ai/
├── backend/
│   ├── app/
│   │   ├── agents/         # AI Logic (Sales, Tech, Pricing)
│   │   ├── api/            # FastAPI Endpoints
│   │   ├── services/       # PDF Parsing, PPT Generation
│   │   └── models.py       # SQL Database Models
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/                # React Components & Pages
│   └── tailwind.config.js
├── data/                   # Local storage for PDFs & PPTs
├── docker-compose.yml      # Orchestration config
└── README.md
```

---

## 🏆 Innovation vs. Traditional RAG

| Feature | Standard RAG Tool | BidWin AI |
| :--- | :--- | :--- |
| **Output** | Text Summary | **Native .pptx Proposal** |
| **Matching** | Vector Similarity (Vague) | **Ensemble Engine (Precise)** |
| **Pricing** | N/A | **Dynamic Tax/Margin Logic** |
| **Data** | Read-Only | **Read + Write + Calculate** |

---

## 🤝 Contributors
*   **Team BidWin**
*   Built for **EY Techathon 6.0**
