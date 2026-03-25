import React from 'react';
import { motion } from 'framer-motion';
import logoImage from '../../../public/assets/img/logo_PhanCoffee.jpg';

interface LogoProps {
  size?: number | string;
  className?: string;
  showText?: boolean;
  goldBorder?: boolean;
}

const Logo: React.FC<LogoProps> = ({
  size = 48,
  className = '',
  showText = true,
}) => {
  const logoUrl = logoImage;

  // Determine container dimensions based on size prop
  const sizeClass = typeof size === 'number' ? '' : size;
  const inlineStyle = typeof size === 'number' ? { width: size, height: size } : {};

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative flex items-center gap-3 cursor-pointer group ${className}`}
    >
      {/* Decorative Glow */}
      <div className="absolute inset-0 bg-amber-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />

      {/* Logo Wrapper */}
      <div
        style={inlineStyle}
        className={`relative z-10 rounded-full overflow-hidden border-2 border-[#4B3621] shadow-md group-hover:shadow-lg transition-all duration-300 bg-white p-1 flex items-center justify-center ${sizeClass}`}
      >
        <img
          src={logoUrl}
          alt="Phan Coffee"
          className="w-full h-full object-cover rounded-full"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/logo-fallback.png';
          }}
        />
      </div>

      {/* Branded Label */}

    </motion.div>
  );
};

export default Logo;
