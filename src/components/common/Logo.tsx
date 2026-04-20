import React from 'react';
import { motion } from 'framer-motion';
import { getImageSrc } from '@/utils/image';

interface LogoProps {
  size?: number | string;
  className?: string;
  showText?: boolean;
  goldBorder?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 48, className = '', showText = true }) => {
  // `public/` assets must be referenced by URL (not imported as modules).
  // Use BASE_URL so the component works even if the app is hosted under a subpath.
  const baseUrl = import.meta.env.BASE_URL ?? '/';
  const logoUrl =
    'https://res.cloudinary.com/dfjecxrnl/image/upload/v1773308731/199bea82-b758-411d-863a-1b7be6ecc8b4.png';
  /** Local asset in `public/` — used if Cloudinary fails to load */
  const fallbackUrl = `${baseUrl}assets/img/logo_headermg.png`;

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
          src={getImageSrc(logoUrl)}
          alt="Phan Coffee"
          loading="eager"
          decoding="async"
          className="w-full h-full object-contain rounded-full"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = fallbackUrl;
          }}
        />
      </div>

      {/* Branded Label */}
      {showText && (
        <span className="relative z-10 whitespace-nowrap font-black text-[14px] text-[#4B3621] group-hover:text-[#FFD700] transition-colors">
          Phan Coffee
        </span>
      )}
    </motion.div>
  );
};

export default Logo;
