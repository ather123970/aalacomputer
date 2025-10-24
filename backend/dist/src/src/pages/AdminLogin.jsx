import React, { useState } from 'react';
import { API_BASE } from '../config'

export default function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(null);

  async function submit(e) {
    e.preventDefault();
    try {
      const url = API_BASE.replace(/\/+$/, '') + '/admin/login';
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      const j = await res.json();
      if (!res.ok) return setErr(j && j.error ? j.error : `Login failed (${res.status})`);
      const token = j.token;
      localStorage.setItem('aalacomp_admin_token', token);
      setErr(null);
      if (typeof onLogin === 'function') onLogin();
      window.location.href = '/admin';
    } catch (e) {
      console.error('admin login error', e);
      setErr(e && e.message ? `Network error: ${e.message}. Make sure backend is running and VITE_BACKEND_URL is set if needed.` : 'Network error');
    }
  }

  // dev-friendly prefill
  React.useEffect(()=>{
    try {
      const pre = import.meta && import.meta.env && import.meta.env.VITE_ENABLE_ADMIN_PREFILL;
      if (pre && (!username && !password)) {
        setUsername('aalacomputeradmin@gmail.com');
        setPassword('karachi123');
      }
    } catch(e){}
  }, []);

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-2">Admin login</h2>
      {err && <div className="text-sm text-red-400 mb-2">{err}</div>}
      <form onSubmit={submit} className="space-y-2">
        <input className="w-full p-2 border rounded" placeholder="username" value={username} onChange={(e)=>setUsername(e.target.value)} />
        <input className="w-full p-2 border rounded" placeholder="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <div className="flex gap-2">
          <button className="px-3 py-2 bg-blue-600 text-white rounded">Login</button>
        </div>
      </form>
    </div>
  );
}
