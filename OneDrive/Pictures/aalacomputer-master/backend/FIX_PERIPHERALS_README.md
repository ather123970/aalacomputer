# Quick Fix: Peripherals Category

## Problem
Products in "Peripherals" category need to be moved to correct categories (Keyboards, Mouse, Headsets, Laptops, GPUs, etc.)

## Quick Start

### 1. Test First (Recommended)
```bash
node scripts/fixPeripheralsCategory.js --dry-run
```

### 2. Apply Fix
```bash
node scripts/fixPeripheralsCategory.js
```

## What It Does
- ✅ Finds all products in "Peripherals" category
- ✅ Analyzes product names to detect correct category
- ✅ Moves products to proper categories
- ✅ Shows detailed statistics

## Expected Results
Products will be moved from "Peripherals" to:
- **Keyboards** - keyboard products
- **Mouse** - mouse products  
- **Headsets** - headset/headphone products
- **Audio Devices** - speakers, microphones
- **Laptops** - laptop products
- **Graphics Cards** - GPU products
- **Monitors** - monitor products

## Output
The script will show:
- Total products processed
- Number of products moved
- Category breakdown
- Sample of updated products
- Any errors

## Notes
- No data is deleted
- All changes are reversible
- Safe to run multiple times
- Handles misspelled category names
