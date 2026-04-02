import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookHeart, Calendar, ChevronLeft, ChevronRight, Edit2, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';

// Background options (same as WriteDiary)
const BACKGROUND_OPTIONS = [
  { id: 1, name: 'Soft Cream', url: 'soft-cream', color: '#f5f0e6', style: 'css', gradient: 'linear-gradient(135deg, #f5f0e6 0%, #ebe5d8 50%, #e8dfd0 100%)' },
  { id: 2, name: 'Rose Book', url: '/bg-rose-book.jpg', color: '#4a3a2a', style: 'image' },
  { id: 3, name: 'Hearts', url: '/bg-red-heart.jpg', color: '#2c1810', style: 'image' },
  { id: 4, name: 'Stone Heart', url: '/bg-rock.jpg', color: '#4a6fa5', style: 'image' },
  { id: 5, name: 'Moonlit Shore', url: 'https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=1920&q=80', color: '#1a1a2e', style: 'image' },
  { id: 6, name: 'Raindrops', url: '/bg-raindrops.jpg', color: '#3a4a5a', style: 'image' },
];

export default function ViewDiary() {
  const [diaries, setDiaries] = useState([]);
  const [currentDiary, setCurrentDiary] = useState(null);
  const [direction, setDirection] = useState(0);
  const [showCalendar, setShowCalendar] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/diary/history`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setDiaries(data);
      } catch (err) {
        console.error("Failed to fetch history", err);
      }
    };
    fetchHistory();
  }, []);

  const hasDiaryEntry = (date) => {
    const dateStr = date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
    return diaries.some(d => new Date(d.date).toLocaleDateString('en-CA') === dateStr);
  };

  const getDiaryForDate = (date) => {
    const dateStr = date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
    return diaries.find(d => new Date(d.date).toLocaleDateString('en-CA') === dateStr);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    const diary = getDiaryForDate(date);
    if (diary) {
      setCurrentDiary(diary);
      setIsEditing(false);
      setShowCalendar(false);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(today);
    const diary = getDiaryForDate(today);
    if (diary) {
      setCurrentDiary(diary);
      setShowCalendar(false);
    }
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const prevPage = () => {
    const currentIndex = diaries.findIndex(d => d._id === currentDiary?._id);
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentDiary(diaries[currentIndex - 1]);
      setIsEditing(false);
    }
  };

  const nextPage = () => {
    const currentIndex = diaries.findIndex(d => d._id === currentDiary?._id);
    if (currentIndex < diaries.length - 1) {
      setDirection(1);
      setCurrentDiary(diaries[currentIndex + 1]);
      setIsEditing(false);
    }
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const startEditing = () => {
    if (currentDiary && isToday(new Date(currentDiary.date))) {
      setEditContent(currentDiary.content || '');
      setIsEditing(true);
      setSaveStatus('');
    }
  };

  const saveEdit = async () => {
    if (!currentDiary || !isToday(new Date(currentDiary.date))) return;
    setSaveStatus('Saving...');
    try {
      await axios.post(`${API_BASE_URL}/api/diary/today`, { content: editContent }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCurrentDiary({ ...currentDiary, content: editContent });
      setDiaries(diaries.map(d => d._id === currentDiary._id ? { ...d, content: editContent } : d));
      setIsEditing(false);
      setSaveStatus('Saved!');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (err) {
      setSaveStatus('Error saving');
      console.error("Failed to save", err);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditContent('');
    setSaveStatus('');
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const pageVariants = {
    enter: (direction) => ({ x: direction > 0 ? 100 : -100, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction > 0 ? -100 : 100, opacity: 0 })
  };

  return (
    <div className="fixed inset-0 w-full h-full">
      {/* Background image layer */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1532978379173-523e16f371f2?w=1920&q=80')`,
          backgroundAttachment: 'fixed'
        }}
      />
      {/* Lighter overlay for daytime feel */}
      <div className="absolute inset-0 w-full h-full bg-black/20" />
      
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
          
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2 drop-shadow" style={{ fontFamily: "'Caveat', cursive" }}>
            <BookHeart size={28} className="text-[#e6d2b5]" />
            Your Memories
          </h1>

          {/* Calendar Button */}
          <motion.button 
            onClick={() => setShowCalendar(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-[#e6d2b5] rounded-full text-[#2c1810] shadow-lg hover:bg-[#f0e0c8] transition-colors"
            title="Select Date"
          >
            <Calendar size={22} />
          </motion.button>
        </motion.div>

        {/* Calendar Modal - Premium UI */}
        <AnimatePresence>
          {showCalendar && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 30 }}
                className="relative w-full max-w-md bg-gradient-to-b from-[#3d2418] to-[#2c1810] rounded-2xl shadow-2xl border-2 border-[#5c3a21] overflow-hidden"
              >
                {/* Calendar Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#5c3a21]">
                  <h3 
                    className="text-2xl font-bold text-[#e6d2b5]"
                    style={{ fontFamily: "'Caveat', cursive" }}
                  >
                    Select a Date
                  </h3>
                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={goToToday}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-1 bg-[#e6d2b5] text-[#2c1810] rounded-lg text-sm font-bold"
                      style={{ fontFamily: "'Caveat', cursive" }}
                    >
                      Today
                    </motion.button>
                    <motion.button
                      onClick={() => navigate('/dashboard')}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-[#e6d2b5] hover:text-white transition-colors"
                    >
                      <X size={24} />
                    </motion.button>
                  </div>
                </div>

                {/* Month Navigation */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#2c1810]/50">
                  <motion.button
                    onClick={prevMonth}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-[#e6d2b5] hover:text-white transition-colors"
                  >
                    <ChevronLeft size={24} />
                  </motion.button>
                  <h4 
                    className="text-xl font-bold text-white"
                    style={{ fontFamily: "'Caveat', cursive" }}
                  >
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h4>
                  <motion.button
                    onClick={nextMonth}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-[#e6d2b5] hover:text-white transition-colors"
                  >
                    <ChevronRight size={24} />
                  </motion.button>
                </div>

                {/* Week Days Header */}
                <div className="grid grid-cols-7 gap-1 px-4 py-2">
                  {weekDays.map(day => (
                    <div 
                      key={day} 
                      className="text-center text-[#e6d2b5]/70 text-sm font-bold py-1"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 p-4">
                  {generateCalendarDays().map((date, index) => (
                    <motion.button
                      key={index}
                      onClick={() => date && handleDateSelect(date)}
                      whileHover={date ? { scale: 1.1 } : {}}
                      whileTap={date ? { scale: 0.95 } : {}}
                      disabled={!date || !hasDiaryEntry(date)}
                      className={`
                        aspect-square rounded-lg flex items-center justify-center text-sm font-bold relative
                        ${!date ? 'invisible' : ''}
                        ${date && hasDiaryEntry(date) 
                          ? 'bg-[#e6d2b5] text-[#2c1810] hover:bg-[#f0e0c8] shadow-lg cursor-pointer' 
                          : 'bg-[#5c3a21]/30 text-white/30 cursor-not-allowed'
                        }
                        ${date && selectedDate && date.toDateString() === selectedDate.toDateString() 
                          ? 'ring-2 ring-white' 
                          : ''
                        }
                      `}
                      style={{ fontFamily: "'Caveat', cursive", fontSize: '1.1rem' }}
                    >
                      {date?.getDate()}
                      {date && hasDiaryEntry(date) && (
                        <div className="absolute bottom-1 w-1.5 h-1.5 bg-[#2c1810] rounded-full" />
                      )}
                    </motion.button>
                  ))}
                </div>

                {/* Legend */}
                <div className="px-4 py-3 border-t border-[#5c3a21] bg-[#2c1810]/30">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#e6d2b5] rounded" />
                      <span className="text-[#e6d2b5]" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Has Entry
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#5c3a21]/30 rounded" />
                      <span className="text-white/50" style={{ fontFamily: "'Playfair Display', serif" }}>
                        No Entry
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Diary Viewer */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="relative w-full max-w-3xl h-full max-h-[70vh]">
            {/* Page Content - Simple like WriteDiary */}
            <div className="relative w-full h-full">
              {currentDiary ? (
                <div
                  className="absolute inset-0 rounded-xl shadow-2xl border-2 border-[#c4b5a0] overflow-hidden"
                  style={{ 
                    backgroundColor: BACKGROUND_OPTIONS.find(bg => bg.url === (currentDiary?.background || 'soft-cream'))?.color || '#f5f0e6',
                    backgroundImage: (currentDiary?.background && currentDiary.background !== 'soft-cream')
                      ? `url('${currentDiary.background}')`
                      : BACKGROUND_OPTIONS.find(bg => bg.url === 'soft-cream')?.gradient,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                >
                  {/* White overlay for text readability */}
                  <div className="absolute inset-0 bg-white/40" />
                  
                  {/* Header with Edit Button */}
                  <div className="relative z-10 flex items-center justify-between p-4 border-b border-[#c4b5a0]/50 bg-white/30 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <Calendar size={20} className="text-[#8b4513]" />
                      <h3 className="font-bold text-[#2c1810] text-lg sm:text-xl" style={{ fontFamily: "'Caveat', cursive" }}>
                        {new Date(currentDiary.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </h3>
                    </div>
                    
                    {/* Edit Button - Only for today */}
                    {isToday(new Date(currentDiary.date)) && !isEditing && (
                      <motion.button
                        onClick={startEditing}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-[#2c1810] text-[#e6d2b5] rounded-lg shadow-md hover:bg-[#3d2418] transition-colors flex items-center gap-1"
                      >
                        <Edit2 size={16} />
                        <span className="text-sm font-bold" style={{ fontFamily: "'Caveat', cursive" }}>Edit</span>
                      </motion.button>
                    )}
                    
                    {/* Save/Cancel Buttons */}
                    {isEditing && (
                      <div className="flex items-center gap-2">
                        {saveStatus && (
                          <span className="text-[#2c1810] text-sm" style={{ fontFamily: "'Caveat', cursive" }}>{saveStatus}</span>
                        )}
                        <motion.button onClick={cancelEdit} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="p-2 bg-[#5c3a21] text-white rounded-lg shadow-md">
                          <X size={16} />
                        </motion.button>
                        <motion.button onClick={saveEdit} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="p-2 bg-[#2c1810] text-[#e6d2b5] rounded-lg shadow-md flex items-center gap-1">
                          <Save size={16} />
                          <span className="text-sm font-bold" style={{ fontFamily: "'Caveat', cursive" }}>Save</span>
                        </motion.button>
                      </div>
                    )}
                  </div>

                  {/* Content - View or Edit */}
                  <div className="relative z-10 p-5 sm:p-6 overflow-y-auto h-full pb-16">
                    {isEditing ? (
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full h-full p-0 bg-transparent border-0 text-[#3d2914] leading-loose text-2xl sm:text-3xl resize-none focus:outline-none font-bold"
                        style={{ fontFamily: "'Caveat', cursive", lineHeight: '1.6' }}
                        placeholder="Write your diary entry here..."
                      />
                    ) : (
                      <p className="text-[#3d2914] whitespace-pre-wrap leading-loose text-2xl sm:text-3xl font-bold break-words text-left" style={{ fontFamily: "'Caveat', cursive", lineHeight: '1.6' }}>
                        {currentDiary.content || "Empty page..."}
                      </p>
                    )}
                  </div>

                  {/* Entry Counter */}
                  <div className="relative z-10 absolute bottom-4 left-0 right-0 text-center">
                    <p className="text-[#8b4513]/60 text-sm drop-shadow" style={{ fontFamily: "'Caveat', cursive" }}>
                      Entry {diaries.indexOf(currentDiary) + 1} of {diaries.length}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white/70 text-xl drop-shadow" style={{ fontFamily: "'Caveat', cursive" }}>
                    No diary entries yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}