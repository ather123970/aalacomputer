import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Nav from '../nav';
import { useTheme } from '../components/ThemeProvider';

const card = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
};

function formatCurrency(num = 0) {
  try {
    return Number(num).toLocaleString('en-PK');
  } catch {
    return String(num || 0);
  }
}

function formatDate(d) {
  try {
    return new Date(d).toLocaleString();
  } catch {
    return String(d || '');
  }
}

import { API_BASE } from '../config'

export default function Profile() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const BACKEND_URL = API_BASE.replace(/\/$/, '')

  const stats = useMemo(() => {
    const totalOrders = Array.isArray(orders) ? orders.length : 0;
    const totalSpent = (orders || []).reduce((sum, o) => sum + (o.total || 0), 0);
    return { totalOrders, totalSpent };
  }, [orders]);

  // === 🧠 Auto-delete old history after 1 day ===
  useEffect(() => {
    const timestamp = localStorage.getItem('orders_timestamp');
    const now = Date.now();

    if (timestamp && now - Number(timestamp) > 24 * 60 * 60 * 1000) {
      localStorage.removeItem('orders');
      localStorage.removeItem('orders_timestamp');
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadUserAndOrders() {
      setLoading(true);
      setErr(null);

      const localUserRaw = localStorage.getItem('user');
      const localToken = localStorage.getItem('accessToken');

      if (localUserRaw) {
        try {
          setUser(JSON.parse(localUserRaw));
        } catch {}
      }

      if (localToken) {
        try {
          const r = await fetch(`${BACKEND_URL}/v1/auth/me`, {
            headers: { Authorization: `Bearer ${localToken}` },
            credentials: 'include',
          });
          if (r.ok) {
            const j = await r.json();
            if (j?.user && mounted) {
              setUser(j.user);
              localStorage.setItem('user', JSON.stringify(j.user));
            }
          }
        } catch (e) {
          console.warn('Failed to fetch /me', e);
        }
      }

      const tryEndpoints = [
        `${BACKEND_URL}/v1/orders/me`,
        `${BACKEND_URL}/v1/orders`,
        `${BACKEND_URL}/v1/orders/user`,
      ];

      let loaded = null;
      if (localToken) {
        for (const url of tryEndpoints) {
          try {
            const res = await fetch(url, {
              headers: { Authorization: `Bearer ${localToken}`, 'Content-Type': 'application/json' },
              credentials: 'include',
            });
            if (res.ok) {
              const json = await res.json();
              const arr = Array.isArray(json) ? json : json.orders || json.data || null;
              if (Array.isArray(arr)) {
                loaded = arr;
                break;
              }
            }
          } catch {}
        }
      }

      if (!loaded) {
        try {
          const raw = localStorage.getItem('orders');
          if (raw) loaded = JSON.parse(raw);
        } catch {}
      }

      if (mounted) {
        setOrders(loaded || []);
        setLoading(false);
        if (loaded?.length) localStorage.setItem('orders_timestamp', Date.now());
      }
    }

    loadUserAndOrders();

    return () => {
      mounted = false;
    };
  }, [BACKEND_URL]);

  const clearHistory = () => {
    localStorage.removeItem('orders');
    localStorage.removeItem('orders_timestamp');
    setOrders([]);
  };

  if (!user && !loading) {
    return (
      <motion.div
        initial="hidden"
        animate="show"
        variants={fadeInUp}
        className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6"
      >
        <h2 className="text-3xl font-bold mb-2">You're not signed in</h2>
        <p className="text-gray-400 text-center max-w-lg">
          Sign in to see your profile and order history.
        </p>
      </motion.div>
    );
  }

  return (
    <>
      <Nav />
      <div className="bg-black min-h-screen text-white p-6 md:px-20">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={scaleIn}
          className="bg-gradient-to-r from-blue-700 via-purple-600 to-indigo-500 rounded-2xl p-6 mb-8 shadow-lg flex flex-col md:flex-row items-center gap-6 relative overflow-hidden"
        >
          <motion.div
            animate={{ rotate: [0, 3, -3, 0] }}
            transition={{ repeat: Infinity, duration: 5 }}
            className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-indigo-500/10 blur-3xl"
          />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 10 }}
            className="w-28 h-28 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/10 z-10"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-2xl font-bold text-white/90"
              >
                {(user?.name || user?.email || 'U').slice(0, 2).toUpperCase()}
              </motion.div>
            )}
          </motion.div>

          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="show"
            className="flex-1 min-w-0 z-10"
          >
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
              {user?.name || 'User'} <span className="text-xl">👋</span>
            </h1>
            <p className="text-gray-200 mt-1">{user?.email}</p>

            <motion.div
              variants={{ show: { transition: { staggerChildren: 0.2 } } }}
              initial="hidden"
              animate="show"
              className="mt-4 flex gap-4 items-center flex-wrap"
            >
              <motion.div variants={scaleIn}><Stat label="Orders" value={stats.totalOrders} /></motion.div>
              <motion.div variants={scaleIn}><Stat label="Total Spent" value={`PKR ${formatCurrency(stats.totalSpent)}`} /></motion.div>
              <motion.button
                variants={scaleIn}
                onClick={clearHistory}
                className="ml-2 text-sm bg-white/10 px-4 py-2 rounded-md hover:bg-red-500/60 transition"
              >
                Clear History
              </motion.button>

              {/* THEME TOGGLE BUTTON */}
              <ThemeToggle />
              <motion.button
                variants={scaleIn}
                onClick={() => {
                  localStorage.removeItem('accessToken');
                  localStorage.removeItem('user');
                  window.location.reload();
                }}
                className="ml-2 text-sm bg-white/10 px-4 py-2 rounded-md hover:bg-white/20 transition"
              >
                Sign out
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Orders */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Your Orders</h2>
            <div className="text-sm text-gray-400">
              {loading ? 'Loading…' : `${stats.totalOrders} total`}
            </div>
          </div>

          {err && <div className="text-red-400 mb-4">Error: {String(err)}</div>}

          {loading ? (
            <div className="py-12 text-center text-gray-400">Loading orders…</div>
          ) : orders.length === 0 ? (
            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeInUp}
              className="text-gray-400 text-center py-16"
            >
              <p className="text-lg mb-2">You haven’t placed any orders yet.</p>
              <p className="text-sm text-gray-500">
                Browse and make your first purchase to see it here.
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.08 } } }}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              <AnimatePresence>
                {orders.map((order, idx) => {
                  const id = order.id ?? order._id ?? `#${idx + 1}`;
                  const createdAt = order.createdAt || order.date || Date.now();
                  const items = Array.isArray(order.items)
                    ? order.items
                    : order.cart || order.products || [];
                  const total =
                    order.total ??
                    items.reduce((s, it) => s + (it.price || 0) * (it.qty || 1), 0);

                  return (
                    <motion.div
                      key={id}
                      variants={card}
                      whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(59,130,246,0.3)' }}
                      exit={{ opacity: 0, y: 10 }}
                      className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow hover:shadow-blue-800/30 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Order {String(id)}</p>
                          <p className="font-semibold text-lg">{formatDate(createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400">Status</div>
                          <div className="font-semibold text-blue-300">
                            {order.status || 'Completed'}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3">
                        {items.length ? (
                          items.map((it, i) => (
                            <motion.div
                              key={i}
                              whileHover={{ scale: 1.04 }}
                              className="flex items-center gap-4 bg-gray-800 rounded-xl p-3"
                            >
                              <div className="w-16 h-16 flex items-center justify-center bg-gray-700 rounded-lg overflow-hidden">
                                {it.img ? (
                                  <img
                                    src={it.img}
                                    alt={it.name}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <div className="text-sm text-gray-200 px-2">
                                    {(it.name || '').slice(0, 10)}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">
                                  {it.name || it.title || 'Item'}
                                </p>
                                <p className="text-sm text-gray-400 truncate">
                                  {it.description || it.specs?.[0] || ''}
                                </p>
                                <div className="text-xs text-gray-500 mt-1">
                                  Qty: {it.qty ?? 1}
                                </div>
                              </div>
                              <div className="text-sm font-semibold text-blue-300">
                                PKR {formatCurrency((it.price || 0) * (it.qty || 1))}
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <div className="text-gray-500 italic text-sm">
                            No items recorded for this order.
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                          Items: {items.length}
                        </div>
                        <div className="text-lg font-semibold">
                          Total: PKR {formatCurrency(total)}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </section>
      </div>
    </>
  );
}

function Stat({ label, value }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-black/40 px-4 py-2 rounded-xl border border-white/5 hover:border-blue-400/50 transition"
    >
      <div className="text-sm text-gray-300">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </motion.div>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme() || { theme: 'light', toggleTheme: () => {} };
  return (
    <motion.div variants={scaleIn} className="flex items-center gap-2">
      <div className="text-sm text-gray-200">Theme</div>
      <button
        onClick={() => toggleTheme()}
        className={`px-3 py-2 rounded-md transition border ${theme === 'light' ? 'bg-white text-black' : 'bg-black/20 text-white'}`}
      >
        {theme === 'light' ? 'Dark' : 'light'}
      </button>
    </motion.div>
  );
}
