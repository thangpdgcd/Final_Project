import React from 'react';
import { motion } from 'framer-motion';
import { Coffee, Leaf, Mountain } from 'lucide-react';

import Logo from '@/components/common/Logo';

/**
 * LoginModalRoute
 * Route-only visual backdrop for `/login`.
 * The actual login UI is rendered as `AuthModal` from the global `Header`.
 */
const LoginModalRoute: React.FC = () => (
  <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#FDF5E6]">
    {/* Left (Backdrop) */}
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="flex flex-col justify-center px-6 md:px-20 lg:px-32 bg-[#1c1716] text-white py-12 lg:py-0"
    >
      <div className="max-w-md w-full mx-auto">
        {/* Brand/Logo for mobile */}
        <div className="flex items-center gap-3 mb-10 lg:hidden">
          <Logo size={40} showText={false} className="bg-white rounded-full p-1" />
          <span className="text-xl font-black tracking-widest uppercase text-white">Phan Coffee</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
          Brewing <span className="text-[#FFD700]">Excellence.</span>
        </h1>
        <p className="text-gray-400 font-medium mb-12">
          Enter your credentials in the login modal. We only show one auth UI at a time for a clean, premium flow.
        </p>

        <div className="grid grid-cols-3 gap-6">
          {[
            { icon: Coffee, label: 'Aromatic' },
            { icon: Leaf, label: 'Organic' },
            { icon: Mountain, label: 'Heritage' },
          ].map((feature) => (
            <div key={feature.label} className="flex flex-col items-center gap-4 group">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-[#FFD700] group-hover:bg-[#FFD700] group-hover:text-[#4B3621] transition-all duration-300 shadow-xl">
                <feature.icon size={28} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 group-hover:text-white transition-colors">
                {feature.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>

    {/* Right (Banner) - High-end gradient branding */}
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      className="hidden lg:flex flex-col items-center justify-center relative overflow-hidden bg-[#4B3621]"
    >
      {/* Animated background patterns */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#FFD700] rounded-full blur-[120px]"
        />
        <div className="absolute bottom-[-15%] left-[-10%] w-[400px] h-[400px] bg-black rounded-full blur-[100px] opacity-40" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center py-12 px-16 text-center">
        <Logo size={200} showText={false} className="mb-12" />

        <h2 className="text-6xl font-black text-white mb-8 tracking-tighter leading-[0.9] uppercase text-shadow">
          Brewing <br /> <span className="text-[#FFD700]">Excellence.</span>
        </h2>
        <p className="text-amber-100/60 max-w-sm mx-auto font-bold text-lg mb-16 leading-relaxed">
          "Pure roasted coffee from Kon Tum — rich aroma, bold flavor. Experience the source."
        </p>

        <div className="grid grid-cols-3 gap-12">
          {[
            { icon: Coffee, label: 'Aromatic' },
            { icon: Leaf, label: 'Organic' },
            { icon: Mountain, label: 'Heritage' },
          ].map((feature) => (
            <div key={feature.label} className="flex flex-col items-center gap-4 group">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-[#FFD700] group-hover:bg-[#FFD700] group-hover:text-[#4B3621] transition-all duration-300 shadow-xl">
                <feature.icon size={28} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 group-hover:text-white transition-colors">
                {feature.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  </div>
);

export default LoginModalRoute;

