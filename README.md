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
4. Click Save to persist the checklist. The app will try to save without opening a file explorer when possible:
   - It first attempts an HTTP PUT to `./travel-checklist.json` (works only if the server accepts writes).
   - If you previously granted File System Access permission the app will overwrite that file without prompting.
   - Otherwise the app will automatically download `travel-checklist.json` to your Downloads folder.
5. Use Load to open a `travel-checklist.json` file.

Notes & browser compatibility
- The File System Access API (showSaveFilePicker/showOpenFilePicker) is supported in Chromium-based browsers. If not available the app falls back to download/upload.
 - When saving via the file picker you can choose to save the file in your project root. The app will attempt to fetch `travel-checklist.json` on load if it's in the same folder.
 - Note: silent overwrite behavior depends on environment and browser permissions:
    - HTTP PUT requires a server that accepts PUT for the file path (many static servers don't).
    - Direct overwrite without a prompt requires the File System Access API and that you previously selected/allowed the file.
    - If those aren't available the app downloads the JSON to the Downloads folder.
 - Link the root JSON for seamless saves
    - To automatically update `travel-checklist.json` in the app folder without downloads or prompts, click the `Link` button in the header and choose the `travel-checklist.json` file located in the same folder as `index.html`.
    - The browser will store a handle (in IndexedDB) so future Save clicks can overwrite that file silently (you'll be asked to grant write permission the first time).
    - This requires a Chromium-based browser that supports the File System Access API and handle persistence.
 - No backend or database is used. Everything runs in the browser.

License: MIT
# TravelChecklist