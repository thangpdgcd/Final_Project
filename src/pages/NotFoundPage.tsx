import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFoundPage: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
       style={{ background: 'linear-gradient(135deg, #fdf6e3, #f5ead0)' }}>
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-9xl mb-6">☕</div>
      <h1 className="text-8xl font-bold text-[#6f4e37] mb-4" style={{ fontFamily: 'var(--font-display)' }}>404</h1>
      <h2 className="text-2xl font-semibold text-[#4e3524] mb-3">Trang không tồn tại</h2>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        Có vẻ như trang bạn tìm kiếm đã được mang đi rang như những hạt cà phê của chúng tôi...
      </p>
      <Link
        to="/"
        className="inline-block px-8 py-3 rounded-full text-white font-semibold hover:scale-105 transition-transform"
        style={{ background: 'linear-gradient(90deg, #6f4e37, #c4963b)' }}
      >
        Về trang chủ →
      </Link>
    </motion.div>
  </div>
);

export default NotFoundPage;
