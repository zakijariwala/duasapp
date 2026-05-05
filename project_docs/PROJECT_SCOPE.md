# Project Scope: Raaz-o-Neyaz PWA

## Overview
Fast, offline-capable Progressive Web App (PWA) for religious content: supplications (duas), surahs, and ziyarat. Focuses on speed, offline access, and multilingual support.

## Tech Stack
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+). No frameworks.
- **Hosting**: Static hosting (intended for GitHub Pages).
- **Offline**: Service Workers (`sw.js`) for caching and PWA manifest for installability.
- **Data**: JSON-based flat-file "database" generated from SQLite.

## Project Structure
- `raaz-pwa/docs/`: Publicly served directory.
  - `index.html`: Main entry point.
  - `app.js`: Core application logic (rendering, navigation, state).
  - `style.css`: UI styling with CSS variables for themes.
  - `sw.js`: Service Worker for offline caching.
  - `data/`: JSON files for categories, navigation, and search.
  - `lines/`: Granular JSON files containing actual content lines for each entry.
- `raaz-pwa/scripts/`: Utility scripts.
  - `export.py`: Python script to convert SQLite DB to JSON files.
- `duas_data/`: (Root) Exported data mirror or backup.
- `export_json.py`: (Root) Likely redundant or alternative export script.
- `RON - Copy.db`: Source SQLite database.

## Key Features
- **Multilingual Support**: Arabic (always shown) + English, Urdu (script), Roman Urdu, and Roman Arabic.
- **Offline-First**: Caches core assets and lazy-caches content JSONs as they are viewed.
- **Search**: Client-side search via `search.json`.
- **Navigation**: Hierarchical navigation up to 8 levels deep.
- **Theming**: Dark/Light mode support via CSS variables.

## Data Details
- **Source**: `RON - Copy.db` (SQLite).
- **Taxonomy**: Defined in `Full_Database_Taxonomy.csv` and `Master_Categories.csv`.
- **Content**: ~2700 content files in `lines/` directory.
- **Languages**: Arabic, English, Urdu, Roman Urdu, Roman Arabic.

## Development Workflow
1. **Data Export**: Run `export.py` to refresh JSON files from SQLite.
2. **Local Testing**: Serve `docs/` via local HTTP server (e.g., `python -m http.server`).
3. **Deployment**: Push to GitHub Pages branch/directory.
