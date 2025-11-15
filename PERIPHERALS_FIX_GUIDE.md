# Peripherals Category Fix Guide

## Overview
This guide explains how to fix products that were incorrectly categorized as "Peripherals" (or misspellings like "perohperhals") and move them to their correct categories.

## Problem
You added headphones, laptops, GPUs, and other products to the wrong category name "Peripherals" in your admin dashboard. This script will:

1. **Fetch** all products from the "Peripherals" category (and misspellings)
2. **Analyze** each product name to detect the correct category
3. **Move** products to their proper categories:
   - Keyboards → "Keyboards"
   - Mouse → "Mouse"
   - Headsets/Headphones → "Headsets" or "Audio Devices"
   - Speakers/Microphones → "Audio Devices"
   - Laptops → "Laptops"
   - GPUs/Graphics Cards → "Graphics Cards"
   - Monitors → "Monitors"

## How to Use

### Step 1: Test with Dry Run (Recommended)
First, test what changes will be made WITHOUT modifying the database:

```bash
cd backend
node scripts/fixPeripheralsCategory.js --dry-run
```

This will show you:
- How many products will be moved
- Which categories they'll be moved to
- Sample of products being updated
- Any products that couldn't be auto-detected

### Step 2: Apply Changes
Once you're satisfied with the dry run, apply the changes:

```bash
cd backend
node scripts/fixPeripheralsCategory.js
```

This will:
- Update all products in the database
- Move them to their correct categories
- Show you the final statistics

## Output Example

```
🔍 Starting Peripherals Category Fix...

Mode: LIVE UPDATE

📊 Found 45 products in Peripherals category

✅ [1] "Logitech MX Master 3S Wireless Mouse"
   Current: "Peripherals" → Detected: "Mouse"

✅ [2] "Corsair K95 Platinum RGB Mechanical Keyboard"
   Current: "Peripherals" → Detected: "Keyboards"

✅ [3] "HyperX Cloud Stinger 2 Gaming Headset"
   Current: "perohperhals" → Detected: "Headsets"

...

================================================================================
📈 MIGRATION SUMMARY
================================================================================

Total Products Processed: 45
Products to Update: 42
Products Unchanged: 3

Successfully Updated: 42
Errors: 0

================================================================================
CATEGORY BREAKDOWN
================================================================================

📂 Mouse: 12 products
    ← from "Peripherals": 12

📂 Keyboards: 15 products
    ← from "Peripherals": 15

📂 Headsets: 10 products
    ← from "Peripherals": 10
    ← from "perohperhals": 5

📂 Audio Devices: 5 products
    ← from "Peripherals": 5

================================================================================
```

## Command Options

| Option | Description |
|--------|-------------|
| `--dry-run` or `-d` | Test changes without modifying database |
| `--quiet` or `-q` | Suppress verbose output |

## What Gets Detected

The script intelligently detects categories based on product names:

### Keyboards
- "keyboard", "mechanical keyboard", "rgb keyboard", "gaming keyboard", "wireless keyboard"

### Mouse
- "mouse", "gaming mouse", "wireless mouse", "rgb mouse"

### Headsets
- "headset", "gaming headset", "wireless headset", "usb headset"

### Audio Devices
- "speaker", "speakers", "audio", "sound", "microphone", "mic", "headphone"

### Laptops
- "laptop", "notebook", "ultrabook"

### Graphics Cards
- "gpu", "graphics card", "rtx", "gtx", "radeon"

### Monitors
- "monitor", "display", "lcd"

## Troubleshooting

### Some products not being categorized
If some products show as "unchanged" and couldn't be auto-detected, you may need to:
1. Check the product name - ensure it contains relevant keywords
2. Manually update those products in the admin dashboard
3. Or edit the script to add more keywords for detection

### Database connection error
Make sure:
1. Your MongoDB URI is correct in the `.env` file
2. Your MongoDB cluster is accessible
3. You have internet connection

### Want to undo changes?
If something goes wrong, you can:
1. Use the `--dry-run` flag to see what would happen
2. Manually revert changes in the admin dashboard
3. Or restore from a database backup

## Database Structure

The script updates the `category` field in the Product collection:

```javascript
{
  _id: ObjectId,
  name: "Logitech MX Master 3S",
  category: "Mouse",  // ← Updated from "Peripherals"
  price: 5999,
  // ... other fields
}
```

## Support

If you encounter issues:
1. Check the error message in the console
2. Verify your MongoDB connection
3. Ensure all products have proper names
4. Run with `--dry-run` first to diagnose issues

## Notes

- ✅ No data is deleted, only categories are updated
- ✅ All changes are logged and reversible
- ✅ Script handles database connection errors gracefully
- ✅ Works with misspelled category names (e.g., "perohperhals")
