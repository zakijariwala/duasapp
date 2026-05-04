# Project Context: Raaz-o-Neyaz PWA

## Overview
A fast, offline-first Progressive Web App (PWA) for religious content (supplications, surahs, ziyarat). Built with vanilla web technologies to ensure maximum compatibility and performance.

## Tech Stack
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+). No frameworks (React/Vue/etc.).
- **Data Architecture**: SQLite source (`RON - Copy.db`) exported to a flat-file JSON structure.
- **Offline Support**: Service Worker (`sw.js`) handles caching. PWA manifest (`manifest.json`) for installability.
- **Deployment**: Optimized for static hosting (GitHub Pages).

## Project Structure
- `raaz-pwa/docs/`: Public root.
  - `index.html`: Shell and global search container.
  - `app.js`: Core logic (state, routing, rendering, search).
  - `style.css`: UI/UX styling with CSS variables for theming.
  - `sw.js`: Service worker for `core` assets and `lines` lazy-caching.
  - `data/`: Consolidated indices (`categories`, `nav`, `search`, `deep_search`).
  - `lines/`: ~2700 content-specific JSON files.
- `raaz-pwa/scripts/export.py`: Python script for SQL-to-JSON transformation.

## Core Architecture & State (`app.js`)
### State Management
A single `state` object tracks:
- `categories`, `nav`, `search`: Core indices.
- `deepSearch`: In-memory full-text index (loaded on demand).
- `bookmarks`: Persistent `Set` of numeric IDs stored in `localStorage`.
- `route`: Tracks current `view`, `subId`, `breadcrumb`, and `highlight` query.
- `lineCache`: LRU-style cache for fetched line files.

### Routing System
`navigate(view, options)` updates the state and triggers `render()`.
Views: `home`, `nav`, `reader`, `search`, `bookmarks`.

### Search Logic
1. **Lightweight Search**: Filters `search.json` (titles only).
2. **Deep Search**: Filters `deep_search.json` (full content). Optimized to fetch once and search in-memory.
3. **In-Page Search**: DOM-based `TreeWalker` to highlight and navigate matches within the reader.

## Key Implementation Details (This Session)
### 1. iOS PWA Safe-Area Fixes
- Viewport set to `viewport-fit=cover`.
- `#topbar` and `#bottom-nav` use `env(safe-area-inset-*)` for iOS status/home bars.

### 2. Optimized Deep Search
- Replaced 2700+ individual fetch requests with a single consolidated `deep_search.json` (34.8MB).
- Instant, synchronous in-memory search results.
- **Scroll to Match**: Search results now pass query to reader, which auto-highlights and scrolls to the first match.

### 3. Search UI Enhancements
- **Floating UI**: Search bars (Global/Reader) set to sticky with elevation (shadows) when active.
- **Clear Button**: Integrated (✕) to reset queries instantly.
- **Dismiss Button**: Integrated "Done" button to exit search mode and clear focus.

### 4. Bookmark Persistence
- Fixed integer vs string type mismatch in `localStorage`. IDs are strictly handled as `Number`.

## Current Status & Known Issues
- **Status**: Stable. Core functionality and performance fixes verified. UI enhancements implemented but pending final verification.
- **Known Issues (UI)**:
  - User reports Floating Search Bars and Dismiss Buttons are not working as expected (potential CSS conflict or event listener failure).
- **Testing**: Manual verification via `test_env.html` and local server (port 8001).
- **Maintenance**: To refresh data, run `python raaz-pwa/scripts/export.py`.
