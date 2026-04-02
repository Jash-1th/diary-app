import { BrowserRouter, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useState, createContext, useContext } from 'react';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import WriteDiary from './pages/WriteDiary';
import ViewDiary from './pages/ViewDiary';

// Create context for flash messages
export const FlashContext = createContext(null);

// Custom hook to use flash messages
export const useFlash = () => {
  const context = useContext(FlashContext);
  if (!context) {
    throw new Error('useFlash must be used within FlashProvider');
  }
  return context;
};

// Flash Provider component
function FlashProvider({ children }) {
  const [toast, setToast] = useState({ message: '', type: 'success', isVisible: false });

  const showFlash = (message, type = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  const hideFlash = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  return (
    <FlashContext.Provider value={{ showFlash, hideFlash }}>
      {children}
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={hideFlash} 
      />
    </FlashContext.Provider>
  );
}

// A simple protective wrapper to ensure users have a JWT
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const { showFlash } = useFlash();
  const navigate = useNavigate();
  
  if (!token) {
    // Show error flash and redirect
    setTimeout(() => {
      showFlash('Please log in to access this page', 'error');
    }, 100);
    return <Navigate to="/" />;
  }
  return children;
};

// This component isolates the routes so useLocation can detect changes
function AnimatedRoutes() {
  const location = useLocation();

  return (
    // mode="wait" ensures the old page fully exits before the new one enters
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/history" element={
          <ProtectedRoute>
            <ViewDiary />
          </ProtectedRoute>
        } />
        <Route path="/" element={<Auth />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/write" element={
          <ProtectedRoute>
            <WriteDiary />
          </ProtectedRoute>
        } />
        
        {/* We'll add the /history route later */}
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <FlashProvider>
        {/* Background stays constant, only pages inside AnimatedRoutes animate */}
        <div className="bg-love-light min-h-screen overflow-hidden">
          <Navbar />
          <div className="pt-14">
            <AnimatedRoutes />
          </div>
        </div>
      </FlashProvider>
    </BrowserRouter>
  );
}