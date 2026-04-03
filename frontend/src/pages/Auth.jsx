import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useFlash } from '../App';
import API_BASE_URL from '../config/api';

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '', email: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showFlash } = useFlash();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, []);

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signup') {
      setIsLogin(false);
    } else if (mode === 'login') {
      setIsLogin(true);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setError('');
    setIsLoading(true);
    const endpoint = isLogin ? '/api/login' : '/api/signup';

    try {
      const { data } = await axios.post(`${API_BASE_URL}${endpoint}`, formData);
      
      if (isLogin) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.name || data.email || '');
        localStorage.setItem('username', formData.username);
        showFlash('Welcome back! Successfully logged in', 'success');
        navigate('/dashboard');
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', formData.email || '');
        localStorage.setItem('username', formData.username);
        showFlash('Account created successfully! Welcome to your diary', 'success');
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
      showFlash(err.response?.data?.error || 'Login failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full">
      {/* Background image layer - Local writing image */}
      <div 
        className="absolute inset-0 w-full h-full bg-[url('/login-bg.jpg')] bg-cover bg-center bg-no-repeat"
        style={{ backgroundAttachment: 'fixed' }}
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 w-full h-full bg-black/40" />
      
      {/* Content */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6"
      >
        <div className="w-full max-w-sm px-6">
          <h2 className="text-4xl sm:text-5xl font-bold text-center text-white mb-6 drop-shadow-lg" style={{ fontFamily: "'Caveat', cursive" }}>
            {isLogin ? 'Unlock Your Diary' : 'Sign Up to Get Started'}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Hidden dummy fields to prevent browser autofill */}
            <input type="text" name="fake_username" style={{ display: 'none' }} tabIndex="-1" />
            <input type="password" name="fake_password" style={{ display: 'none' }} tabIndex="-1" />
            
            <input
              type="text"
              name="username"
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
              required
              autoComplete="off"
              data-lpignore="true"
              className="w-full px-4 py-3.5 bg-[#e6d2b5] rounded-lg border border-[#c4b5a0] text-black placeholder-[#6b5a45] focus:outline-none focus:ring-2 focus:ring-[#5c3a21] focus:border-[#5c3a21] transition-all shadow-sm"
            />
            {!isLogin && (
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="off"
                data-lpignore="true"
                className="w-full px-4 py-3.5 bg-[#e6d2b5] rounded-lg border border-[#c4b5a0] text-black placeholder-[#6b5a45] focus:outline-none focus:ring-2 focus:ring-[#5c3a21] focus:border-[#5c3a21] transition-all shadow-sm"
              />
            )}
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="off"
              data-lpignore="true"
              className="w-full px-4 py-3.5 bg-[#e6d2b5] rounded-lg border border-[#c4b5a0] text-black placeholder-[#6b5a45] focus:outline-none focus:ring-2 focus:ring-[#5c3a21] focus:border-[#5c3a21] transition-all shadow-sm"
            />
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2c1810] text-[#f5f5dc] py-4 font-semibold mt-2 rounded-lg shadow-lg hover:bg-[#1a0f08] hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all border border-[#5c3a21] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ fontFamily: "'Caveat', cursive", fontSize: '1.5rem' }}
            >
              {isLoading ? 'Please wait...' : (isLogin ? 'Unlock Diary' : 'Sign Up')}
            </button>
          </form>

          <p className="text-center mt-6 text-base text-white font-medium drop-shadow" style={{ fontFamily: "'Playfair Display', serif" }}>
            {isLogin ? "Don't have a diary yet? " : "Already have a diary? "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-white font-bold hover:underline drop-shadow"
              style={{ fontFamily: "'Caveat', cursive", fontSize: '1.3rem' }}
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}