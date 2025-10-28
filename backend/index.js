// Minimal ESM shim: load the working CommonJS server implementation (index.cjs)
// This file keeps the repo runnable when package.json uses "type": "module".
try {
  // dynamic import will work in ESM environments; index.cjs runs the server.
  import('./index.cjs').catch((e) => {
    // if dynamic import fails (older Node), try createRequire fallback
    // eslint-disable-next-line no-console
    console.error('Failed to import ./index.cjs dynamically:', e && e.stack ? e.stack : e);
  });
} catch (e) {
  // eslint-disable-next-line no-console
  console.error('Unable to start backend via index.cjs:', e && e.stack ? e.stack : e);
}
try { require('dotenv').config(); } catch (e) { }
// ---------- Compare Route (heuristic) ----------
app.post('/api/compare', (req, res) => {
  try {
    const payload = req.body || {};
    // payload.items can be array of ids or array of product objects
    let items = Array.isArray(payload.items) ? payload.items : [];
    if (!items.length) return res.status(400).json({ error: 'items array is required' });

    // resolve ids to product objects when needed
    const resolved = items.map((it) => {
      if (typeof it === 'string' || typeof it === 'number') {
        return PRODUCT_CATALOG.find(p => String(p.id || p._id || p.ID) === String(it));
      }
      return it;
    }).filter(Boolean).slice(0, 3);

    if (!resolved.length) return res.status(400).json({ error: 'No matching products found' });

    // reuse summarizeProsCons from makeLocalReply: recreate a light summarizer here
    function summarize(prod) {
      const specs = Array.isArray(prod.Spec) ? prod.Spec : (prod.specs || []);
      const stext = specs.join(' ').toLowerCase();
      const pros = [];
      const cons = [];
      if (/rtx|4090|4080|4070|3090|3080|3070|3060|3090ti/i.test(stext)) pros.push('High-end GPU: great for AAA gaming');
      if (/nvme|gen4|ssd/i.test(stext)) pros.push('Fast NVMe/SSD storage');
      if (/16gb|32gb|64gb/i.test(stext)) pros.push('Good RAM for multitasking');
      if (/liquid|360mm|custom/i.test(stext)) pros.push('Advanced cooling for heavy loads');
      if (/i3|ryzen 3|integrated/i.test(stext)) cons.push('May be CPU-limited for heavy tasks');
      if (!/ssd|nvme/i.test(stext)) cons.push('Storage may be HDD or slower SSD');
      return { pros: pros.slice(0,3), cons: cons.slice(0,3), specs: specs.slice(0,6) };
    }

    const compared = resolved.map((p) => ({
      id: p.id ?? p._id ?? null,
      name: p.Name || p.name || p.title || 'Product',
      price: p.price || null,
      category: p.category || null,
      img: p.img || p.image || null,
      ...summarize(p),
    }));

    // human conclusion heuristic: choose best by price/perf (price known) and GPU presence
    let conclusion = 'All options have trade-offs. Tell me which matters most: budget, performance, or quiet/compact design.';
    try {
      const withPrice = compared.filter(c => c.price);
      if (withPrice.length) {
        const best = withPrice.sort((a,b)=> (b.price||0)-(a.price||0))[0];
        conclusion = `${best.name} is the top performer among these (priced PKR ${best.price}). If you want value instead, pick a lower-priced item from the list.`;
      }
    } catch (e) {}

    return res.json({ compared, conclusion });
  } catch (err) {
    console.error('Compare API error', err && err.message ? err.message : err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ---------- Cart Routes ----------
app.post("/api/v1/cart", async (req, res) => {
  try {
    const payload = Array.isArray(req.body) ? req.body : [req.body];
    const results = [];

    for (const item of payload) {
      if (
        !item.id ||
        !item.name ||
        !item.img ||
        !item.specs?.length ||
        !item.type ||
        (item.price === undefined || item.price === null)
      ) {
        results.push({ ok: false, error: "Missing fields", id: item?.id ?? null });
        continue;
      }

      const updated = await Cart.findOneAndUpdate(
        { id: item.id },
        {
          $set: {
            name: item.name,
            img: item.img,
            specs: item.specs,
            type: item.type,
            price: item.price,
          },
          $inc: { qty: item.qty || 1 },
        },
        { upsert: true, new: true }
      );

      results.push({ ok: true, item: updated });
    }

    res.status(201).json({ success: true, results });
  } catch (err) {
    console.error("Cart POST error:", err && err.message ? err.message : err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/v1/cart", async (req, res) => {
  try {
    const items = await Cart.find().lean();
    res.json(items);
  } catch (err) {
    console.error("Cart GET error:", err && err.message ? err.message : err);
    res.status(500).json({ message: "Error fetching items" });
  }
});

app.delete("/api/v1/cart/:id", async (req, res) => {
  try {
    const deleted = await Cart.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ message: "Item not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("Cart DELETE error:", err && err.message ? err.message : err);
    res.status(500).json({ message: "Error deleting item" });
  }
});

// ---------- Error Handler ----------
app.use((err, req, res, next) => {
  console.error("Global error:", err && err.message ? err.message : err);
  res.status(500).json({ message: "Server error" });
});

// ---------- Start Server ----------
async function start() {
  try {
    // AI local model initialization removed. Server will start without attempting to load local models.
    // Attempt to connect to MongoDB, but don't fail startup if DB is unavailable (useful for local dev)
    try {
      await mongoose.connect(MONGO_URI);
      console.log("✅ MongoDB connected");
    } catch (dbErr) {
      console.warn("⚠️ MongoDB connection failed, continuing without DB:", dbErr && dbErr.message ? dbErr.message : dbErr);
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server start encountered an unexpected error:", err && err.message ? err.message : err);
    console.warn("Attempting to start server anyway...");
    try {
      app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
      });
    } catch (e) {
      console.error("Failed to start server after error:", e && e.message ? e.message : e);
      // last resort: exit
      process.exit(1);
    }
  }
}

start();
