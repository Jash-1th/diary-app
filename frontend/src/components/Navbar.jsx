import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [location]);

  const isActive = (path) => location.pathname === path;

  const getLinkClass = (path) => {
    const baseClass = "flex items-center transition-colors py-1 px-2 rounded";
    const activeClass = "text-[#e6d2b5] bg-[#5c3a21]/50";
    const inactiveClass = "text-[#f5f5dc] hover:text-[#e6d2b5] hover:bg-[#5c3a21]/30";
    return `${baseClass} ${isActive(path) ? activeClass : inactiveClass}`;
  };

  const getMobileLinkClass = (path) => {
    const baseClass = "flex items-center gap-3 transition-colors py-2";
    const activeClass = "text-[#e6d2b5] border-l-4 border-[#e6d2b5] pl-3";
    const inactiveClass = "text-[#f5f5dc] hover:text-[#e6d2b5]";
    return `${baseClass} ${isActive(path) ? activeClass : inactiveClass}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/');
  };

  const isAuthPage = location.pathname === '/';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#2c1810]/90 backdrop-blur-sm border-b border-[#5c3a21]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to={isLoggedIn ? '/dashboard' : '/'} className="flex items-center gap-1 sm:gap-2 flex-shrink-0" style={{ fontFamily: "'Caveat', cursive", fontSize: '1.5rem' }}>
            <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 text-[#f5f5dc]" />
            <span className="font-bold text-[#f5f5dc] hidden sm:inline">My Diary</span>
          </Link>

          {/* Navigation - Desktop & Mobile */}
          <div className="flex items-center gap-3 sm:gap-6">
            {isLoggedIn ? (
              <>
                <Link to="/dashboard" className={getLinkClass('/dashboard')} style={{ fontFamily: "'Caveat', cursive", fontSize: '1rem' }}>
                  <span className="whitespace-nowrap">Home</span>
                </Link>
                <Link to="/history" className={getLinkClass('/history')} style={{ fontFamily: "'Caveat', cursive", fontSize: '1rem' }}>
                  <span className="whitespace-nowrap">Diaries</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center text-[#f5f5dc] hover:text-[#e6d2b5] transition-colors whitespace-nowrap"
                  style={{ fontFamily: "'Caveat', cursive", fontSize: '1rem' }}
                >
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/?mode=login" className={`flex items-center transition-colors whitespace-nowrap py-1 px-2 rounded ${location.search.includes('mode=login') || (!location.search.includes('mode=signup') && !location.search.includes('mode=login')) ? 'text-[#e6d2b5] bg-[#5c3a21]/50' : 'text-[#f5f5dc] hover:text-[#e6d2b5] hover:bg-[#5c3a21]/30'}`} style={{ fontFamily: "'Caveat', cursive", fontSize: '1rem' }}>
                  <span>Sign In</span>
                </Link>
                <Link to="/?mode=signup" className={`flex items-center transition-colors whitespace-nowrap py-1 px-2 rounded ${location.search.includes('mode=signup') ? 'text-[#e6d2b5] bg-[#5c3a21]/50' : 'text-[#f5f5dc] hover:text-[#e6d2b5] hover:bg-[#5c3a21]/30'}`} style={{ fontFamily: "'Caveat', cursive", fontSize: '1rem' }}>
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
