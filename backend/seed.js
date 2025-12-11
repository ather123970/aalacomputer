// Seed script to reset admin users and seed sample products
// Run: node backend/seed.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

// Get MongoDB URI from environment or use MongoDB Atlas as fallback (no local URI)
const MONGO_URI = process.env.MONGO_URI || process.env.MONGO || 'mongodb+srv://uni804043_db_user:2124377as@cluster0.0cy1usa.mongodb.net/aalacomputer?retryWrites=true&w=majority';

// Load models
const AdminSchema = new mongoose.Schema({
  email: { type: String, index: true, unique: true, required: true },
  passwordHash: { type: String, required: true },
  name: { type: String },
  role: { type: String, default: 'admin' }
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  id: { type: String, index: true, unique: true },
  name: String,
  title: String,
  price: mongoose.Schema.Types.Mixed,
  img: String,
  imageUrl: String,
  description: String,
  category: String,
  tags: [String],
  specs: [String],
  stock: { type: Number, default: 0 },
  sold: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

async function seed() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ Connected to MongoDB');

    // Import models
    const Admin = mongoose.models && mongoose.models.Admin ? mongoose.models.Admin : mongoose.model('Admin', AdminSchema);
    const Product = mongoose.models && mongoose.models.Product ? mongoose.models.Product : mongoose.model('Product', ProductSchema);

    // Step 1: Delete ALL existing admins
    console.log('\n🗑️  Deleting all existing admin users...');
    const deleteResult = await Admin.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} admin user(s)`);

    // Step 2: Create the single allowed admin user
    console.log('\n👤 Creating admin user...');
    const adminEmail = process.env.ADMIN_EMAIL || 'aalacomputerstore@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const admin = new Admin({
      email: adminEmail,
      passwordHash: passwordHash,
      name: 'Site Admin',
      role: 'admin'
    });

    await admin.save();
    console.log(`✅ Admin user created: ${adminEmail}`);

    // Step 3: Seed sample products (optional - uncomment to add sample products)
    console.log('\n📦 Seeding sample products...');

    const sampleProducts = [
      {
        id: "1",
        name: "Gaming Beast",
        title: "Gaming Beast",
        price: 150000,
        img: "/images/pcmain.png",
        imageUrl: "/images/pcmain.png",
        description: "High-performance gaming PC with RTX 4080 and latest components.",
        category: "PC",
        tags: ["gaming", "high-end", "pc"],
        specs: ["RTX 4080", "32GB RAM", "1TB SSD"],
        stock: 15,
        sold: 42
      },
      {
        id: "2",
        name: "Mechanical Pro",
        title: "Mechanical Pro",
        price: 15000,
        img: "/images/keyboard.png",
        imageUrl: "/images/keyboard.png",
        description: "RGB mechanical keyboard with premium switches.",
        category: "Keyboard",
        tags: ["rgb", "mechanical", "wireless"],
        specs: ["RGB", "Mechanical", "Wireless"],
        stock: 50,
        sold: 120
      },
      {
        id: "3",
        name: "Precision Mouse",
        title: "Precision Mouse",
        price: 8000,
        img: "/images/mouse.png",
        imageUrl: "/images/mouse.png",
        description: "High-precision gaming mouse with 16000 DPI sensor.",
        category: "Mouse",
        tags: ["rgb", "precision", "wireless"],
        specs: ["16000 DPI", "RGB", "Wireless"],
        stock: 45,
        sold: 98
      },
      {
        id: "4",
        name: "RTX 4080",
        title: "NVIDIA RTX 4080",
        price: 120000,
        img: "/images/gpu.png",
        imageUrl: "/images/gpu.png",
        description: "Top-tier graphics card with 16GB VRAM and ray tracing.",
        category: "GPU",
        tags: ["nvidia", "rtx", "high-end"],
        specs: ["16GB VRAM", "Ray Tracing", "DLSS"],
        stock: 10,
        sold: 35
      },
      {
        id: "5",
        name: "DDR5 Pro",
        title: "DDR5 Pro RAM",
        price: 25000,
        img: "/images/rgbram.png",
        imageUrl: "/images/rgbram.png",
        description: "High-speed DDR5 RAM with RGB lighting.",
        category: "RAM",
        tags: ["ddr5", "rgb", "32gb"],
        specs: ["32GB", "DDR5", "RGB"],
        stock: 30,
        sold: 55
      },
      {
        id: "6",
        name: "NVMe SSD",
        title: "NVMe SSD 1TB",
        price: 18000,
        img: "/images/ssd.png",
        imageUrl: "/images/ssd.png",
        description: "Ultra-fast NVMe SSD with 3500MB/s read speeds.",
        category: "SSD",
        tags: ["nvme", "fast", "1tb"],
        specs: ["1TB", "NVMe", "3500MB/s"],
        stock: 25,
        sold: 67
      },
      {
        id: "7",
        name: "RGB Case",
        title: "RGB Case",
        price: 12000,
        img: "/images/rgb.png",
        imageUrl: "/images/rgb.png",
        description: "Premium ATX case with RGB fans and tempered glass.",
        category: "Case",
        tags: ["rgb", "atx", "tempered-glass"],
        specs: ["ATX", "RGB Fans", "Tempered Glass"],
        stock: 12,
        sold: 28
      },
      {
        id: "8",
        name: "ThunderStorm",
        title: "ThunderStorm Case",
        price: 32000,
        img: "/images/luxeries.png",
        imageUrl: "/images/luxeries.png",
        description: "Premium ATX case with advanced cooling and tempered glass panel.",
        category: "Case",
        tags: ["atx", "premium", "tempered-glass"],
        specs: ["ATX", "Tempered Glass"],
        stock: 8,
        sold: 15
      }
    ];

    // Delete existing products
    await Product.deleteMany({});
    console.log('✅ Cleared existing products');

    // Insert sample products
    await Product.insertMany(sampleProducts);
    console.log(`✅ Seeded ${sampleProducts.length} sample products`);

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📝 Admin Login Credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('\n🚀 You can now start the server with: npm start');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

// Run seed
seed();

