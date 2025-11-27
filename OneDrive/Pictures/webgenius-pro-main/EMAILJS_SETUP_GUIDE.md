# 📧 EmailJS Setup Guide for AtherWeb

## Complete Step-by-Step Instructions

### 1️⃣ Create EmailJS Account

1. Visit **[https://www.emailjs.com/](https://www.emailjs.com/)**
2. Click **"Sign Up"** (top right)
3. Create account with your email
4. Verify your email address

---

### 2️⃣ Add Gmail Service

1. **Login** to EmailJS Dashboard
2. Go to **"Email Services"** (left sidebar)
3. Click **"Add New Service"**
4. Select **"Gmail"**
5. Click **"Connect Account"**
6. Sign in with **your Gmail account** (where you want to receive orders)
7. Allow EmailJS permissions
8. Give it a name: **"Gmail Orders"**
9. **COPY YOUR SERVICE ID** → Save it (looks like: `service_abc123`)

---

### 3️⃣ Create Email Template

1. Go to **"Email Templates"** (left sidebar)
2. Click **"Create New Template"**
3. **Template Name**: `order_notification`
4. **Replace the template content** with:

```
Subject: 🔔 New Order from {{from_name}}

=======================================
NEW ORDER RECEIVED
=======================================

📋 CUSTOMER DETAILS:
Name: {{from_name}}
Email: {{from_email}}  
Phone: {{phone}}
Company: {{company}}

💼 PROJECT DETAILS:
Service: {{service}}
Budget: {{budget}}
Deadline: {{deadline}}

📝 DESCRIPTION:
{{description}}

=======================================
Sent via AtherWeb Order Form
=======================================
```

5. Click **"Save"**
6. **COPY YOUR TEMPLATE ID** → Save it (looks like: `template_xyz789`)

---

### 4️⃣ Get Your Public Key

1. Go to **"Account"** (left sidebar)
2. Click **"General"** tab
3. Find **"Public Key"** section
4. **COPY YOUR PUBLIC KEY** → Save it (looks like: `Abc123XyZ-_456`)

---

### 5️⃣ Install EmailJS Package

Open your terminal in the project folder and run:

```bash
npm install @emailjs/browser
```

---

### 6️⃣ Create Environment File

1. In your project root, create file: **.env.local**
2. Add these lines (replace with YOUR actual IDs):

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_abc123
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xyz789
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=Abc123XyZ-_456
```

**⚠️ IMPORTANT**: Replace the values above with YOUR actual IDs from EmailJS!

---

### 7️⃣ Now I'll update your OrderForm to use EmailJS

Let me install the package and update the form for you!
