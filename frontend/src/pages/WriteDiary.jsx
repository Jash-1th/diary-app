import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, Feather, X, Images } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash.debounce';
import axios from 'axios';
import API_BASE_URL from '../config/api';

// 6 aesthetic diary background options
const BACKGROUND_OPTIONS = [
  { id: 1, name: 'Soft Cream', url: 'soft-cream', color: '#f5f0e6', style: 'css', gradient: 'linear-gradient(135deg, #f5f0e6 0%, #ebe5d8 50%, #e8dfd0 100%)' },
  { id: 2, name: 'Rose Book', url: '/bg-rose-book.jpg', color: '#4a3a2a', style: 'image' },
  { id: 3, name: 'Hearts', url: '/bg-red-heart.jpg', color: '#2c1810', style: 'image' },
  { id: 4, name: 'Stone Heart', url: '/bg-rock.jpg', color: '#4a6fa5', style: 'image' },
  { id: 5, name: 'Moonlit Shore', url: 'https://unsplash.com/photos/a_hPPrncGlQ/download?w=1920&q=80', color: '#1a1a2e', style: 'image' },
  { id: 6, name: 'Night Ocean', url: 'https://unsplash.com/photos/9KDuSi7dJv4/download?w=1920&q=80', color: '#0a1929', style: 'image' },
];

export default function WriteDiary() {
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('Saved');
  const [selectedBg, setSelectedBg] = useState('soft-cream');
  const [showBgModal, setShowBgModal] = useState(false);
  const [hasSelectedBg, setHasSelectedBg] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [direction, setDirection] = useState(0);
  const [pages, setPages] = useState(['']);
  const [isLoading, setIsLoading] = useState(true);
  const pagesRef = useRef(pages);
  const navigate = useNavigate();

  // Keep ref in sync with state
  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

  // Load saved background and check if user has already selected one today
  useEffect(() => {
    const savedBg = localStorage.getItem('diaryBackground');
    const lastVisitDate = localStorage.getItem('lastDiaryVisitDate');
    const today = new Date().toDateString();
    
    // Check if it's a new day
    if (lastVisitDate !== today) {
      // New day - show background selection modal
      setShowBgModal(true);
      setHasSelectedBg(false);
      localStorage.setItem('lastDiaryVisitDate', today);
    } else {
      // Same day - use saved background
      if (savedBg) {
        setSelectedBg(savedBg);
      }
      setHasSelectedBg(true);
    }
  }, []);

  // Fetch today's diary pages
  useEffect(() => {
    const fetchToday = async () => {
      try {
        const { data } = await axios.post(`${API_BASE_URL}/api/diary/today`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (data) {
          // Load background from database if available
          if (data.background) {
            setSelectedBg(data.background);
            localStorage.setItem('diaryBackground', data.background);
          }
          if (data.content) {
            // Split content into pages (or use as single page)
            const contentPages = data.pages || [data.content];
            setPages(contentPages);
            setTotalPages(contentPages.length);
            setContent(contentPages[0] || '');
          }
        }
      } catch (err) {
        console.error("Failed to fetch today's diary", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchToday();
  }, []);

  const handleBgSelect = async (bgUrl) => {
    setSelectedBg(bgUrl);
    localStorage.setItem('diaryBackground', bgUrl);
    localStorage.setItem('hasSelectedBackground', 'true');
    setHasSelectedBg(true);
    setShowBgModal(false);
    
    // Save background change to database immediately
    try {
      setStatus('Saving background...');
      await axios.post(`${API_BASE_URL}/api/diary/today`, { 
        content: content,
        pages: pages,
        background: bgUrl
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStatus('Saved');
    } catch (err) {
      setStatus('Error saving background');
      console.error('Failed to save background', err);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setDirection(-1);
      // Save current page content
      const newPages = [...pages];
      newPages[currentPage - 1] = content;
      setPages(newPages);
      // Go to previous page
      setCurrentPage(prev => prev - 1);
      setContent(newPages[currentPage - 2] || '');
    }
  };

  const nextPage = () => {
    setDirection(1);
    // Save current page content
    const newPages = [...pages];
    newPages[currentPage - 1] = content;
    setPages(newPages);
    
    if (currentPage < totalPages) {
      // Go to existing next page
      setCurrentPage(prev => prev + 1);
      setContent(newPages[currentPage] || '');
    } else {
      // Create new page
      const updatedPages = [...newPages, ''];
      setPages(updatedPages);
      setTotalPages(prev => prev + 1);
      setCurrentPage(prev => prev + 1);
      setContent('');
    }
  };

  const pageVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      rotateY: direction > 0 ? 15 : -15,
      opacity: 0,
      scale: 0.9
    }),
    center: {
      x: 0,
      rotateY: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction) => ({
      x: direction > 0 ? -300 : 300,
      rotateY: direction > 0 ? -15 : 15,
      opacity: 0,
      scale: 0.9
    })
  };

  const saveToDatabase = useCallback(async (pagesToSave, contentToSave) => {
    setStatus('Saving...');
    try {
      await axios.post(`${API_BASE_URL}/api/diary/today`, { 
        content: contentToSave,
        pages: pagesToSave,
        background: selectedBg
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStatus('Saved');
    } catch (err) {
      setStatus('Error saving');
      console.error('Save error:', err);
    }
  }, [selectedBg]);

  // Use ref to always access latest save function
  const saveRef = useRef(saveToDatabase);
  useEffect(() => {
    saveRef.current = saveToDatabase;
  }, [saveToDatabase]);

  const autoSave = useCallback(
    debounce(async (newContent, pageIdx) => {
      const currentPages = [...pagesRef.current];
      currentPages[pageIdx] = newContent;
      await saveRef.current(currentPages, newContent);
    }, 1000),
    []
  );

  const handleChange = (e) => {
    setStatus('Typing...');
    setContent(e.target.value);
    autoSave(e.target.value, currentPage - 1);
  };

  const isFirstPage = currentPage === 1;

  return (
    <div className="fixed inset-0 w-full h-full">
      {/* Background image layer - uses selected background */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url('${selectedBg}')`,
          backgroundAttachment: 'fixed'
        }}
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 w-full h-full bg-black/40" />
      
      {/* Background Selection Modal */}
      <AnimatePresence>
        {showBgModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative w-full max-w-2xl bg-gradient-to-b from-[#3d2418] to-[#2c1810] rounded-2xl shadow-2xl border-2 border-[#5c3a21] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#5c3a21]">
                <h3 
                  className="text-2xl sm:text-3xl font-bold text-[#e6d2b5]"
                  style={{ fontFamily: "'Caveat', cursive" }}
                >
                  Choose Your Diary Background
                </h3>
                {hasSelectedBg && (
                  <motion.button
                    onClick={() => setShowBgModal(false)}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-[#e6d2b5] hover:text-white transition-colors"
                  >
                    <X size={28} />
                  </motion.button>
                )}
              </div>

              {/* Background Options Grid */}
              <div className="p-6">
                <p 
                  className="text-white/70 text-center mb-6 text-lg"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Select a background that inspires your writing
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {BACKGROUND_OPTIONS.map((bg, index) => (
                    <motion.button
                      key={bg.id}
                      onClick={() => handleBgSelect(bg.url)}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ 
                        scale: 1.05, 
                        boxShadow: '0 10px 30px rgba(230, 210, 181, 0.3)'
                      }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative group rounded-xl overflow-hidden border-2 transition-all ${
                        selectedBg === bg.url 
                          ? 'border-[#e6d2b5] ring-2 ring-[#e6d2b5] ring-offset-2 ring-offset-[#2c1810]' 
                          : 'border-[#5c3a21] hover:border-[#e6d2b5]'
                      }`}
                    >
                      {/* Background Preview */}
                      <div 
                        className="h-32 sm:h-40 w-full bg-cover bg-center"
                        style={bg.style === 'css' ? { 
                          background: bg.gradient,
                          backgroundColor: bg.color 
                        } : { 
                          backgroundImage: `url('${bg.url}')`,
                          backgroundColor: bg.color 
                        }}
                      />
                      
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      
                      {/* Selection indicator */}
                      {selectedBg === bg.url && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 bg-[#e6d2b5] rounded-full p-1"
                        >
                          <CheckCircle size={20} className="text-[#2c1810]" />
                        </motion.div>
                      )}
                      
                      {/* Background Name */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <p 
                          className="text-white text-sm font-semibold text-center"
                          style={{ fontFamily: "'Caveat', cursive" }}
                        >
                          {bg.name}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full h-full flex flex-col pt-14"
      >
        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between p-4 sm:p-6 border-b border-white/20 bg-[#2c1810]/80 backdrop-blur-sm"
        >
          <motion.button 
            onClick={() => navigate('/dashboard')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-[#e6d2b5] rounded-full text-[#2c1810] shadow-lg hover:bg-[#f0e0c8] transition-colors"
          >
            <ArrowLeft size={24} />
          </motion.button>
          
          <div className="text-center">
            <h2 className="font-bold text-white text-2xl sm:text-3xl flex items-center gap-2 justify-center drop-shadow" style={{ fontFamily: "'Caveat', cursive" }}>
              <Feather size={22} className="text-[#e6d2b5]" />
              {pages.some(page => page && page.trim().length > 0) ? 'Continue Your Diary Today' : "Today's Diary"}
            </h2>
            <p className="text-sm text-white/70 drop-shadow">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          {/* Gallery Button - Opens Background Selection */}
          <motion.button 
            onClick={() => setShowBgModal(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-[#e6d2b5] rounded-full text-[#2c1810] shadow-lg hover:bg-[#f0e0c8] transition-colors"
            title="Change Background"
          >
            <Images size={22} />
          </motion.button>
        </motion.div>

        {/* Writing Area */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="relative w-full max-w-3xl h-full max-h-[70vh]">
            {/* Loading Spinner */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-12 h-12 border-4 border-[#e6d2b5] border-t-transparent rounded-full"
                />
              </div>
            )}
            {/* Page Content */}
            <div className={`relative w-full h-full perspective-1000 ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentPage}
                  custom={direction}
                  variants={pageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    rotateY: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  className="absolute inset-0 rounded-xl shadow-2xl border-2 border-[#c4b5a0] overflow-hidden"
                  style={{ 
                    transformStyle: "preserve-3d",
                    backfaceVisibility: "hidden",
                    backgroundColor: BACKGROUND_OPTIONS.find(bg => bg.url === selectedBg)?.color || '#f5f0e6',
                    backgroundImage: selectedBg === 'soft-cream' 
                      ? BACKGROUND_OPTIONS.find(bg => bg.url === 'soft-cream')?.gradient
                      : `url('${selectedBg}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                >
                  <textarea
                    value={content}
                    onChange={handleChange}
                    placeholder={`Pour your heart out here... it's auto-saving!`}
                    className="flex-1 w-full h-full p-5 sm:p-6 bg-white/30 resize-none focus:outline-none text-[#3d2914] leading-loose text-2xl sm:text-3xl placeholder-[#5c4033] font-bold"
                    style={{ fontFamily: "'Caveat', cursive", lineHeight: '1.6' }}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}