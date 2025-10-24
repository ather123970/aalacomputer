import React, { useEffect, useState } from 'react';
import { API_BASE } from '../config'

function getToken() {
  return localStorage.getItem('aalacomp_admin_token');
}

function getBackendBase() {
  return API_BASE.replace(/\/$/, '')
}

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [rawMode, setRawMode] = useState(false);
  const [rawText, setRawText] = useState('');
  const [editErr, setEditErr] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newProd, setNewProd] = useState({ name: '', price: '', img: '', description: '' });
  const [stats, setStats] = useState(null);

  useEffect(()=>{ load(); loadStats(); }, []);

  async function load() {
    setLoading(true);
    try {
  const base = getBackendBase();
  const res = await fetch(`${base}/admin/products`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const j = await res.json();
      if (res.ok) setProducts(j.products || []);
      else console.error('admin products error', j);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function loadStats() {
    try {
  const base = getBackendBase();
  const res = await fetch(`${base}/admin/stats`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const j = await res.json();
      if (res.ok) setStats(j);
    } catch (e) { console.error(e); }
  }

  function startEdit(p) { setEditing({ ...p }); }

  async function saveEdit() {
    try {
      let payload = editing;
      if (rawMode) {
        try {
          payload = JSON.parse(rawText);
        } catch (pe) {
          setEditErr('Invalid JSON: ' + (pe.message || pe));
          return;
        }
      }
  const base = getBackendBase();
  const res = await fetch(`${base}/admin/products/${editing.id}`, { method: 'PUT', headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const j = await res.json();
      if (res.ok) {
        setEditing(null);
        setRawMode(false);
        setRawText('');
        setEditErr(null);
        load();
        loadStats();
      } else {
        setEditErr(j && j.error ? j.error : 'Save failed');
        console.error('save failed', j);
      }
    } catch (e) { setEditErr(String(e)); console.error(e); }
  }

  if (!getToken()) return (
    <div className="p-4">Unauthorized. Please login at <a href="/admin/login" className="text-blue-500">/admin/login</a></div>
  );

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-3">Admin Dashboard</h2>
      {stats && (
        <div className="mb-4">
          <div>Total products: {stats.totalProducts}</div>
          <div>Total orders: {stats.totalOrders}</div>
          <div>Total sales: {stats.totalSales}</div>
          <div>Top selling: {stats.topSelling && stats.topSelling.length ? stats.topSelling.map(t=>`${t.id}(${t.sold})`).join(', ') : 'n/a'}</div>
        </div>
      )}

      <div className="mb-3 flex items-center gap-2">
        <button onClick={load} className="px-2 py-1 bg-gray-800 text-white rounded">Refresh</button>
        <button onClick={()=>setCreating(true)} className="px-2 py-1 bg-green-600 text-white rounded">Create product</button>
      </div>

      {loading ? <div>Loading...</div> : (
        <div className="space-y-2">
          {products.map(p => (
            <div key={p.id} className="p-2 border rounded bg-gray-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-800 flex items-center justify-center">
                  {p.img ? <img src={p.img} alt={p.name} className="w-full h-full object-cover" /> : <div className="text-xs text-gray-400">No</div>}
                </div>
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-gray-300">ID: {p.id}</div>
                </div>
              </div>
              <div>
                <button onClick={()=>startEdit(p)} className="px-2 py-1 bg-blue-600 text-white rounded mr-2">Edit</button>
                <button onClick={async ()=>{
                  if (!confirm(`Delete product ${p.id}? This cannot be undone.`)) return;
                  try {
                    const base = getBackendBase();
                    const res = await fetch(`${base}/admin/products/${p.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } });
                    const j = await res.json();
                    if (res.ok) load(); else alert(j && j.error ? j.error : 'Delete failed');
                  } catch (e) { alert('Delete failed: ' + (e && e.message)); }
                }} className="px-2 py-1 bg-red-600 text-white rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 p-4 rounded w-full max-w-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="">Edit product {editing.id}</h3>
              <div className="flex gap-2">
                <button onClick={()=>{ setRawMode((r)=>!r); if (!rawMode) setRawText(JSON.stringify(editing, null, 2)); }} className="px-2 py-1 bg-gray-800 text-white rounded">{rawMode ? 'Form' : 'Raw JSON'}</button>
                <button onClick={()=>{ setEditing(null); setRawMode(false); setRawText(''); setEditErr(null); }} className="px-2 py-1 bg-gray-700 text-white rounded">Close</button>
              </div>
            </div>

            {editErr && <div className="text-sm text-red-400 mb-2">{editErr}</div>}

            {!rawMode ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-300">Name</label>
                    <input value={editing.name || ''} onChange={(e)=>setEditing({...editing, name: e.target.value})} className="w-full p-2 border rounded" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-300">Price</label>
                    <input value={editing.price || ''} onChange={(e)=>setEditing({...editing, price: e.target.value})} className="w-full p-2 border rounded" />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-300">Image URL</label>
                  <input value={editing.img || ''} onChange={(e)=>setEditing({...editing, img: e.target.value})} className="w-full p-2 border rounded" />
                </div>

                <div>
                  <label className="text-xs text-gray-300">Description</label>
                  <textarea value={editing.description || ''} onChange={(e)=>setEditing({...editing, description: e.target.value})} className="w-full p-2 border rounded" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-300">Tags (comma)</label>
                    <input value={(editing.tags || []).join ? (editing.tags || []).join(',') : (editing.tags || '')} onChange={(e)=>{ const v=e.target.value; setEditing({...editing, tags: v.split(',').map(s=>s.trim()).filter(Boolean)}); }} className="w-full p-2 border rounded" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-300">Specs (comma)</label>
                    <input value={(editing.specs || []).join ? (editing.specs || []).join(',') : (editing.specs || '')} onChange={(e)=>{ const v=e.target.value; setEditing({...editing, specs: v.split(',').map(s=>s.trim()).filter(Boolean)}); }} className="w-full p-2 border rounded" />
                  </div>
                </div>

                <div className="flex gap-2 mt-2">
                  <button onClick={saveEdit} className="px-3 py-2 bg-green-600 text-white rounded">Save</button>
                  <button onClick={()=>{ setEditing(null); setRawMode(false); setRawText(''); setEditErr(null); }} className="px-3 py-2 bg-gray-600 text-white rounded">Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <label className="text-xs text-gray-300">Raw JSON</label>
                <textarea value={rawText} onChange={(e)=>setRawText(e.target.value)} rows={12} className="w-full p-2 border rounded font-mono text-sm" />
                <div className="flex gap-2 mt-2">
                  <button onClick={saveEdit} className="px-3 py-2 bg-green-600 text-white rounded">Save JSON</button>
                  <button onClick={()=>{ setRawMode(false); setRawText(''); setEditErr(null); }} className="px-3 py-2 bg-gray-600 text-white rounded">Back to Form</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {creating && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 p-4 rounded w-full max-w-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="">Create new product</h3>
              <button onClick={()=>{ setCreating(false); setNewProd({ name: '', price: '', img: '', description: '' }); }} className="px-2 py-1 bg-gray-700 text-white rounded">Close</button>
            </div>
            <div className="space-y-2">
              <input placeholder="Name" value={newProd.name} onChange={(e)=>setNewProd({...newProd, name: e.target.value})} className="w-full p-2 border rounded" />
              <input placeholder="Price" value={newProd.price} onChange={(e)=>setNewProd({...newProd, price: e.target.value})} className="w-full p-2 border rounded" />
              <input placeholder="Image URL" value={newProd.img} onChange={(e)=>setNewProd({...newProd, img: e.target.value})} className="w-full p-2 border rounded" />
              <textarea placeholder="Description" value={newProd.description} onChange={(e)=>setNewProd({...newProd, description: e.target.value})} className="w-full p-2 border rounded" />
              <div className="flex gap-2">
                <button onClick={async ()=>{
                  try {
                    const base = getBackendBase();
                    const res = await fetch(`${base}/admin/products`, { method: 'POST', headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' }, body: JSON.stringify(newProd) });
                    const j = await res.json();
                    if (res.ok) { setCreating(false); setNewProd({ name: '', price: '', img: '', description: '' }); load(); } else alert(j && j.error ? j.error : 'Create failed');
                  } catch(e){ alert('Create failed: ' + (e && e.message)); }
                }} className="px-3 py-2 bg-green-600 text-white rounded">Create</button>
                <button onClick={()=>{ setCreating(false); setNewProd({ name: '', price: '', img: '', description: '' }); }} className="px-3 py-2 bg-gray-600 text-white rounded">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
