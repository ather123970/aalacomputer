import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion as FM } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { signInWithPopup } from 'firebase/auth';
import { app, auth, googleProvider } from '../../src/firebaseClient';
import { API_BASE } from '../../src/config'

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.32 } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.18 } },
};

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  // Prefer explicit VITE_BACKEND_URL, otherwise use the dev proxy path '/api' while developing
  // so mobile devices can hit the dev server host (when Vite runs with --host).
  const BACKEND_URL = API_BASE

  // Google auth removed
  // use client-side firebase auth + provider
  // (initialized in public/firebaseClient.js)

  function update(field, value) {
    setForm((s) => ({ ...s, [field]: value }));
    setError(null);
    setInfo(null);
  }

  function validate() {
    if (!form.email || !form.password) return "Email and password are required";
    if (mode === "register") {
      if (!form.name || form.name.length < 2) return "Name must be at least 2 characters";
      if (form.password.length < 6) return "Password must be at least 6 characters";
    }
    return null;
  }

  async function submit(e) {
    e?.preventDefault();
    const v = validate();
    if (v) return setError(v);

    setLoading(true);
    setError(null);
    setInfo(null);

    const payload =
      mode === "register"
        ? {
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,
            phone: form.phone.trim(),
          }
        : { email: form.email.trim(), password: form.password };

    try {
  const url = `${BACKEND_URL}/v1/auth/${mode === "register" ? "register" : "login"}`
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      console.log('[auth UI] login response', res.status, data);
      if (!res.ok) {
        // If server returned extra details (dev), show them
        const msg = data.message || data.error || 'Request failed';
        const details = data.details ? ` - ${data.details}` : '';
        throw new Error(msg + details);
      }

      if (data.accessToken) localStorage.setItem("accessToken", data.accessToken);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

      setInfo(mode === "register" ? "Registered successfully" : "Login successful");
      setTimeout(() => navigate("/profile"), 700);
    } catch (err) {
      setError(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Google Login Handler
  async function handleGoogleSignIn() {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Save user in localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: user.displayName,
          email: user.email,
          avatar: user.photoURL,
        })
      );

      setInfo('Login successful');
      setTimeout(() => navigate('/profile'), 300);
    } catch (error) {
      console.error("Google Login Error:", error);
      setError("Google Sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
  <FM.div
        variants={cardVariants}
        initial="hidden"
        animate="enter"
        exit="exit"
        className="w-full max-w-3xl  bg-white rounded-2xl shadow-2xl p-6 md:p-10 flex flex-col md:flex-row gap-6"
      >
        {/* Left Side */}
        <div className="md:w-1/2 flex flex-col justify-center gap-4 px-2">
          <div className="flex items-center gap-3">
         
            <div>
              <h1 className="text-2xl font-bold text-white">Aala Computers</h1>
              <p className="text-sm text-gray-100">PCs, Parts & Accessories — buy with confidence.</p>
            </div>
          </div>

          <p className="mt-2 text-gray-100">
            {mode === "login"
              ? "Welcome back — sign in to manage orders, view deals, and checkout faster."
              : "Create your account and start ordering. Save addresses for faster checkout."}
          </p>

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setMode("login")}
              className={`px-4 py-2 rounded-full font-semibold transition ${
                mode === "login"
                  ? "bg-blue-500 text-black shadow-md"
                  : "bg-transparent text-gray-300 border border-gray-800 hover:bg-white/5"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode("register")}
              className={`px-4 py-2 rounded-full font-semibold transition ${
                mode === "register"
                  ? "bg-blue-500 text-black shadow-md"
                  : "bg-transparent text-gray-300 border border-gray-800 hover:bg-white/5"
              }`}
            >
              Register
            </button>
          </div>

          {/* 🔹 Google Sign-in Button */}
          <FM.button
          initial={{ x: 100, opacity: 1 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.3, ease: 'easeInOut' }}
            onClick={handleGoogleSignIn}
            className="mt-4 flex items-center justify-center gap-2 bg-white text-black font-semibold py-2 rounded-lg hover:bg-gray-200 transition shadow-md"
          >
            <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
            </FM.button>

          <div className="mt-auto text-xs text-gray-500">
            Tip: Use a real email for order updates. Passwords are hashed server-side.
          </div>
        </div>

        {/* Right Side Form */}
        <form
          onSubmit={submit}
          className="md:w-1/2 bg-black/40 border border-gray-800 rounded-xl p-4 md:p-6 flex flex-col gap-3"
        >
          <h2 className="text-lg font-semibold text-white">
            {mode === "login" ? "Sign in" : "Create account"}
          </h2>

          {error && <div className="text-sm text-red-400 bg-red-900/10 p-2 rounded">{error}</div>}
          {info && <div className="text-sm text-green-300 bg-green-900/10 p-2 rounded">{info}</div>}

          {mode === "register" && (
            <>
              <label className="text-xs text-gray-400">Full name</label>
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Your name"
                className="w-full bg-gray-900 border border-gray-800 text-white rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </>
          )}

          <label className="text-xs text-gray-400">Email</label>
          <input
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="you@domain.com"
            type="email"
            className="w-full bg-gray-900 border border-gray-800 text-white rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <label className="text-xs text-gray-400 flex items-center justify-between">
            <span>Password</span>
            <button
              type="button"
              onClick={() => setShowPass((s) => !s)}
              className="text-xs text-gray-400 hover:text-gray-200"
            >
              {showPass ? "Hide" : "Show"}
            </button>
          </label>

          <div className="relative">
            <input
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder="••••••••"
              type={showPass ? "text" : "password"}
              className="w-full bg-gray-900 border border-gray-800 text-white rounded px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showPass ? <Eye size={16} /> : <EyeOff size={16} />}
            </div>
          </div>

          {mode === "register" && (
            <FM.div initial={{y:-100,opacity:0}} animate={{y:0,opacity:0}} transition={{duration:0.3,ease:'easeInOut'}}>
              <label className="text-xs text-gray-400">Phone (optional)</label>
              <input
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="0312xxxxxxx"
                className="w-full bg-gray-900 border border-gray-800 text-white rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FM.div>
          )}

          <div className="flex items-center justify-between mt-1">
            <label className="flex items-center gap-2 text-xs text-gray-400">
              <input type="checkbox" className="w-4 h-4 accent-blue-500 rounded" />
              Remember me
            </label>
            <a href="/forgot" className="text-xs text-blue-400 hover:underline">
              Forgot?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-3 bg-blue-500 hover:bg-blue-600 text-black font-semibold py-2 rounded-lg shadow-md transition disabled:opacity-60"
          >
            {loading
              ? mode === "login"
                ? "Signing in..."
                : "Creating..."
              : mode === "login"
              ? "Sign in"
              : "Create account"}
          </button>

          <div className="text-center text-sm text-gray-500 mt-2">
            {mode === "login" ? (
              <>
                Don’t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="text-blue-400 font-semibold"
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-blue-400 font-semibold"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </form>
  </FM.div>

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-500">
        Built for Aala Computers — secure auth. Keep secrets safe.
      </div>
    </div>
  );
}