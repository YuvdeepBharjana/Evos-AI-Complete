import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface MicroWinCelebrationProps {
  show: boolean;
  onComplete?: () => void;
}

interface Confetti {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  velocity: { x: number; y: number };
}

const COLORS = ['#3b82f6', '#10b981', '#a855f7', '#f59e0b', '#06b6d4', '#ef4444'];

export const MicroWinCelebration = ({ show, onComplete }: MicroWinCelebrationProps) => {
  const [confetti, setConfetti] = useState<Confetti[]>([]);

  useEffect(() => {
    if (show) {
      // Generate confetti pieces
      const pieces: Confetti[] = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: 0,
        y: 0,
        rotation: Math.random() * 360,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 6 + 4,
        velocity: {
          x: (Math.random() - 0.5) * 60,
          y: (Math.random() - 0.5) * 60 - 20, // Bias upward
        },
      }));
      
      // Defer setState to avoid synchronous update in effect
      const showTimer = setTimeout(() => {
        setConfetti(pieces);
      }, 0);

      // Clear after animation
      const clearTimer = setTimeout(() => {
        setConfetti([]);
        onComplete?.();
      }, 600);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {confetti.length > 0 && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
          {confetti.map((piece) => (
            <motion.div
              key={piece.id}
              className="absolute rounded-full"
              style={{
                width: piece.size,
                height: piece.size,
                backgroundColor: piece.color,
              }}
              initial={{
                x: 0,
                y: 0,
                opacity: 1,
                rotate: piece.rotation,
              }}
              animate={{
                x: piece.velocity.x,
                y: piece.velocity.y,
                opacity: 0,
                rotate: piece.rotation + 180,
              }}
              transition={{
                duration: 0.5,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};
