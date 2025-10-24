// src/pages/Products.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Nav from "../nav";
import { Loader2 } from "lucide-react";
import { API_BASE } from '../config'

// Helper to resolve images relative to Vite base. This avoids issues when the
// app is served from a subpath or when leading slashes are stripped.
function getImageUrl(path) {
  if (!path) return '';
  // If path looks absolute (starts with http or //) return as-is
  if (/^https?:\/\//i.test(path) || /^\/\//.test(path)) return path;
  // Files placed in the repo-level `images/` directory are served from the
  // site root when Vite's publicDir is set to 'images'. Normalize paths so
  // both '/images/foo.png' and '/foo.png' map to BASE_URL + '/foo.png'
  const base = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL ? import.meta.env.BASE_URL.replace(/\/$/, '') : '';
  // strip leading /images/ if present
  const normalized = path.replace(/^\/images\//, '').replace(/^\//, '');
  return `${base}/${normalized}`;
}

const productList = [
  { id: 1, Name: "StreetRunner", price: 70000, img: getImageUrl('/images/rbtech_sonic_c05_white-removebg-preview.png'), Spec: ["CPU: AMD Ryzen 3 3200G", "GPU: Vega 8", "RAM: 8GB", "Storage: 240GB SSD", "Case: Simple ATX", "PSU: 450W"], category: "PC" },
  { id: 2, Name: "Workhorse", price: 230000, img: getImageUrl('/images/pcglow.jpg'), Spec: ["CPU: Ryzen 7 7700X", "GPU: RTX 3070 8GB", "RAM: 32GB DDR5", "Storage: 1TB NVMe SSD", "PSU: 750W", "Case: Corsair 4000D"], category: "PC" },
  { id: 3, Name: "RGB Keyboard", price: 3500, img: getImageUrl('/images/keyboard.png'), Spec: ["Mechanical", "RGB", "USB-C"], category: "Keyboard" },
  { id: 4, Name: "Mouse", price: 3500, img: getImageUrl('/images/mouse.png'), Spec: ["Ergonomic", "RGB", "Wired"], category: "Mouse" },
  { id: 5, Name: "RTX 4070", price: 150000, img: getImageUrl('/images/gpu.png'), Spec: ["RTX 4070", "12GB GDDR6"], category: "GPU" },
  { id: 6, Name: "PowerRAM 32GB", price: 18000, img: getImageUrl('/images/rgbram.png'), Spec: ["DDR5", "5200MHz"], category: "RAM" },
  { id: 7, Name: "UltraSSD 1TB", price: 12000, img: getImageUrl('/images/ssd.png'), Spec: ["NVMe", "Gen4", "1TB"], category: "SSD" },
  { id: 8, Name: "ThunderStorm", price: 32000, img: getImageUrl('/images/luxeries.png'), Spec: ["ATX", "Tempered Glass"], category: "Case" },
];

const categories = ["All", "PC", "Keyboard", "Mouse", "GPU", "RAM", "SSD", "Case"];

const Products = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(!!localStorage.getItem('aalacomp_admin_token'));
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [filteredProducts, setFilteredProducts] = useState(productList);
  const [loadingId, setLoadingId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newProd, setNewProd] = useState({ Name: '', price: '', img: '', description: '', Spec: [], category: '' });
  // login modal state (was missing causing ReferenceError)
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginErr, setLoginErr] = useState(null);

  async function doLogin() {
    try {
      setLoginErr(null);
      const base = API_BASE.replace(/\/+$/, '')
      // Local shortcut: accept a built-in admin credential so developers can login without backend
      if (loginUser === 'aalacomputeradmin@gmail.com' && loginPass === 'karachi123') {
        const fakeToken = 'LOCAL_ADMIN_TOKEN_' + Date.now();
        localStorage.setItem('aalacomp_admin_token', fakeToken);
        setIsAdmin(true);
        setLoginErr(null);
        setLoginOpen(false);
        // go to admin dashboard
        window.location.href = '/admin';
        return;
      }

  const url = base + '/admin/login';
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: loginUser, password: loginPass }) });
      const j = await res.json();
      if (!res.ok) return setLoginErr(j && j.error ? j.error : `Login failed (${res.status})`);
      const token = j.token;
      localStorage.setItem('aalacomp_admin_token', token);
      setLoginErr(null);
      setLoginOpen(false);
      setIsAdmin(true);
      // redirect to admin dashboard
      window.location.href = '/admin';
    } catch (e) {
      console.error('admin login error', e);
      setLoginErr(e && e.message ? `Network error: ${e.message}. Make sure backend is running and VITE_BACKEND_URL is set if needed.` : 'Network error');
    }
  }

  useEffect(() => {
    try {
      localStorage.setItem("products", JSON.stringify(productList));
    } catch (e) {
      console.warn("Failed to cache products", e);
    }

    const filtered = productList.filter((p) => {
      const matchCategory = selectedCategory === "All" || p.category === selectedCategory;
      const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      return matchCategory && matchPrice;
    });
    setFilteredProducts(filtered);
  }, [selectedCategory, priceRange]);

  const buynow = (product) => {
    setLoadingId(product.id);
    setTimeout(() => {
      setLoadingId(null);
      navigate(`/products/${product.id}`);
    }, 150);
  };

  // Admin edit modal state
  const [editing, setEditing] = useState(null);
  const [editErr, setEditErr] = useState(null);
  async function saveEdit() {
    try {
      if (!editing) return;
  const base = API_BASE.replace(/\/+$/, '')
      // try backend admin API when token present
      const token = localStorage.getItem('aalacomp_admin_token');
      if (token) {
  const res = await fetch(`${base}/admin/products/${editing.id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(editing) });
        const j = await res.json();
        if (!res.ok) throw new Error(j && j.error ? j.error : 'save failed');
      }
      // update local copy in localStorage (for frontend-only flow)
      try {
        const raw = localStorage.getItem('products');
        const arr = raw ? JSON.parse(raw) : [];
        const idx = arr.findIndex(p => String(p.id) === String(editing.id));
        if (idx !== -1) arr[idx] = { ...arr[idx], ...editing };
        else arr.unshift(editing);
        localStorage.setItem('products', JSON.stringify(arr));
      } catch (e) { console.warn('local update failed', e); }
      setEditing(null);
      setEditErr(null);
      // refresh view
      window.location.reload();
    } catch (e) { setEditErr(String(e && e.message || e)); }
  }

  function getBackendBase() {
    try {
      const host = window && window.location && window.location.hostname;
      const port = window && window.location && window.location.port;
  if (host && (host === 'localhost' || host === '127.0.0.1') && (!port || port !== '3000')) return import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? '/api' : 'http://localhost:3000');
    } catch (e) {}
    return '';
  }

  async function logout() {
    localStorage.removeItem('aalacomp_admin_token');
    setIsAdmin(false);
  }

  async function createProduct() {
    try {
      const base = API_BASE.replace(/\/+$/, '')
      const token = localStorage.getItem('aalacomp_admin_token');
      const payload = { id: newProd.id || `p_${Date.now()}`, name: newProd.Name || newProd.name || '', Name: newProd.Name || newProd.name || '', price: Number(newProd.price || 0), img: newProd.img || '', description: newProd.description || '', Spec: Array.isArray(newProd.Spec) ? newProd.Spec : (String(newProd.Spec || '').split(',').map(s=>s.trim()).filter(Boolean)), category: newProd.category || '' };
      if (token) {
        const res = await fetch(`${base}/admin/products`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const j = await res.json();
        if (!res.ok) throw new Error(j && j.error ? j.error : 'create failed');
      }
      // update localStorage and state
      try {
        const raw = localStorage.getItem('products');
        const arr = raw ? JSON.parse(raw) : [];
        arr.unshift(payload);
        localStorage.setItem('products', JSON.stringify(arr));
        setFilteredProducts(arr);
      } catch (e) { console.warn('local write failed', e); }
      setCreating(false);
      setNewProd({ Name: '', price: '', img: '', description: '', Spec: [], category: '' });
    } catch (e) { alert('Create failed: ' + (e && e.message)); }
  }

  async function loadProductsFromBackend() {
    try {
      const base = API_BASE.replace(/\/+$/, '')
      const token = localStorage.getItem('aalacomp_admin_token');
      if (!token) return;
      const res = await fetch(`${base}/admin/products`, { headers: { Authorization: `Bearer ${token}` } });
      const j = await res.json();
      if (res.ok && j.products) {
        localStorage.setItem('products', JSON.stringify(j.products));
        setFilteredProducts(j.products);
      }
    } catch (e) { console.warn('load products failed', e); }
  }

  return (
    <>
      <Nav />
  <div className="p-6 md:px-20 bg-panel min-h-[calc(100vh-72px)] text-primary">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-500">Explore Our Products</h1>

          {/* Inline admin login (replaces the old admin login button) */}
          <div className="w-full sm:w-auto">
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <button onClick={()=>setCreating(true)} className="px-3 py-2 bg-green-600 text-white rounded">Add product</button>
                <button onClick={logout} className="px-3 py-2 bg-gray-700 text-white rounded">Logout</button>
              </div>
            ) : (
              <form onSubmit={(e)=>{ e.preventDefault(); doLogin(); }} className="flex items-center gap-2">
                <input value={loginUser} onChange={(e)=>setLoginUser(e.target.value)} placeholder="email" className="px-3 py-2 rounded bg-card border border-gray-700 text-primary w-48 text-sm" />
                <input value={loginPass} onChange={(e)=>setLoginPass(e.target.value)} placeholder="password" type="password" className="px-3 py-2 rounded bg-card border border-gray-700 text-primary w-36 text-sm" />
                <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded text-sm">Admin login</button>
              </form>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8 items-center justify-center md:justify-start">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full font-semibold transition-all duration-200 ${
                selectedCategory === cat
                  ? "btn-accent text-white shadow-lg shadow-blue-700/40"
                  : "bg-card text-muted hover:bg-card/90"
              }`}
            >
              {cat}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2 bg-card p-2 rounded-lg">
            <span className="text-muted text-sm">Price:</span>
            <input
              type="number"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([Number(e.target.value || 0), priceRange[1]])}
              className="w-20 p-1 bg-card rounded text-primary border border-gray-700"
            />
            <span className="text-muted">-</span>
            <input
              type="number"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value || 0)])}
              className="w-20 p-1 bg-card rounded text-primary border border-gray-700"
            />
          </div>
        {/* Modals: Login, Edit, Create */}
        {loginOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded w-full max-w-md">
              <h3 className="text-lg font-semibold mb-3">Admin login</h3>
              {loginErr && <div className="text-sm text-red-400 mb-2">{loginErr}</div>}
              <div className="space-y-2">
                <input className="w-full p-2 bg-card border rounded" value={loginUser} onChange={(e)=>setLoginUser(e.target.value)} placeholder="email" />
                <input className="w-full p-2 bg-card border rounded" value={loginPass} onChange={(e)=>setLoginPass(e.target.value)} placeholder="password" type="password" />
                <div className="flex gap-2 justify-end mt-3">
                  <button onClick={()=>setLoginOpen(false)} className="px-3 py-2 bg-gray-700 text-white rounded">Cancel</button>
                  <button onClick={doLogin} className="px-3 py-2 bg-blue-600 text-white rounded">Login</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {editing && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded w-full max-w-2xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Edit product {editing.id}</h3>
                <div className="flex gap-2">
                  <button onClick={()=>{ setEditing(null); setEditErr(null); }} className="px-2 py-1 bg-gray-700 text-white rounded">Close</button>
                </div>
              </div>
              {editErr && <div className="text-sm text-red-400 mb-2">{editErr}</div>}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input value={editing.Name || editing.name || ''} onChange={(e)=>setEditing({...editing, Name: e.target.value, name: e.target.value})} className="p-2 border rounded w-full" placeholder="Name" />
                  <input value={editing.price || ''} onChange={(e)=>setEditing({...editing, price: Number(e.target.value || 0)})} className="p-2 border rounded w-full" placeholder="Price" />
                </div>
                <input value={editing.img || ''} onChange={(e)=>setEditing({...editing, img: e.target.value})} className="p-2 border rounded w-full" placeholder="Image URL" />
                <input value={editing.category || ''} onChange={(e)=>setEditing({...editing, category: e.target.value})} className="p-2 border rounded w-full" placeholder="Category" />
                <textarea value={editing.description || ''} onChange={(e)=>setEditing({...editing, description: e.target.value})} className="p-2 border rounded w-full" placeholder="Description" />
                <input value={(editing.Spec || []).join ? (editing.Spec || []).join(',') : (editing.Spec || '')} onChange={(e)=>setEditing({...editing, Spec: String(e.target.value || '').split(',').map(s=>s.trim()).filter(Boolean)})} className="p-2 border rounded w-full" placeholder="Specs (comma separated)" />

                <div className="flex gap-2 justify-end mt-3">
                  <button onClick={()=>{ setEditing(null); setEditErr(null); }} className="px-3 py-2 bg-gray-700 text-white rounded">Cancel</button>
                  <button onClick={saveEdit} className="px-3 py-2 bg-green-600 text-white rounded">Save</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {creating && (
          <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded w-full max-w-2xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Create new product</h3>
                <button onClick={()=>{ setCreating(false); setNewProd({ Name: '', price: '', img: '', description: '', Spec: [], category: '' }); }} className="px-2 py-1 bg-gray-700 text-white rounded">Close</button>
              </div>
              <div className="space-y-2">
                <input placeholder="Name" value={newProd.Name} onChange={(e)=>setNewProd({...newProd, Name: e.target.value})} className="w-full p-2 border rounded" />
                <input placeholder="Price" value={newProd.price} onChange={(e)=>setNewProd({...newProd, price: e.target.value})} className="w-full p-2 border rounded" />
                <input placeholder="Image URL" value={newProd.img} onChange={(e)=>setNewProd({...newProd, img: e.target.value})} className="w-full p-2 border rounded" />
                <input placeholder="Category" value={newProd.category} onChange={(e)=>setNewProd({...newProd, category: e.target.value})} className="w-full p-2 border rounded" />
                <textarea placeholder="Description" value={newProd.description} onChange={(e)=>setNewProd({...newProd, description: e.target.value})} className="w-full p-2 border rounded" />
                <input placeholder="Specs (comma)" value={Array.isArray(newProd.Spec)? newProd.Spec.join(','): (newProd.Spec||'')} onChange={(e)=>setNewProd({...newProd, Spec: String(e.target.value||'').split(',').map(s=>s.trim()).filter(Boolean)})} className="w-full p-2 border rounded" />
                <div className="flex gap-2 justify-end mt-3">
                  <button onClick={()=>{ setCreating(false); setNewProd({ Name: '', price: '', img: '', description: '', Spec: [], category: '' }); }} className="px-3 py-2 bg-gray-700 text-white rounded">Cancel</button>
                  <button onClick={createProduct} className="px-3 py-2 bg-green-600 text-white rounded">Create</button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((p, idx) => (
            <AnimatedProductCard key={p.id} p={p} buynow={buynow} loadingId={loadingId} navigate={navigate} delay={idx * 0.1} isAdmin={isAdmin} setEditing={setEditing} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <p className="text-center text-gray-500 mt-10 text-lg">
            No products found in this range or category.
          </p>
        )}
          {/* Admin controls */}
          <div className="fixed bottom-6 right-6 hidden sm:flex flex-col gap-2">
            {/* The above classes keep controls visible on small+ but avoid collisions on extra tiny devices via CSS below */}
            {isAdmin ? (
              <div className="flex flex-col items-end gap-2">
                <button onClick={()=>setCreating(true)} className="right-40 relative px-3 py-2 bg-green-600 text-white rounded">Add product</button>
                <button onClick={logout} className="px-3 py-2 bg-gray-700 text-white rounded">Logout</button>
              </div>
            ) : (
              <></>
            )}
          </div>
      </div>
    </>
  );
};

// Single Product Card — Animated with Intersection Observer
const AnimatedProductCard = ({ p, buynow, loadingId, navigate, delay, isAdmin, setEditing }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: false });

  useEffect(() => {
    if (inView) {
      controls.start({ opacity: 1, y: 0, scale: 1 });
    } else {
      controls.start({ opacity: 0, y: 50, scale: 0.95 });
    }
  }, [inView, controls]);

  return (
  <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={controls}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      onClick={() => navigate(`/products/${p.id}`)}
      className="bg-white rounded-xl p-4 flex flex-col border border-gray-800 hover:border-blue-600 hover:shadow-lg hover:shadow-blue-700/30 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
    >
      <div className="relative h-48 w-full rounded-xl overflow-hidden flex items-center justify-center bg-gray-800 mb-4">
        <img
          src={p.img || "https://via.placeholder.com/200"}
          alt={p.Name}
          className="object-contain w-full h-full hover:scale-110 transition-transform duration-300"
          onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/200")}
        />
        {isAdmin && (
          <button onClick={(e)=>{ e.stopPropagation(); /* open edit */ if (typeof setEditing === 'function') setEditing({ ...p, id: p.id, Name: p.Name || p.name }); else window.dispatchEvent(new CustomEvent('aalacomp:openEdit', { detail: p })); }} className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded">Edit</button>
        )}
      </div>

      <h2 className="text-lg font-semibold text-blue-400">{p.Name}</h2>
      <p className="text-blue-500 font-medium">{p.price.toLocaleString()} PKR</p>

      <ul className="text-sm mt-2 flex-1 text-gray-400 space-y-1">
        {p.Spec.map((s, i) => (
          <li key={i}>• {s}</li>
        ))}
      </ul>

      <button
        onClick={(e) => {
          e.stopPropagation();
          buynow(p);
        }}
        disabled={loadingId === p.id}
        className="mt-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-60"
      >
        {loadingId === p.id ? (
          <>
            <Loader2 className="animate-spin" size={18} /> Processing...
          </>
        ) : (
          "Buy Now"
        )}
      </button>

      {/* Ask AI button removed */}
    </motion.div>
  );
};

export default Products;

// Global listener modal for admin edit (mount at module level)
if (typeof window !== 'undefined') {
  window.addEventListener('aalacomp:openEdit', (ev) => {
    try {
      const p = ev && ev.detail;
      // Only proceed for admins - redirect to full admin dashboard edit
      if (localStorage.getItem('aalacomp_admin_token')) {
        window.location.href = '/admin';
      } else {
        console.warn('Edit requested but user is not admin');
      }
    } catch (e) { console.error(e); }
  });
}

// NOTE: The following DOM-mounted modals are simple fallbacks; React manages most UI in-component.
// We will create minimal DOM nodes for login/edit when opening via state.
