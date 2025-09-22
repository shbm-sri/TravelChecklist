# Travel Checklist (static)

This is a small, dependency-free static web app to keep a travel checklist organized by categories.

Features
- Multiple categories (default set provided). You can rename categories inline.
- Add Item button on every category to append items inline.
- Delete Item and Delete Category controls.
- Save: writes a JSON file (uses the browser File System Access API if available, otherwise downloads a JSON file). The app also autosaves to localStorage in the browser.
- Load: load a JSON file from disk.

How it works
- The app will try to fetch `travel-checklist.json` from the same folder when it loads. If present, it will populate the UI from that file.
- If not found it will use your browser's localStorage backup (if available), otherwise default example categories are loaded.

Usage
1. Open `index.html` in a modern browser. For best results run a local static server (browsers restrict file APIs when opened via file://):

   # Example using Python 3 (PowerShell)
   python -m http.server 8000

2. Visit http://localhost:8000 in your browser.
3. Edit items inline. Use the Add Item button to append new items.
4. Click Save to persist the checklist. The browser will either prompt you to pick a save location or download `travel-checklist.json`.
5. Use Load to open a `travel-checklist.json` file.

Notes & browser compatibility
- The File System Access API (showSaveFilePicker/showOpenFilePicker) is supported in Chromium-based browsers. If not available the app falls back to download/upload.
- When saving via the file picker you can choose to save the file in your project root. The app will attempt to fetch `travel-checklist.json` on load if it's in the same folder.
- No backend or database is used. Everything runs in the browser.

License: MIT
# TravelChecklist