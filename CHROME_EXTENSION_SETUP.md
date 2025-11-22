# Chrome Extension Setup - Aala Computer Image Extractor

## What It Does

This extension **automates the entire image extraction workflow**:

1. Click **Copy button** in Admin Dashboard
2. Opens **Google Images** with product name auto-searched
3. **Auto-extracts first image URL** from results
4. **Copies URL to clipboard** automatically
5. **Returns to Admin Dashboard** automatically
6. Click **Replace Image button** to paste & update

## Installation Steps

### Step 1: Load Extension in Chrome

1. Open Chrome and go to: `chrome://extensions/`
2. Enable **"Developer mode"** (toggle in top right)
3. Click **"Load unpacked"**
4. Navigate to: `c:\Users\MicroZaib\OneDrive\Pictures\aalacomputer-master\chrome-extension`
5. Select the folder and click **"Select Folder"**

### Step 2: Verify Installation

- You should see **"Aala Computer Image Extractor"** in your extensions list
- The extension icon should appear in your Chrome toolbar

### Step 3: Grant Permissions

- Chrome may ask for permissions - click **"Allow"**
- Permissions needed:
  - Access to Google Images (to extract URLs)
  - Access to localhost:5173 (to return to your site)
  - Clipboard write (to copy image URLs)

## How to Use

### Workflow:

```
1. Go to http://localhost:5173/admin
2. Click the BLUE "Copy" button on any product
3. Google Images opens automatically
4. Extension extracts first image URL (2-3 seconds)
5. Image URL copied to clipboard
6. Page auto-returns to Admin Dashboard
7. Click PURPLE "Replace Image" button
8. Image URL auto-pasted and saved
9. Product updated! ✅
10. Next product auto-loads
11. Repeat for next product
```

## Testing

### Test with "Apple MWZ43.35W Dual USB-C Port Compact Power Adapter":

1. Go to `/admin`
2. Find the product in the list
3. Click the **blue Copy button**
4. Google Images opens with "Apple MWZ43.35W Dual USB-C Port Compact Power Adapter"
5. Wait 2-3 seconds
6. You'll see notification: "✅ Image URL copied! Returning to Aala Computer..."
7. Page returns to Admin Dashboard
8. Click **purple Replace Image button**
9. Image URL pasted automatically
10. Product updated! ✅

## Troubleshooting

### Extension not working?

1. **Check if enabled**: Go to `chrome://extensions/` and ensure extension is enabled
2. **Check console**: Press F12 → Console tab → Look for errors
3. **Reload extension**: Click reload icon next to extension name
4. **Clear cache**: Ctrl+Shift+Delete → Clear browsing data

### Google Images not opening?

1. Check **pop-up blocker settings**
2. Allow pop-ups for `localhost:5173`
3. Ensure you're using Chrome (not Edge, Firefox, etc.)

### Image URL not copying?

1. Check that Google Images fully loaded (wait 3 seconds)
2. Try clicking a different product
3. Check browser console for errors (F12)
4. Reload the extension

### Not returning to Admin Dashboard?

1. Check that localhost:5173 is running
2. Ensure you're logged in to admin
3. Check browser console for errors

## File Structure

```
chrome-extension/
├── manifest.json      (Extension configuration)
├── content.js         (Runs on Google Images - extracts URLs)
├── background.js      (Manages tab automation)
└── README.md          (This file)
```

## How It Works (Technical)

1. **manifest.json**: Defines extension permissions and scripts
2. **background.js**: Listens for Google Images tabs and triggers extraction
3. **content.js**: Runs on Google Images page, finds and copies first image URL

## Security & Privacy

- ✅ Only accesses Google Images (for image extraction)
- ✅ Only accesses localhost:5173 (your admin dashboard)
- ✅ Does NOT collect any data
- ✅ Does NOT track anything
- ✅ Runs locally on your computer

## Need Help?

If the extension doesn't work:

1. Check `chrome://extensions/` → Details → Errors
2. Open DevTools (F12) on Google Images tab
3. Check Console for error messages
4. Reload extension and try again

## Uninstall

To remove the extension:

1. Go to `chrome://extensions/`
2. Find "Aala Computer Image Extractor"
3. Click the trash icon
4. Confirm deletion

---

**Happy image extracting!** 🚀
