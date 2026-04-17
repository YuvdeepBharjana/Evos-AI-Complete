import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  hover?: boolean;
}

export const Card = ({ children, onClick, className = '', hover = false }: CardProps) => {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -5 } : {}}
      onClick={onClick}
      className={`glass rounded-2xl p-6 ${hover ? 'glass-hover cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
};


