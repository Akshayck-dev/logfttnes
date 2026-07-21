import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  interactive = false,
  ...props
}) => {
  return (
    <motion.div
      whileTap={interactive ? { scale: 0.98 } : undefined}
      className={cn(
        interactive ? 'glass-card-interactive cursor-pointer' : 'glass-card',
        'rounded-3xl p-5 relative overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};
