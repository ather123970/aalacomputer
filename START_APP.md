# 🚀 How to Start Aala Computer App

## ✅ Quick Start (2 Simple Steps)

### **Step 1: Start Backend Server**
Open a terminal and run:
```bash
npm run backend
```

**You should see:**
```
[server] Starting server...
Backend server listening on port 10000
MongoDB connected successfully
```

---

### **Step 2: Start Frontend (in NEW terminal)**
Open a **NEW terminal** (keep backend running) and run:
```bash
npm run dev
```

**You should see:**
```
VITE v7.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
```

---

## 🌐 Access Your App

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:10000
- **Products API:** http://localhost:10000/api/products

---

## 🔍 Verification

### Test if backend is running:
```bash
curl http://localhost:10000/api/products?limit=5
```

You should see JSON data of products!

---

## ⚠️ Troubleshooting

### "401 Unauthorized" Error
- ✅ Make sure backend is running (`npm run backend`)
- ✅ Check that port 10000 is not blocked

### "Cannot fetch products"
- ✅ Start backend FIRST
- ✅ Then start frontend
- ✅ Refresh the browser

### Products showing 0
- ✅ Check MongoDB connection in backend terminal
- ✅ Verify `.env` file has `MONGODB_URI` set

---

## 📝 Note

**ALWAYS run backend first, then frontend!**

Backend provides:
- ✅ Products from MongoDB database
- ✅ Categories and brands
- ✅ Admin dashboard API
- ✅ Image proxying
