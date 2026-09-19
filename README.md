# FileFlow – Smart File Converter

A simple, fast, modern, and privacy-first web application for converting files between popular formats directly in the browser and via a modular Python FastAPI backend.

Built for hackathons and real-world utility with zero complicated databases and zero mandatory user signups.

---

## 🚀 Core Features

- **Supported Conversions**:
  - `PDF → JPG`
  - `PDF → PNG`
  - `JPG → PNG`
  - `PNG → JPG`
  - `JPG → PDF`
  - `PNG → PDF`
  - `TXT → PDF`
  - `TXT → DOCX`
- **Drag & Drop Upload Area**: Large interactive drop zone with automatic format and file size detection.
- **Progress Tracking**: Real-time progress bar and state indicators during conversion.
- **Instant Preview**: View converted images, PDFs, and Word document excerpts right inside the app before saving.
- **Session History**: Easily re-download or preview all files converted during the active browser session.
- **Privacy First**: Files are processed in temporary memory and purged immediately.
- **Dark / Light Mode**: Seamless theme switching with system preference detection.
- **Dual-Engine Architecture**: Powered by a modular **Python FastAPI** backend with built-in instant client-side fallback.

---

## 📂 Project Structure

```text
├── backend/
│   ├── main.py                     # FastAPI application entry point (/convert, /health)
│   ├── test_converters.py          # Automated verification script for all 8 conversion pairs
│   ├── converters/
│   │   ├── __init__.py
│   │   ├── pdf_converter.py        # PDF -> JPG / PNG via PyMuPDF (fitz)
│   │   ├── image_converter.py      # JPG <-> PNG, JPG/PNG -> PDF via Pillow
│   │   ├── text_converter.py       # TXT -> PDF via ReportLab
│   │   └── docx_converter.py       # TXT -> DOCX via python-docx
│   └── uploads/                    # Temporary working directory (purged on completion)
├── src/
│   ├── components/
│   │   ├── Header.tsx              # Header with brand, engine status, and theme toggle
│   │   ├── UploadArea.tsx          # Drag-and-drop zone and 1-click demo test buttons
│   │   ├── ConversionCard.tsx      # Target format selector, progress bar, error alerts
│   │   ├── ResultCard.tsx          # Success state with preview & download actions
│   │   ├── PreviewModal.tsx        # In-browser preview for images, PDF, and DOCX
│   │   ├── HistoryList.tsx         # Session history tracker
│   │   └── PrivacyBanner.tsx       # Reassuring zero-permanent-storage banner
│   ├── utils/
│   │   ├── api.ts                  # Unified API handler with backend dispatch
│   │   ├── clientConverters.ts     # In-browser conversion engines (Canvas, jsPDF, docx, PDF.js)
│   │   ├── formatters.ts           # Size and format detection helpers
│   │   └── sampleFiles.ts          # Instant 1-click test file generator
│   ├── App.tsx                     # Main application flow
│   ├── types.ts                    # TypeScript models
│   └── index.css                   # Tailwind CSS setup
├── requirements.txt                # Python backend dependencies
├── package.json                    # Node / React dependencies and scripts
└── server.ts                       # Integrated full-stack runner & proxy
```

---

## 🛠️ Quick Start & Local Setup

### 1. Prerequisites

- **Node.js**: v18 or newer
- **Python**: v3.10 or newer (with `pip`)

---

### 2. Backend Setup (Python + FastAPI)

1. Navigate to the project root directory.
2. (Optional but recommended) Create and activate a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate    # On Windows: venv\Scripts\activate
   ```
3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI backend server:
   ```bash
   uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
   ```
5. Check backend status:
   Open [http://localhost:8000/health](http://localhost:8000/health) or [http://localhost:8000/docs](http://localhost:8000/docs) in your browser.

---

### 3. Frontend Setup (React + Vite + Tailwind)

1. Install frontend dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing Instructions & Sample Files

### Automated Backend Test

To verify all 8 conversion pairs in Python at once:
```bash
python3 -m backend.test_converters
```
You will see a green report confirming:
- `TXT -> PDF`
- `TXT -> DOCX`
- `PNG -> JPG`
- `JPG -> PNG`
- `JPG -> PDF`
- `PNG -> PDF`
- `PDF -> JPG`
- `PDF -> PNG`

### Manual Web UI Test with 1-Click Demo Buttons

Under the upload box in the web interface, click any of the **Quick Demo Test** buttons:
- **Sample PDF**: Instantly loads a vector test PDF to convert into JPG or PNG.
- **Sample JPG**: Instantly loads a JPG image to convert into PNG or PDF.
- **Sample PNG**: Instantly loads a PNG image to convert into JPG or PDF.
- **Sample TXT**: Instantly loads a structured text document to convert into PDF or DOCX.

---

## 🔒 Privacy Guarantee

> **“Your files are processed temporarily and are not permanently stored.”**

- FileFlow runs processing purely in memory buffers or temporary scratch locations.
- Temporary files and memory buffers are purged immediately upon conversion completion.
- No personal data or conversion history is stored in any permanent database.
