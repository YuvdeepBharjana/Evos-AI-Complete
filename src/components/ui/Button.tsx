import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  disabled?: boolean;
  className?: string;
}

export const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  disabled = false,
  className = ''
}: ButtonProps) => {
  const baseStyles = 'rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 hover:from-purple-600 hover:via-blue-600 hover:to-teal-600 text-white shadow-lg shadow-purple-500/30',
    secondary: 'glass glass-hover text-gray-100',
    ghost: 'hover:bg-white/5 text-gray-300 hover:text-white'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />}
      {children}
    </motion.button>
  );
};

