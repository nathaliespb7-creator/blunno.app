'use client';

import { forwardRef, HTMLAttributes, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useBlunnoStore } from '@/store/blunnoStore';

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ 
    className,
    isOpen,
    onClose,
    size = 'md',
    closeOnOverlayClick = true,
    closeOnEscape = true,
    children,
    ...props 
  }, ref) => {
    const animationPreference = useBlunnoStore(state => state.ui.animationPreference);
    
    const sizes = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      full: 'max-w-full mx-4',
    };

    useEffect(() => {
      if (!closeOnEscape) return;
      
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose, closeOnEscape]);

    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }

      return () => {
        document.body.style.overflow = 'unset';
      };
    }, [isOpen]);

    if (typeof window === 'undefined') return null;

    const modalContent = (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: animationPreference === 'none' ? 0 : 0.2 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeOnOverlayClick ? onClose : undefined}
            />
            <motion.div
              ref={ref}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ 
                duration: animationPreference === 'none' ? 0 : 0.3,
                ease: 'easeOut'
              }}
              className={cn(
                'relative w-full glass-card p-6',
                sizes[size],
                className
              )}
              {...props}
            >
              {children}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
  }
);

Modal.displayName = 'Modal';

export { Modal };
