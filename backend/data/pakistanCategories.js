// Official Pakistan PC Hardware Categories & Brands
// This is the source of truth for all category/brand filtering

const PAKISTAN_CATEGORIES = [
  {
    id: 1,
    name: "Processors",
    slug: "processors",
    alternativeNames: ["CPU", "Processor", "CPUs"],
    icon: "cpu",
    brands: ["Intel", "AMD"],
    keywords: ["cpu", "processor", "i3", "i5", "i7", "i9", "ryzen", "threadripper", "athlon"]
  },
  {
    id: 2,
    name: "Motherboards",
    slug: "motherboards",
    icon: "circuit-board",
    brands: ["ASUS", "MSI", "Gigabyte", "ASRock", "Biostar"],
    keywords: ["motherboard", "mobo", "mainboard", "b550", "b650", "z690", "h610"]
  },
  {
    id: 3,
    name: "Graphics Cards",
    slug: "graphics-cards",
    alternativeNames: ["GPU", "Graphics Card", "Video Card"],
    icon: "gpu",
    brands: ["ASUS", "MSI", "Gigabyte", "Zotac", "Palit", "Sapphire", "XFX", "PowerColor"],
    keywords: ["gpu", "graphics card", "rtx", "gtx", "rx", "video card", "geforce", "radeon"]
  },
  {
    id: 4,
    name: "RAM",
    slug: "ram",
    icon: "memory",
    brands: ["Corsair", "G.Skill", "Kingston", "Crucial", "TeamGroup", "ADATA"],
    keywords: ["ram", "memory", "ddr4", "ddr5", "dimm", "sodimm", "vengeance", "ripjaws"]
  },
  {
    id: 5,
    name: "Storage",
    slug: "storage",
    icon: "hard-drive",
    brands: ["Samsung", "Western Digital", "Seagate", "Kingston", "Crucial", "ADATA"],
    keywords: ["ssd", "hdd", "nvme", "m.2", "storage", "hard drive", "solid state"]
  },
  {
    id: 6,
    name: "Power Supplies",
    slug: "psu",
    icon: "zap",
    brands: ["Corsair", "Cooler Master", "Thermaltake", "DeepCool", "Antec", "Seasonic"],
    keywords: ["psu", "power supply", "smps", "watts", "modular", "bronze", "gold", "platinum"]
  },
  {
    id: 7,
    name: "PC Cases",
    slug: "cases",
    icon: "box",
    brands: ["Cooler Master", "NZXT", "Corsair", "DeepCool", "Lian Li", "Thermaltake"],
    keywords: ["case", "casing", "cabinet", "tower", "chassis", "atx", "matx", "itx"]
  },
  {
    id: 8,
    name: "CPU Coolers",
    slug: "cooling",
    icon: "fan",
    brands: ["Cooler Master", "Corsair", "DeepCool", "Noctua", "ARCTIC", "NZXT"],
    keywords: ["cooler", "cooling", "heatsink", "aio", "liquid cooling", "air cooler", "fan"]
  },
  {
    id: 9,
    name: "Monitors",
    slug: "monitors",
    icon: "monitor",
    brands: ["Samsung", "LG", "AOC", "ViewSonic", "BenQ", "Xiaomi", "ASUS"],
    keywords: ["monitor", "display", "screen", "lcd", "led", "ips", "va", "144hz", "4k"]
  },
  {
    id: 10,
    name: "Keyboards",
    slug: "keyboards",
    icon: "keyboard",
    brands: ["Logitech", "Redragon", "Razer", "Bloody", "A4Tech", "HP", "Fantech", "Corsair", "Cooler Master", "ASUS ROG", "SteelSeries", "Dell"],
    types: ["Wired Keyboard", "Wireless Keyboard", "Mechanical Keyboard", "Membrane Keyboard", "Gaming Keyboard", "RGB Keyboard", "TKL Keyboard", "60% Keyboard", "Office Keyboard"],
    keywords: ["keyboard", "mechanical", "membrane", "gaming keyboard", "rgb keyboard", "tkl", "tenkeyless", "60%", "compact", "wireless keyboard", "wired keyboard"]
  },
  {
    id: 11,
    name: "Mice",
    slug: "mice",
    alternativeNames: ["Mouse"],
    icon: "mouse",
    brands: ["Logitech", "Razer", "Redragon", "Bloody", "A4Tech", "HP", "Dell", "Cooler Master", "Corsair", "Fantech", "ASUS ROG", "SteelSeries"],
    types: ["Wired Mouse", "Wireless Mouse", "Gaming Mouse", "Ergonomic Mouse", "Lightweight Mouse", "Office Mouse", "RGB Mouse"],
    keywords: ["mouse", "mice", "gaming mouse", "wireless mouse", "wired mouse", "optical", "laser", "ergonomic mouse", "lightweight", "rgb mouse"]
  },
  {
    id: 12,
    name: "Headphones",
    slug: "headphones",
    icon: "headphones",
    brands: ["JBL", "HyperX", "Sony", "Redragon", "Razer", "Sennheiser"],
    keywords: ["headphone", "headset", "earphone", "audio", "gaming headset"]
  },
  {
    id: 13,
    name: "Speakers",
    slug: "speakers",
    icon: "volume",
    brands: ["Logitech", "Edifier", "Creative", "Redragon"],
    keywords: ["speaker", "sound system", "2.1", "5.1", "subwoofer", "audio"]
  },
  {
    id: 14,
    name: "Networking",
    slug: "networking",
    icon: "wifi",
    brands: ["TP-Link", "D-Link", "Huawei", "Mikrotik", "Tenda"],
    keywords: ["router", "switch", "modem", "wifi", "ethernet", "lan", "networking"]
  },
  {
    id: 15,
    name: "Prebuilt PCs",
    slug: "prebuilts",
    icon: "pc",
    brands: ["AalaPC", "Dell", "HP", "Lenovo", "Acer", "ASUS", "MSI"],
    keywords: ["prebuilt", "desktop", "pc", "computer", "workstation", "gaming pc"]
  },
  {
    id: 16,
    name: "Gaming Chairs",
    slug: "gaming-chairs",
    icon: "armchair",
    brands: ["Cougar", "ThunderX3", "Fantech", "MSI", "Cooler Master", "Xigmatek", "Anda Seat", "Razer Iskur", "Arozzi"],
    types: ["Standard Gaming Chair", "Ergonomic Gaming Chair", "Reclining Gaming Chair", "Footrest Gaming Chair", "Fabric Gaming Chair", "Leather Gaming Chair", "RGB Gaming Chair"],
    keywords: ["gaming chair", "chair", "ergonomic", "reclining", "footrest", "fabric", "leather", "rgb chair", "office chair", "gaming seat"]
  },
  {
    id: 17,
    name: "Controllers",
    slug: "controllers",
    alternativeNames: ["Controller", "Game Controller", "Gamepad"],
    icon: "gamepad",
    brands: ["Sony", "Microsoft", "Nintendo", "Logitech", "Razer", "8BitDo", "PowerA", "SCUF", "Nacon", "Thrustmaster", "Xbox", "PlayStation", "DualSense", "DualShock"],
    types: ["Wireless Controller", "Wired Controller", "Pro Controller", "Elite Controller", "Racing Wheel", "Flight Stick", "Arcade Stick"],
    keywords: ["controller", "gamepad", "joystick", "game controller", "gaming controller", "xbox controller", "ps5 controller", "ps4 controller", "dualsense", "dualshock", "wireless controller", "wired controller"]
  },
  {
    id: 18,
    name: "Deals",
    slug: "deals",
    icon: "tag",
    brands: [], // Dynamic based on current deals
    keywords: ["deal", "offer", "discount", "sale", "combo", "bundle"]
  }
];

// Helper function to get category by slug
function getCategoryBySlug(slug) {
  return PAKISTAN_CATEGORIES.find(cat => cat.slug === slug);
}

// Helper function to get category by ID
function getCategoryById(id) {
  return PAKISTAN_CATEGORIES.find(cat => cat.id === id);
}

// Helper function to get all brands for a category
function getBrandsForCategory(categorySlug) {
  const category = getCategoryBySlug(categorySlug);
  return category ? category.brands : [];
}

// Helper function to validate if a brand belongs to a category
function isValidBrandForCategory(brand, categorySlug) {
  const brands = getBrandsForCategory(categorySlug);
  return brands.some(b => b.toLowerCase() === brand.toLowerCase());
}

// Export
module.exports = {
  PAKISTAN_CATEGORIES,
  getCategoryBySlug,
  getCategoryById,
  getBrandsForCategory,
  isValidBrandForCategory
};
