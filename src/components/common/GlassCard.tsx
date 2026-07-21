import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  role?: string;
  'aria-label'?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  interactive = false,
  role,
  'aria-label': ariaLabel,
  ...props
}) => {
  return (
    <motion.div
      whileHover={interactive ? { y: -2, scale: 1.005 } : undefined}
      whileTap={interactive ? { scale: 0.97 } : undefined}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      role={role || (interactive ? 'button' : undefined)}
      aria-label={ariaLabel}
      tabIndex={interactive ? 0 : undefined}
      className={cn(
        interactive ? 'glass-card-interactive cursor-pointer select-none' : 'glass-card',
        'rounded-[28px] p-5 relative overflow-hidden transition-all duration-300',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};
