import { motion } from 'framer-motion';
import { Heart, BookOpen, Feather } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [hasTodayDiary, setHasTodayDiary] = useState(false);
  const [loadingButton, setLoadingButton] = useState(null); // 'write' or 'history'
  const [userName, setUserName] = useState('');

  // Get user name on mount
  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    const username = localStorage.getItem('username');
    if (username) {
      setUserName(username);
    } else if (storedName) {
      setUserName(storedName);
    }
  }, []);

  // Check if user has already written today
  useEffect(() => {
    const checkTodayDiary = async () => {
      try {
        const { data } = await axios.post(`${API_BASE_URL}/api/diary/today`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (data && data.content && data.content.trim().length > 0) {
          setHasTodayDiary(true);
        }
      } catch (err) {
        console.error("Failed to check today's diary", err);
      }
    };
    checkTodayDiary();
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full">
      {/* Background image layer - Same as login page */}
      <div 
        className="absolute inset-0 w-full h-full bg-[url('/login-bg.jpg')] bg-cover bg-center bg-no-repeat"
        style={{ backgroundAttachment: 'fixed' }}
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 w-full h-full bg-black/40" />
      
      {/* Content */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 pt-20"
      >
        {/* Glass Card Container - Darker to match background */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-full max-w-md bg-black/50 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8"
        >
          {/* Top Section - Heart & Welcome */}
          <div className="flex flex-col items-center justify-center w-full">
            {/* Animated Heart */}
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: 'spring',
                stiffness: 200,
                damping: 15,
                delay: 0.3
              }}
              className="mb-6"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.15, 1],
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.5,
                  ease: 'easeInOut'
                }}
                style={{
                  filter: 'drop-shadow(0px 12px 20px rgba(0,0,0,0.9)) drop-shadow(0px 4px 8px rgba(0,0,0,0.6))'
                }}
              >
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="heartGradient" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#ff4444"/>
                      <stop offset="50%" stopColor="#dc2626"/>
                      <stop offset="100%" stopColor="#7f1d1d"/>
                    </linearGradient>
                  </defs>
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="url(#heartGradient)"/>
                </svg>
              </motion.div>
            </motion.div>

            {/* Welcome Text */}
            {userName && (
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="mb-2"
              >
                <span 
                  className="text-xl sm:text-2xl text-amber-200 font-medium drop-shadow-lg"
                  style={{ fontFamily: "'Caveat', cursive" }}
                >
                  Dear {userName},
                </span>
              </motion.div>
            )}
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 text-center tracking-wide drop-shadow-lg"
              style={{ fontFamily: "'Caveat', cursive", lineHeight: '1.1' }}
            >
              Welcome to your
            </motion.h1>
            
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 text-center drop-shadow-lg"
              style={{ fontFamily: "'Caveat', cursive", lineHeight: '1.1', letterSpacing: '2px' }}
            >
              Love Diary
            </motion.h2>
          </div>

          {/* Bottom Section - Buttons & Quote */}
          <div className="w-full flex flex-col items-center">
            {/* Buttons Container */}
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="flex flex-col gap-3 w-full mb-6"
            >
              {/* Write Diary Button */}
              <motion.button 
                onClick={() => {
                  if (loadingButton) return;
                  setLoadingButton('write');
                  navigate('/write');
                }}
                whileHover={{ scale: loadingButton ? 1 : 1.02 }}
                whileTap={{ scale: loadingButton ? 1 : 0.98 }}
                disabled={loadingButton !== null}
                className="group bg-[#2c1810] text-white py-3 px-5 rounded-xl shadow-xl hover:shadow-2xl hover:bg-[#3d2418] transition-all flex items-center justify-center gap-2 text-lg sm:text-xl font-semibold border border-[#5c3a21] drop-shadow disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ fontFamily: "'Caveat', cursive" }}
              >
                {loadingButton === 'write' ? (
                  <span>Loading...</span>
                ) : (
                  <>
                    <Feather size={22} className="group-hover:rotate-12 transition-transform" />
                    <span>{hasTodayDiary ? 'Continue Your Diary Today' : "Write Today's Diary"}</span>
                  </>
                )}
              </motion.button>

              {/* View Diary Button */}
              <motion.button 
                onClick={() => {
                  if (loadingButton) return;
                  setLoadingButton('history');
                  navigate('/history');
                }}
                whileHover={{ scale: loadingButton ? 1 : 1.02 }}
                whileTap={{ scale: loadingButton ? 1 : 0.98 }}
                disabled={loadingButton !== null}
                className="group bg-[#8b4513] text-white py-3 px-5 rounded-xl shadow-lg hover:shadow-xl hover:bg-[#a0522d] transition-all flex items-center justify-center gap-2 text-lg sm:text-xl font-semibold border-2 border-[#c4b5a0] drop-shadow disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ fontFamily: "'Caveat', cursive" }}
              >
                {loadingButton === 'history' ? (
                  <span>Loading...</span>
                ) : (
                  <>
                    <BookOpen size={22} className="group-hover:scale-110 transition-transform" />
                    <span>View Your Diaries</span>
                  </>
                )}
              </motion.button>
            </motion.div>

            {/* Footer Quote */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="text-sm sm:text-base text-white text-center italic leading-relaxed drop-shadow"
              style={{ fontFamily: "'Caveat', cursive", letterSpacing: '0.5px' }}
            >
              "Every love story is beautiful, but ours is my favorite."
            </motion.p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}