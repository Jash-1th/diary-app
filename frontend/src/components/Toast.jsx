import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', isVisible, onClose }) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: '-50%' }}
          animate={{ opacity: 1, y: 20, x: '-50%' }}
          exit={{ opacity: 0, y: -50, x: '-50%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={`fixed top-0 left-1/2 z-[100] px-4 sm:px-6 py-3 rounded-lg shadow-2xl border-2 flex items-center gap-3 max-w-[90vw] sm:max-w-md w-auto text-center sm:text-left ${
            type === 'success' 
              ? 'bg-[#2c1810] border-[#e6d2b5] text-[#e6d2b5]' 
              : 'bg-red-900/90 border-red-400 text-white'
          }`}
          style={{ fontFamily: "'Caveat', cursive", fontSize: '1.1rem' }}
        >
          {type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-[#e6d2b5]" />
          ) : (
            <XCircle className="h-5 w-5 text-red-300" />
          )}
          <span>{message}</span>
          <button 
            onClick={onClose}
            className="ml-2 hover:scale-110 transition-transform"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
