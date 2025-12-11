import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, Package } from 'lucide-react';

const AdminLoginNew = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@aalacomputer.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Dynamic API URL - works in both dev and production
      let base;
      if (import.meta.env.DEV) {
        // Development: use localhost
        base = import.meta.env.VITE_API_URL || 'http://localhost:10000';
      } else {
        // Production: use same origin (Render serves both frontend and backend)
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        const port = window.location.port;
        base = port && port !== '80' && port !== '443'
          ? `${protocol}//${hostname}:${port}`
          : `${protocol}//${hostname}`;
      }

      console.log('[AdminLogin] Attempting login with API base:', base);
      console.log('[AdminLogin] Password length:', password.length);

      // Send login request to backend
      const response = await fetch(`${base}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      console.log('[AdminLogin] Response status:', response.status);
      console.log('[AdminLogin] Response headers:', response.headers);

      if (response.ok) {
        const data = await response.json();
        console.log('[AdminLogin] Login successful, token received');
        // Store JWT token in sessionStorage (expires when browser closes)
        sessionStorage.setItem('aalacomp_admin_token', data.accessToken);
        console.log('[AdminLogin] Token stored in sessionStorage - will expire on browser close');

        // Redirect to dashboard
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 500);
      } else {
        const errorData = await response.json();
        console.log('[AdminLogin] Login failed:', errorData);
        setError(errorData.error || 'Invalid credentials');
        setLoading(false);
      }
    } catch (error) {
      console.error('Login error - Full error object:', error);
      console.error('Login error - Message:', error?.message);
      console.error('Login error - Stack:', error?.stack);
      console.error('Login error - Type:', typeof error);
      console.error('Login error - Constructor:', error?.constructor?.name);

      // Provide more specific error messages
      let errorMsg = 'Connection error. Please try again.';
      if (error?.message?.includes('Failed to fetch')) {
        errorMsg = 'Cannot connect to backend. Make sure the server is running.';
      } else if (error?.message) {
        errorMsg = error.message;
      }

      setError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Package className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Aala Admin</h1>
            <p className="text-gray-600">Dashboard Login</p>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6" autoComplete="off">
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-blue-500" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter admin email"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 transition bg-blue-50 text-gray-900 placeholder-gray-500"
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-blue-500" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="off"
                  spellCheck="false"
                  className="w-full pl-10 pr-12 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 transition bg-blue-50 text-gray-900 placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-blue-500 hover:text-blue-700 transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </motion.div>

            {/* Login Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-lg transition shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Logging in...
                </>
              ) : (
                <>
                  <Lock size={20} />
                  Login to Dashboard
                </>
              )}
            </motion.button>
          </form>

          {/* Info Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <p className="text-xs text-gray-600 font-semibold">🔒 Secure Login</p>
            <p className="text-xs text-gray-700 mt-2">
              Enter your admin credentials to access the dashboard. Your session will be secured with JWT authentication.
            </p>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-gray-600 text-sm mt-6"
        >
          © 2025 Aala Computer Admin. All rights reserved.
        </motion.p>
      </motion.div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default AdminLoginNew;
