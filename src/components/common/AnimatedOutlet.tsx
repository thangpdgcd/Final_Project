import React from 'react';
import { motion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import { pageVariants } from '@/utils/motions/motion';

type Props = {
  className?: string;
};

const AnimatedOutlet: React.FC<Props> = ({ className = '' }) => {
  const location = useLocation();
  return (
    <motion.div
      key={location.pathname}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      <Outlet />
    </motion.div>
  );
};

export default AnimatedOutlet;
