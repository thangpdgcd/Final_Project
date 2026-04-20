import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export interface MenuCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  active?: boolean;
  index?: number;
}

// ── Variant maps — child variants propagate from parent "initial" / "hover" ──

const cardVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  rest: {
    scale: 1,
    y: 0,
    boxShadow: '0 0 0 0 rgba(229,193,139,0)',
  },
  hover: {
    scale: 1.02,
    y: -4,
    boxShadow: '0 12px 40px -12px rgba(229,193,139,0.28)',
  },
  tap: {
    scale: 0.97,
    y: 0,
  },
};

const iconVariants = {
  rest: { scale: 1, rotate: 0 },
  hover: { scale: 1.15, rotate: 8 },
};

const arrowVariants = {
  rest: { x: 0, opacity: 0.35 },
  hover: { x: 5, opacity: 1 },
};

const MenuCard: React.FC<MenuCardProps> = ({
  icon,
  title,
  description,
  onClick,
  active = false,
  index = 0,
}) => {
  return (
    <motion.button
      // ── Mount: staggered fade-up ──────────────────────────────────────────
      initial="initial"
      animate="animate"
      transition={{
        opacity: { duration: 0.4, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] },
        y: { duration: 0.4, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] },
      }}
      // ── Hover / tap: use whileHover/whileTap so child variants fire ───────
      whileHover="hover"
      whileTap="tap"
      variants={cardVariants}
      onClick={onClick}
      style={{
        // base styles that transition via CSS (border, background)
        background: active ? '#252320' : '#1c1b1b',
        border: `1px solid ${active ? 'rgba(229,193,139,0.85)' : 'rgba(229,226,225,0.08)'}`,
        borderRadius: '1rem',
        padding: 0,
        textAlign: 'left',
        width: '100%',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        // CSS transitions for border / background (complements Framer Motion)
        transition: 'border-color 300ms ease-out, background 300ms ease-out',
        // Framer Motion controls transform + shadow, so no transition on those
      }}
    >
      {/* Inner padding wrapper — lets Framer scale without clipping */}
      <div className="flex items-center gap-4 p-4 sm:p-5">
        {/* Icon chip */}
        <motion.div
          variants={iconVariants}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          style={{
            background: active ? 'rgba(229,193,139,0.22)' : 'rgba(229,193,139,0.12)',
            color: '#e5c18b',
            borderRadius: '0.75rem',
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 300ms ease-out',
          }}
        >
          {icon}
        </motion.div>

        {/* Text block */}
        <div className="flex-1 min-w-0">
          <p
            style={{
              fontFamily: "'Manrope', sans-serif",
              color: active ? '#e5c18b' : '#e5e2e1',
              fontWeight: 700,
              fontSize: '0.875rem',
              lineHeight: 1.3,
              transition: 'color 300ms ease-out',
            }}
          >
            {title}
          </p>
          <p
            style={{
              color: '#d1c5b6',
              fontSize: '0.75rem',
              marginTop: '0.2rem',
              opacity: 0.7,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {description}
          </p>
        </div>

        {/* Arrow */}
        <motion.div
          variants={arrowVariants}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          style={{ color: '#e5e2e1', flexShrink: 0 }}
        >
          <ChevronRight size={16} />
        </motion.div>
      </div>

      {/* Active: subtle gold accent line on left edge */}
      {active && (
        <motion.div
          layoutId="activeBar"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          exit={{ scaleY: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: 0,
            top: '20%',
            bottom: '20%',
            width: 3,
            borderRadius: '0 4px 4px 0',
            background: 'linear-gradient(180deg, #e5c18b, #c5a370)',
          }}
        />
      )}
    </motion.button>
  );
};

export default MenuCard;
