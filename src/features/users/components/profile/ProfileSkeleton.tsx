import React from 'react';
import { motion } from 'framer-motion';

const shimmer = {
  initial: { backgroundPosition: '-400px 0' },
  animate: { backgroundPosition: '400px 0' },
};

const shimmerTransition = {
  duration: 1.4,
  ease: 'linear' as const,
  repeat: Infinity,
};

const ShimmerBlock: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
  className = '',
  style,
}) => (
  <motion.div
    variants={shimmer}
    initial="initial"
    animate="animate"
    transition={shimmerTransition}
    className={`rounded-xl ${className}`}
    style={{
      backgroundImage:
        'linear-gradient(90deg, #1c1b1b 0px, #2a2a2a 40%, #1c1b1b 80%)',
      backgroundSize: '800px 100%',
      ...style,
    }}
  />
);

const ProfileSkeleton: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ background: '#1c1b1b' }}
      className="rounded-2xl p-6 sm:p-8"
    >
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-center lg:items-start">
        {/* Avatar placeholder — squircle */}
        <ShimmerBlock
          className="flex-shrink-0"
          style={{
            width: 112,
            height: 112,
            borderRadius: 28,
            border: '2px solid #2a2a2a',
          }}
        />

        {/* Info placeholder */}
        <div className="flex flex-col gap-4 w-full">
          {/* Badge */}
          <ShimmerBlock style={{ width: 80, height: 18, borderRadius: 999, alignSelf: 'center' }}
            className="lg:self-start"
          />

          {/* Name */}
          <ShimmerBlock style={{ width: '55%', height: 32, alignSelf: 'center' }}
            className="lg:self-start"
          />

          {/* Email */}
          <ShimmerBlock style={{ width: '38%', height: 16, alignSelf: 'center' }}
            className="lg:self-start"
          />

          {/* Stats row */}
          <div className="flex items-center justify-center lg:justify-start gap-6 pt-1">
            {[72, 56, 56].map((w, i) => (
              <ShimmerBlock key={i} style={{ width: w, height: 36, borderRadius: 10 }} />
            ))}
          </div>

          {/* Action button placeholders */}
          <div className="flex items-center justify-center lg:justify-start gap-3 pt-1">
            <ShimmerBlock style={{ width: 110, height: 36 }} />
            <ShimmerBlock style={{ width: 100, height: 36 }} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileSkeleton;
