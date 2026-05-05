# Application Architecture: Raaz-o-Neyaz PWA

This document serves as a comprehensive map of the internal logic, state management, and functional flow of the Raaz-o-Neyaz Progressive Web App. It is designed to be verbose and detailed to facilitate easy onboarding, debugging, and system-wide modifications (such as the recently implemented Dual Theme engine).

---

## 1. Core State & Data Models

The application relies on a centralized, single source of truth stored in the `state` object. This prevents data desynchronization between different views.

### The `state` Object (`app.js`)
- **`categories`** (`Array`): Loaded from `categories.json`. Contains root-level domains (e.g., Quran, Namaz, Dua).
- **`nav`** (`Object`): Loaded from `nav.json`. A multi-level hierarchical tree containing the table of contents. Keyed by `catId` (Category ID).
- **`search`** (`Array`): Loaded from `search.json`. A lightweight, flat index containing titles, IDs, and brief previews. Used for instant "Quick Search" filtering.
- **`deepSearch`** (`Array` | `null`): Loaded dynamically from `deep_search.json`. Contains heavily concatenated string data (`entry.c`) for full-text pattern matching. Stays `null` until the user performs a search that yields zero quick results or toggles the "Deep" checkbox.
- **`bookmarks`** (`Set`): Contains unique `subId` integers representing the user's saved Duas. Automatically synced to and hydrated from `localStorage` (`"bookmarks"`).
- **`langs`** (`Object`): Stores boolean toggles indicating which translations should be visible. Example: `{ en: true, rurdu: false, urdu: true }`. Persisted to `localStorage` (`"langs"`).
- **`fontSize`** (`Object`): Stores floating-point numerical values representing `rem` scaling for different scripts. Example: `{ arabic: 1.75, trans: 0.9 }`. Persisted to `localStorage` (`"fontSize"`).
- **`theme`** (`String`): Current visual theme. Accepts either `'dark'` (default) or `'light'`. Persisted to `localStorage` (`"theme"`).
- **`route`** (`Object`): Represents the current "page" and context. Prevents the need for a full framework router. Properties:
  - `view`: The active screen (`'home'`, `'nav'`, `'reader'`, `'search'`, `'bookmarks'`).
  - `catId`: Active root category.
  - `subId`: Active specific Dua ID (used by the reader).
  - `breadcrumb`: Array of parent nodes allowing the user to traverse back up the tree accurately.
- **`lineCache`** (`Object`): An in-memory dictionary (keyed by `subId`) storing the full payload of recently fetched Duas (`duas_data/lines/{subId}.json`). Prevents redundant network requests if a user navigates back to a previously read Dua in the same session.

---

## 2. UI & Theming (The Dual-Theme Engine)

The application utilizes a CSS-Variable driven theming engine that allows for instant, runtime theme swapping without re-rendering the DOM.

### CSS Architecture (`style.css`)
- **Base Theme (Dark Mode Default)**: Defined in the `:root` pseudo-class. Variables include `--bg`, `--bg-card`, `--text-primary`, `--gold`, and Tajweed specific colors (`--tajweed-green`, etc.).
- **Light Mode Overrides**: Defined in the `body.light-mode` selector. When the `light-mode` class is applied to the `<body>` tag, it seamlessly overwrites the dark variables with light equivalents. 
  - *Note on Contrast*: Tajweed colors (green, red, blue) and the primary accent (`--gold`) are assigned distinct, darker hex codes in `.light-mode` to ensure passing contrast ratios against the stark `#ffffff` and `#f0f2f5` backgrounds.
- **Dynamic Variables**: Variables like `--arabic-size` and `--trans-size` are not tied to the theme; they are explicitly updated via inline styles on the `document.documentElement` by Javascript.

### Theming Javascript Logic (`app.js`)
- **`applyLangs()`**: Evaluates `state.langs` and toggles utility classes (`hide-en`, `hide-rurdu`, `hide-urdu`) on the `<body>` tag. CSS `display: none` rules handle the actual hiding.
- **`applyFontSizes()`**: Injects the numerical values from `state.fontSize` directly into the `:root` inline styles.
- **`applyTheme()`**:
  1. Checks if `state.theme === 'light'`.
  2. Toggles the `light-mode` class on the `<body>`.
  3. Synchronizes the visual state of the Settings modal checkbox (`$themeLight`).
  4. Saves the state to `localStorage`.
  5. Dynamically updates the `<meta name="theme-color">` tag so that the mobile OS status bar matches the background (`#ffffff` for light, `#0d1117` for dark).
- **`toggleTheme()`**: Attached to the UI checkbox; flips the state value and triggers `applyTheme()`.

---

## 3. Data Flow & Networking

The application functions entirely client-side without an active backend API, retrieving static JSON files via relative HTTP fetches.

- **`fetchJSON(url)`**: A hardened wrapper around the native `fetch` API. It enforces `.ok` status checks and automatically parses the JSON, throwing descriptive errors on failure.
- **`loadCoreData()`**: Fired during the `boot()` sequence. Utilizes `Promise.all()` to concurrently fetch `categories.json`, `nav.json`, and `search.json`. The app will not mount until these critical indices are loaded.
- **`loadLines(subId)`**: Responsible for fetching the actual content. It first checks `state.lineCache`; if a cache miss occurs, it fetches from `./duas_data/lines/${subId}.json`.

---

## 4. Routing & The View Dispatcher

Because it is a Single Page Application (SPA), the app manually destroys and reconstructs the HTML within the `<main id="content">` element based on user interactions.

- **`navigate(view, opts)`**: The primary entry point for moving between screens. It merges the requested `view` and context (`opts`) into `state.route`, then fires `render()`.
- **`render()`**: The master dispatch function. It reads `state.route.view` and routes execution to the appropriate rendering function (e.g., `renderHome()`, `renderReader()`). It also controls global UI state, such as whether the top search bar should be hidden (it is hidden on the `reader` view).
- **`goHome()` / `goSearch()` / `goBookmarks()`**: Helper functions tied to the bottom navigation bar that provide safe default routing parameters.

---

## 5. Feature Modules

### A. Home View (`renderHome`)
Generates the initial grid of tiles based on `state.categories`. It utilizes a hardcoded mapping (`CAT_ICONS`) to assign visual emojis to specific category IDs. Clicking a tile passes the appropriate sub-tree from `state.nav` into the `nav` view.

### B. Navigation Tree (`renderNav`)
Renders the hierarchical list of folders and files. 
- Utilizes `renderNavItem(node)` to draw the specific UI.
- If a node has `hasKids: true`, clicking it passes its `children` array back into `navigate('nav', ...)`, pushing a new breadcrumb.
- If `hasKids: false`, it navigates to the `reader` view, passing the node's `id` as the `subId`.

### C. The Reader (`renderReader` & `renderLineBlock`)
The core content display engine.
- Fetches the payload via `loadLines()`.
- Maps over the `data.lines` array, executing `renderLineBlock(line)` for each.
- `renderLineBlock` intelligently parses the complex JSON structure. It applies CSS classes for Tajweed (Green/Red/Blue characters), renders images if `type === 'image'`, and structures English/Urdu/Roman-Urdu translations based on availability.
- **In-Page Search**: A custom "Find-in-Page" implementation. It utilizes a `TreeWalker` to traverse text nodes inside `.line-block` elements, securely wrapping matched substrings in `<mark class="find-highlight">` tags without destroying the underlying HTML structure.

### D. The Dual-Layer Search Engine (`doSearch` & `performDeepSearch`)
1. **Quick Search (`doSearch`)**: Triggered on input debounce. It filters the lightweight `state.search` array (matching titles and previews). Highly performant.
2. **Deep Search (`performDeepSearch`)**: Triggered automatically if Quick Search yields 0 results, OR if the user manually checks the "Deep" toggle. 
   - It lazy-loads the massive `deep_search.json` file on first use.
   - It iterates through the entire dataset, looking for substring matches inside the pre-concatenated `.c` string.
   - Results are appended dynamically to the DOM as "Deep Matches", allowing users to find specific verses hidden deep within a Dua.

---

## 6. Service Worker & Offline Capability (`sw.js`)

To ensure the application functions smoothly offline or on spotty connections, it utilizes a Service Worker.

- **`VERSION` & `CORE_ASSETS`**: The cache is strictly versioned (e.g., `v4`). When the version string is incremented, the `activate` event purges the old caches. `CORE_ASSETS` defines the critical HTML, JS, CSS, and metadata files required to boot the app.
- **Install Event**: Immediately opens the `core` cache and executes `addAll()` on the `CORE_ASSETS`.
- **Fetch Strategy**:
  - **Dua Content (`/duas_data/lines/`)**: Uses a **Cache-First** strategy. Once a Dua is downloaded, it is saved indefinitely in the `lines` cache. If requested again, it serves instantly from the cache, preventing bandwidth waste.
  - **Core Assets**: Uses a **Network-First** fallback to ensure the user gets the latest CSS/JS if online, but falls back to the cache if completely offline.

---

## 7. Planning & Future Goals

This section outlines architectural targets for the next phases of development.

### A. UI/UX Polish
- **Animations & Transitions**: Introduce subtle enter/exit animations for view swaps (e.g., sliding between `nav` and `reader` views) to make the SPA feel more native.
- **Scroll Memory**: Implement state tracking to remember the user's scroll position when navigating back from a Dua to the Navigation Tree.
- **Micro-interactions**: Enhance button press states and settings slider feedback.

### B. Iconography Upgrade
- **Replace Emojis**: The current reliance on OS-level emojis (`CAT_ICONS`, UI buttons) creates an inconsistent experience across different platforms.
- **Action**: Migrate to a unified, elegant SVG icon system (e.g., Lucide, Feather, or custom Islamic geometric SVGs) for navigation, settings, and category representations to ensure a premium, branded look.

### C. Data Consolidation (Reducing JSON File Count)
- **Current Issue**: The `duas_data/lines/` directory contains thousands of tiny JSON files (one for every sub-index). This causes excessive network requests and slows down the initial cache hydration.
- **Action**: Restructure the export script (`export_py`) to chunk the data. Instead of `1001.json`, group data by parent category or logical blocks (e.g., `quran_part1.json`, `duas_common.json`). Modify `app.js` to fetch chunks and extract specific IDs from them.

### D. Robust Offline Availability
- **Current State**: Service Worker functions, but requires the user to visit a Dua while online to cache its specific JSON file.
- **Action**: 
  - Provide a "Download All for Offline Use" button in settings.
  - Explore using `IndexedDB` (via a wrapper like Dexie.js) instead of raw Cache API for the highly structured Dua content, enabling background syncing and more reliable offline search.