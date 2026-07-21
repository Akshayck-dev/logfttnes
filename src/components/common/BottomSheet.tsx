import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children
}) => {
  // ESC key listener for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="bottom-sheet-title"
          className="fixed inset-0 z-50 flex items-end justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Sheet Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto glass-card rounded-t-[36px] border-t border-white/20 p-6 z-10 no-scrollbar shadow-2xl space-y-5"
          >
            {/* iOS Pill Handle */}
            <div className="flex justify-center">
              <div className="w-12 h-1.5 bg-zinc-600/60 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 id="bottom-sheet-title" className="text-xl font-extrabold tracking-tight text-white">
                  {title}
                </h3>
                {subtitle && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                aria-label="Close sheet"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/20 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4 pb-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
