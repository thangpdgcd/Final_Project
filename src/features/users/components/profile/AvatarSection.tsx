import React from 'react';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import { AVATAR_DISPLAY_IMG_CLASS } from '@/utils/image';

interface AvatarSectionProps {
  src: string;
  onClick: () => void;
  size?: 'sm' | 'lg';
}

// Outer wrapper: handles click + scale-on-hover + variant propagation to overlay
const outerVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.07, transition: { duration: 0.3, ease: 'easeInOut' as const } },
};

// Overlay responds to parent "hover" variant — no independent whileHover needed
const overlayVariants = {
  rest: { opacity: 0 },
  hover: { opacity: 1, transition: { duration: 0.28, ease: 'easeOut' as const } },
};

// Float lives on a SEPARATE inner div so it doesn't conflict with scale hover
const floatVariants = {
  animate: {
    y: [0, -6, 0],
    transition: {
      duration: 3,
      ease: 'easeInOut' as const,
      repeat: Infinity,
      repeatType: 'loop' as const,
    },
  },
};

const AvatarSection: React.FC<AvatarSectionProps> = ({ src, onClick, size = 'lg' }) => {
  const isLarge = size === 'lg';
  const dimensions = isLarge ? 'w-28 h-28 sm:w-32 sm:h-32' : 'w-20 h-20';
  const radius = isLarge ? 'rounded-[28px]' : 'rounded-[22px]';

  return (
    // Outer: click + scale + propagates "hover" state to children
    <motion.div
      className="relative flex-shrink-0 cursor-pointer"
      variants={outerVariants}
      initial="rest"
      whileHover="hover"
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
    >
      {/* Inner: float animation — isolated so it doesn't block hover scale */}
      <motion.div variants={floatVariants} animate="animate">
        <div
          className={`${dimensions} ${radius} border-2 ring-4 ring-[#131313] overflow-hidden`}
          style={{ borderColor: '#e5c18b' }}
        >
          <img
            src={src}
            alt="avatar"
            className={AVATAR_DISPLAY_IMG_CLASS}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                `https://ui-avatars.com/api/?name=User&background=1c1b1b&color=e5c18b&size=128`;
            }}
          />
        </div>
      </motion.div>

      {/* Overlay: uses variants so it animates when PARENT enters "hover" state */}
      <motion.div
        variants={overlayVariants}
        className={`absolute inset-0 ${radius} flex flex-col items-center justify-center gap-1 pointer-events-none`}
        style={{
          background: 'linear-gradient(180deg, rgba(14,14,14,0.4) 0%, rgba(14,14,14,0.82) 100%)',
          color: '#f6d6a2',
          top: 0,
          backdropFilter: 'blur(1px)',
        }}
      >
        <Camera size={isLarge ? 22 : 16} />
        {isLarge && (
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              fontFamily: "'Manrope', sans-serif",
              background: 'rgba(0,0,0,0.35)',
              border: '1px solid rgba(229,193,139,0.55)',
              borderRadius: '999px',
              padding: '0.15rem 0.5rem',
              textShadow: '0 1px 6px rgba(0,0,0,0.6)',
            }}
          >
            THAY ĐỔI
          </span>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AvatarSection;
