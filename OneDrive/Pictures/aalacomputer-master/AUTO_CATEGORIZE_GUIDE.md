# 🚀 Auto-Categorization Guide

## Fix Misplaced Products (Monitors, JBL Speakers, etc.)

This script will automatically move products from "Peripherals" to their correct categories based on their names.

### Quick Start

1. **Open terminal in the backend folder:**
   ```bash
   cd backend
   ```

2. **Run the auto-categorization script:**
   ```bash
   node scripts/autoCategorizeMisplacedProducts.js
   ```

### What It Does

✅ **Finds all products in "Peripherals" category**  
✅ **Analyzes product names using AI-like pattern matching**  
✅ **Automatically moves them to correct categories:**

- **Monitors** → `monitor`, `display`, `screen`, `lcd`, `led`, `viewsonic`, `asus monitor`, etc.
- **Audio Devices** → `speaker`, `headphone`, `jbl`, `bose`, `sony audio`, `gaming headset`, etc.
- **Laptops** → `laptop`, `notebook`, `gaming laptop`, `macbook`, `thinkpad`, etc.
- **Graphics Cards** → `gpu`, `rtx`, `gtx`, `radeon`, `geforce`, `nvidia`, etc.
- **And 15+ other categories**

### Example Output

```
🚀 Starting auto-categorization of misplaced products...

📦 Found 47 products in Peripherals category

📈 SUMMARY:
Total products to recategorize: 42

New category distribution:
  • Monitors: 15 products
  • Audio Devices: 12 products  
  • Laptops: 8 products
  • Graphics Cards: 4 products
  • Keyboards: 2 products
  • Mouse: 1 product

🔄 APPLYING CHANGES...

✅ Updated: Samsung 24" Gaming Monitor → Monitors
✅ Updated: JBL Charge 5 Bluetooth Speaker → Audio Devices
✅ Updated: ASUS ROG Strix Gaming Laptop → Laptops
...

🎉 AUTO-CATEGORIZATION COMPLETE!
✅ Successfully updated: 42 products
```

### Safety Features

- **Dry run analysis** - Shows what will change before applying
- **Confidence scoring** - Only moves products it's confident about
- **Detailed logging** - See exactly what changed
- **Backup friendly** - Non-destructive operation

### Categories It Detects

| Category | Examples |
|----------|----------|
| **Monitors** | Samsung 24" Monitor, ASUS Gaming Display |
| **Audio Devices** | JBL Speaker, Sony Headphones, Gaming Headset |
| **Laptops** | ASUS ROG Laptop, MacBook Pro, ThinkPad |
| **Graphics Cards** | RTX 4080, RX 7900 XT, GeForce GTX |
| **Processors** | Intel i7, AMD Ryzen 7, Core i5 |
| **RAM** | Corsair 16GB DDR4, G.Skill Memory |
| **Storage** | Samsung SSD, WD Hard Drive, NVMe |
| **Keyboards** | Mechanical Keyboard, Gaming Keyboard |
| **Mouse** | Gaming Mouse, Wireless Mouse |
| **And more...** | 15+ total categories |

### After Running

1. **Check your admin dashboard** - Products should now be in correct categories
2. **Verify the changes** - Review moved products in each category
3. **Manual adjustments** - Fine-tune any that need tweaking

### Troubleshooting

**Script won't run?**
```bash
# Make sure you're in the backend folder
cd backend

# Install dependencies if needed
npm install

# Check your .env file has MONGODB_URI
```

**No products found?**
- Check if products are actually in "Peripherals" category
- Verify database connection in .env file

**Want to undo changes?**
- The script shows exactly what it changed
- You can manually revert specific products if needed

### Pro Tips

🔥 **Run this script whenever you:**
- Import new products in bulk
- Notice products in wrong categories  
- Want to clean up your product catalog

🚀 **For best results:**
- Run after bulk product imports
- Check the output log for any missed products
- Use the bulk edit dashboard for fine-tuning

---

**Need help?** The script is safe to run multiple times and won't break anything! 🛡️
