# 🎯 Product Categorization Rules

## Priority Order (High to Low)

The system checks categories in this specific order to prevent conflicts:

### **Priority 1: Laptops** 
**Keywords:** laptop, notebook, ultrabook, chromebook, macbook, probook, elitebook, thinkpad, vivobook, zenbook, ideapad, pavilion, open box, gen laptop

**Examples:**
- ✅ HP ProBook 430 G8 11TH GEN Intel Core i3 → **Laptops**
- ✅ Dell Inspiron 15 3000 → **Laptops**
- ✅ ASUS VivoBook 14 → **Laptops**

---

### **Priority 2: Prebuilt PC / Mini PC**
**Keywords:** mini pc, ease mini pc, desktop computer, ver 1, ver 2, phantom, frost, unleash, prebuilt

**Examples:**
- ✅ EASE Mini PC Intel Core i5-1145G7 → **Prebuilt PC**
- ✅ Unleash Phantom R7 Ver 2.2 → **Prebuilt PC**
- ✅ FROST R5 Ver 1.6 → **Prebuilt PC**

---

### **Priority 3: Processors / CPUs** ⚡ STRICT
**Keywords:** 
- Intel: intel core i3, intel core i5, intel core i7, intel core i9, intel core ultra, pentium, celeron, xeon
- AMD: amd ryzen 3, ryzen 5, ryzen 7, ryzen 9, threadripper
- Suffixes: kf, f suffix, x suffix, tray, box processor

**Special Rules:**
- ✅ MUST contain "Intel" or "AMD" or "Ryzen" in name
- ❌ MUST NOT contain "laptop", "notebook", "mini pc", "monitor", "display"

**Examples:**
- ✅ Intel Core i7-12700K → **Processors**
- ✅ AMD Ryzen 5 5600 → **Processors**
- ✅ Intel Core Ultra 5 245KF → **Processors**
- ✅ AMD Ryzen 7 5700X3D → **Processors**
- ❌ HP Laptop with Intel Core i7 → **Laptops** (contains "laptop")

---

### **Priority 4: RAM / Memory**
**Keywords:** g.skill, corsair, kingston, crucial, ddr4, ddr5, ddr3, desktop memory, rgb ram, trident, vengeance, ripjaws, dominator, expo, xmp, dimm, sodimm

**Examples:**
- ✅ G.SKILL Trident Z5 Neo RGB Series 64GB → **RAM**
- ✅ Corsair DOMINATOR Platinum RGB Grey 64GB → **RAM**
- ✅ Kingston Fury Beast 16GB DDR5 → **RAM**

---

### **Priority 5: Motherboards**
**Keywords:** 
- Chipsets: b650, b760, h610, z690, z790, x570, x670
- Form factors: atx, matx, mini-itx
- Sockets: am5, am4, lga1700
- Brands: msi mag, gigabyte, asus rog, asrock, maxsun

**Examples:**
- ✅ MSI MAG B650 TOMOHAWK WIFI AM5 → **Motherboards**
- ✅ Gigabyte H610M H Intel® H610 → **Motherboards**
- ✅ ASUS ROG STRIX Z790-E → **Motherboards**

---

### **Priority 6: CPU Cooling / Fans**
**Keywords:** cpu fan, cpu cooler, darkflash, thermalright, noctua, argb, 120mm, 140mm, 240mm, 360mm, radiator, case fan

**Examples:**
- ✅ DarkFlash DM12 PRO 3 in 1 CPU Fan RGB Black → **Cooling**
- ✅ Thermalright TL-E12W-S V3 120mm → **Cooling**
- ✅ Noctua NH-D15 CPU Cooler → **Cooling**

---

### **Priority 7: Graphics Cards**
**Keywords:** rtx, gtx, gpu, graphics card, video card, geforce, radeon rx

**Examples:**
- ✅ NVIDIA GeForce RTX 4090 → **Graphics Cards**
- ✅ AMD Radeon RX 7900 XTX → **Graphics Cards**

---

### **Priority 8: Monitors**
**Keywords:** monitor, display, lcd, led monitor, 24 inch, 27 inch, 144hz, 240hz, curved monitor

**Examples:**
- ✅ Dell 27" Gaming Monitor 144Hz → **Monitors**
- ✅ ASUS ROG 32" Curved Display → **Monitors**

---

### **Other Categories:**
- **Storage:** ssd, nvme, m.2, hard drive, hdd
- **Power Supply:** psu, power supply, watt
- **Cases:** pc case, tower, cabinet, atx case
- **Mouse:** mouse, gaming mouse, wireless mouse
- **Keyboards:** keyboard, mechanical keyboard
- **Headsets:** headset, headphone, gaming headset
- **Controllers:** controller, gamepad, joystick
- **Networking:** router, wifi, modem, network card
- **Chairs:** chair, gaming chair, office chair
- **Desks:** desk, gaming desk, computer desk

---

## 🔧 How Detection Works

1. **Scan product name** for keywords (checks anywhere in name: beginning, middle, or end)
2. **Priority matching** - First match wins (Laptops checked first, then PCs, then CPUs, etc.)
3. **Exclude keywords** - Products with excluded words skip that category
4. **Custom validation** - Some categories have extra checks (e.g., CPUs must have Intel/AMD)

---

## ✅ What This Fixes

### **Before:**
- ❌ RAM modules showing in Processors category
- ❌ Monitors showing in Laptops category
- ❌ PC Cases showing in Processors category
- ❌ Cooling fans showing in Processors category

### **After:**
- ✅ Processors category: ONLY Intel/AMD CPUs
- ✅ Laptops category: ONLY actual laptops
- ✅ RAM category: Memory modules
- ✅ Motherboards category: Mainboards
- ✅ Cooling category: Fans and coolers
- ✅ Every product in its correct category

---

## 🎯 Migration Status

**Currently Processing:** 5,056 products
**Expected Time:** 5-10 minutes
**Action:** Automatic recategorization based on product names

Once complete:
1. Refresh your browser
2. Navigate to any category
3. Verify products are correctly categorized

---

## 📊 Expected Results

### **Processors Category**
Will show ONLY:
- Intel Core i3, i5, i7, i9
- Intel Core Ultra 5, 7, 9
- AMD Ryzen 3, 5, 7, 9
- Intel Pentium, Celeron
- AMD Threadripper

Will NOT show:
- ❌ Laptops with processors
- ❌ RAM modules
- ❌ Motherboards
- ❌ Cooling fans

### **Laptops Category**
Will show ONLY:
- HP ProBook, EliteBook
- Dell Inspiron, Latitude
- Lenovo ThinkPad, IdeaPad
- ASUS VivoBook, ZenBook
- Acer Aspire

Will NOT show:
- ❌ Monitors
- ❌ Mouse
- ❌ Keyboards
- ❌ Desktop PCs

---

## 🔄 Continuous Monitoring

The system will:
- ✅ Auto-detect miscategorized products
- ✅ Suggest correct categories
- ✅ Flag products for review
- ✅ Maintain category accuracy

---

**Last Updated:** November 8, 2025
**Rules Version:** 2.0 (Enhanced with user-provided specifications)
