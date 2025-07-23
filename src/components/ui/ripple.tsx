import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RippleProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  duration?: number;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

interface RippleEffect {
  id: number;
  x: number;
  y: number;
}

export const Ripple: React.FC<RippleProps> = ({
  children,
  className = '',
  color = 'rgba(255, 255, 255, 0.6)',
  duration = 600,
  disabled = false,
  onClick,
}) => {
  const [ripples, setRipples] = useState<RippleEffect[]>([]);

  const addRipple = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const newRipple = {
      id: Date.now(),
      x,
      y,
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, duration);

    // Call the onClick handler if provided
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <div
      className={`relative overflow-hidden cursor-pointer ${className}`}
      onMouseDown={addRipple}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {children}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              backgroundColor: color,
            }}
            initial={{
              width: 0,
              height: 0,
              opacity: 0.6,
            }}
            animate={{
              width: 300,
              height: 300,
              opacity: 0,
            }}
            transition={{
              duration: duration / 1000,
              ease: "easeOut",
            }}
            exit={{
              opacity: 0,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Ripple; 