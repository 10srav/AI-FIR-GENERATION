# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered legal document generation platform that automates First Information Report (FIR) creation using transformer-based NLP. Takes a complaint description, extracts entities (persons, locations, organizations) via BERT NER, classifies the crime type via BART zero-shot classification, maps relevant IPC (Indian Penal Code) sections, and generates a formatted FIR document in English or Telugu.

## Development Commands

### Backend (Flask + Python)

```bash
# Install dependencies (use a virtual environment)
pip install -r Backend/requirements.txt

# Run backend server (loads ML models on startup, first run downloads ~1.5GB to ~/.cache/huggingface/)
python Backend/app.py
# Serves on http://localhost:5000

# Run service tests
python Backend/test_services.py
```

### Frontend (Next.js + TypeScript)

```bash
cd frontend

# Install dependencies
npm install

# Development server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Lint
npm run lint
```

Both servers must run simultaneously. The frontend connects to the backend at `http://localhost:5000` (hardcoded in `frontend/app/page.tsx` and `frontend/components/fir/ComplaintForm.tsx`).

## Architecture

### Backend (`Backend/`)

Flask REST API with two singleton ML services:

- **`app.py`** - Flask app, all API route handlers, calls into services and utils. `initialize_services()` loads both ML models at startup.
- **`nlp_service.py`** - `NLPService` wraps `dslim/bert-base-NER` (110M params). `extract_entities(text)` returns persons, locations, organizations, dates, times, money values. Confidence threshold: 0.5.
- **`classification_service.py`** - `ClassificationService` wraps `facebook/bart-large-mnli` (406M params). `classify(text)` does zero-shot classification into 6 crime categories (Theft, Assault, Cyber Crime, Cheating, Harassment, Other). Returns label + confidence + all scores.
- **`utils.py`** - `preprocess_text()`, `get_ipc_sections(offence_type)` (maps crime type to IPC sections), `generate_fir_document()` / `generate_fir_document_telugu()` (template-based FIR formatting), `transcribe_audio()`.
- **`tf_patch.py`** - Must be imported before all other imports in `app.py`. Creates mock TensorFlow modules to prevent import errors when using PyTorch-only models.

### Frontend (`frontend/`)

Next.js 16 app with React 19, Tailwind CSS 4, and ShadCN/UI components.

- **`app/page.tsx`** - Main page component. Manages all application state, API calls, and orchestrates child components. Checks `/health` on mount.
- **`components/fir/`** - Domain-specific components:
  - `ComplaintForm.tsx` - Input form with text fields, audio recording, and real-time analysis (debounced 500ms calls to `/analyze_realtime`)
  - `FIRDocumentTab.tsx`, `EntitiesTab.tsx`, `LegalSectionsTab.tsx` - Result display tabs
  - `types.ts` - Shared TypeScript interfaces for API responses
- **`components/ui/`** - ShadCN/Radix UI primitives (do not edit directly; managed by ShadCN CLI)
- **`contexts/LanguageContext.tsx`** - React Context for i18n (English/Telugu). Contains all translation strings.

### API Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/generate_fir` | POST | Full pipeline: entities + classification + IPC sections + FIR document |
| `/classify` | POST | Crime classification only |
| `/extract_entities` | POST | Entity extraction only |
| `/analyze_realtime` | POST | Lightweight analysis for live typing feedback |
| `/transcribe_audio` | POST | Audio file to text (multipart upload) |
| `/health` | GET | Service readiness check |

### Data Flow (FIR Generation)

User input -> `preprocess_text()` -> parallel: `NLPService.extract_entities()` + `ClassificationService.classify()` -> `get_ipc_sections()` -> `generate_fir_document()` -> JSON response with FIR text, entities, classification, and IPC sections.

## Key Conventions

- ML services use the singleton pattern via `get_nlp_service()` / `get_classification_service()` module-level factory functions.
- CORS is restricted to `localhost:3000` and `127.0.0.1:3000`.
- The backend test file (`test_services.py`) is a simple script (not pytest), run directly with `python`.
- IPC section mappings in `utils.py` are a static dictionary; extend the `IPC_SECTIONS` dict to add new crime categories.
- Crime classification categories are defined in `classification_service.py` as `CRIME_CATEGORIES` list; keep this in sync with `IPC_SECTIONS` keys in `utils.py`.
