# Raaz-o-Neyaz PWA: Project Context

## Overview
Raaz-o-Neyaz is a Progressive Web App (PWA) for accessing Supplications (Duas), Surahs, and Ziyarats. It features hierarchical navigation, a dual-layered search system (Quick + Deep), and a dark-mode optimized UI.

## Architecture
- **Frontend**: Vanilla JavaScript (ES6+), CSS3 (Modern variables/Flexbox/Grid), HTML5.
- **Data Layer**: Static JSON files served via HTTP.
  - **Metadata**: `categories.json`, `nav.json`, `search.json`, `audio.json`.
  - **Content**: `duas_data/lines/{id}.json` (Granular files to minimize initial load).
- **Offline Support**: Service Worker (`sw.js`) with cache-first strategy for UI assets and content.
- **Search**: 
  - **Quick Search**: Client-side filtering of titles and previews in `search.json`.
  - **Deep Search**: Full-text scanning of content via `deep_search.json` (lazy-loaded).

## Issues Faced & Identified
1.  **Path Mismatches**: Initial restructuring moved data files but hardcoded paths in `app.js` and `sw.js` still pointed to a non-existent `data/` directory.
2.  **Missing Assets**: `deep_search.json` and PWA icons were missing or corrupt, leading to console errors and broken search.
3.  **Fetch Failures**: Fetching via `file://` protocol failed during local development; solved by enforcing use of `http.server`.
4.  **Service Worker Caching**: Service worker was caching old/broken paths, requiring manual cache clearing during debug.
5.  **Data Export**: Discrepancies between the SQLite database and exported JSON structures (e.g., `verses` vs `lines`).

## Bug Fixes Implemented
- ✅ **Path Harmonization**: Unified all data fetches to root or `./duas_data/lines/`.
- ✅ **Restructuring**: Cleaned root directory by moving source data to `src_data/`, prototypes to `backup_prototypes/`, and docs to `project_docs/`.
- ✅ **Deep Search Restoration**: Regenerated `deep_search.json` using `export.py` to enable full-text search.
- ✅ **UI Integrity**: Fixed broken `<script>` tag placement and logic in `index.html`.
- ✅ **Modernization**: Updated deprecated meta tags and added placeholder assets to stop 404 errors.

## Current Progress
- **Status**: Substantially complete prototype.
- **Functionality**: Home navigation, Category browsing, Bookmark system, and Search (Quick/Deep) are fully operational.
- **UI**: High-fidelity dark mode implementation is the default.

## Goals & Targets
- **Performance**: Optimize JSON sizes; `deep_search.json` is currently large and may need chunking or a more efficient format (like a prefix tree).
- **Assets**: Replace placeholder icons and favicon with branded assets.
- **Search Tuning**: Improve search relevance and result snippet display.
- **Deployment**: Prepare for hosting on GitHub Pages or similar static hosting.
- **Quality**: Implement error boundaries for failed data fetches and improve "Deep Search" UI feedback.
