# Raaz-o-Neyaz PWA

A modern, fast, and offline-capable Progressive Web App for accessing Supplications (Duas), Surahs, and Ziyarats.

## 🚀 Features
- **High-Fidelity Dark Mode**: Optimized for low-light reading.
- **Hierarchical Navigation**: Browse through categories (Quran, Namaz, Dua, etc.) with up to 8 levels of depth.
- **Dual-Layer Search**:
  - **Quick Search**: Instant filtering of titles and previews.
  - **Deep Search**: Full-text scanning across all content.
- **Offline Support**: Full PWA capabilities with service worker caching for seamless offline use.
- **Bookmarks**: Save your favorite duas for quick access.
- **Customization**: Adjustable Arabic and translation font sizes; toggle visibility for English, Urdu, and Roman Urdu.

## 📂 Project Structure
```text
/
├── index.html          # Main PWA entry point
├── app.js              # Core application logic
├── style.css           # Modern dark-mode styling
├── sw.js               # Service Worker for offline support
├── manifest.json       # PWA manifest
├── categories.json     # Metadata: Root categories
├── nav.json            # Metadata: Full navigation tree
├── search.json         # Metadata: Lightweight search index
├── deep_search.json    # Metadata: Full-text search index
├── audio.json          # Metadata: Audio source mapping
│
├── duas_data/          # Dua Content
│   └── lines/          # Individual JSON files per Dua (1001.json, etc.)
│
├── src_data/           # Source & Extraction
│   ├── RON.db          # SQLite master database
│   └── export_json.py  # Script to generate JSON files from DB
│
├── scripts/            # Maintenance & Utility scripts
├── project_docs/       # Scope, Context, and Architecture notes
└── backup_prototypes/  # Legacy test files and prototypes
```

## 🛠️ Development & Setup

### 1. Requirements
- Python 3.x (for serving and data export)
- A modern web browser (Chrome/Edge/Safari/Firefox)

### 2. Running the App
The PWA requires an HTTP server to handle `fetch()` requests and Service Worker registration.

```bash
# In the project root
python -m http.server 8000
```
Then visit: `http://localhost:8000`

### 3. Data Management
To update the JSON files from the master SQLite database:
```bash
python scripts/export.py src_data/RON.db .
```

## 📝 Implementation Journey
- **Phase 1: Extraction**: Converted complex SQLite relational data into a flat, hierarchical JSON structure optimized for web performance.
- **Phase 2: Prototyping**: Built basic viewers to validate Arabic rendering and path handling.
- **Phase 3: PWA Development**: Implemented the full UI with `Vanilla JS`, `CSS Grid`, and `Service Workers`.
- **Phase 4: Optimization**: Restructured the directory layout for clarity and fixed critical path/fetch issues encountered during integration.

## ⚖️ License
Internal Project - All rights reserved.
