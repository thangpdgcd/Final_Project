import type { Transition, Variants } from 'framer-motion';

export const easeOutQuint = [0.22, 1, 0.36, 1] as const;

export const pageTransition: Transition = {
  duration: 0.45,
  ease: easeOutQuint,
};

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: pageTransition },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: easeOutQuint } },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: easeOutQuint } },
};

export const staggerContainer = (stagger = 0.08): Variants => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: stagger,
      delayChildren: 0.03,
    },
  },
});

export const scaleHover = {
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.98 },
};

