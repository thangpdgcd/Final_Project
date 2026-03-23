import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Coffee, Leaf, Mountain } from "lucide-react";

type Props = {
  onScrollNext?: () => void;
};

const HeroSection: React.FC<Props> = ({ onScrollNext }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = t("home.hero", { returnObjects: true }) as Array<{
    title: string;
    subtitle: string;
    image: string;
  }>;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slideVariants: any = {
    initial: { opacity: 0, scale: 1.1 },
    animate: { opacity: 1, scale: 1, transition: { duration: 1.5, ease: "easeOut" } },
    exit: { opacity: 0, transition: { duration: 1 } },
  };

  const textVariants: any = {
    hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: "easeOut" } 
    },
  };

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black flex items-center justify-center">
      {/* Background Slider */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-black/40 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20 z-10" />
          <img
            src={slides[currentSlide].image}
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-6 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="flex flex-col items-center max-w-4xl mx-auto"
          >
            <motion.span
              variants={textVariants}
              className="px-6 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-amber-400 mb-8"
            >
              {t("home.heroBadge")}
            </motion.span>
            
            <motion.h1
              variants={textVariants}
              transition={{ delay: 0.2 }}
              className="text-5xl sm:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9] uppercase"
              dangerouslySetInnerHTML={{ __html: slides[currentSlide].title }}
            />
            
            <motion.p
              variants={textVariants}
              transition={{ delay: 0.4 }}
              className="text-lg sm:text-xl text-white/70 max-w-2xl font-medium leading-relaxed mb-12"
            >
              {slides[currentSlide].subtitle}
            </motion.p>

            <motion.div
              variants={textVariants}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-6"
            >
              <button
                onClick={() => navigate("/products")}
                className="px-10 py-5 bg-[#FFD700] text-[#4B3621] font-black uppercase tracking-[0.2em] text-sm rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-[#FFD700]/20"
              >
                {t("home.heroBtnPrimary")}
              </button>
              <button
                onClick={() => navigate("/abouts")}
                className="px-10 py-5 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white border border-white/20 font-black uppercase tracking-[0.2em] text-sm rounded-2xl hover:scale-105 active:scale-95 transition-all"
              >
                {t("home.heroBtnGhost")}
              </button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Features - Mini Floating Icons */}
      <div className="absolute bottom-20 left-0 right-0 z-20 flex justify-center gap-12 sm:gap-24 px-6 opacity-0 sm:opacity-100">
        {[
          { icon: <Coffee />, label: "AROMATIC" },
          { icon: <Leaf />, label: "ORGANIC" },
          { icon: <Mountain />, label: "HERITAGE" }
        ].map((feat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 + i * 0.2 }}
            className="flex items-center gap-4 text-white/30 hover:text-white transition-colors cursor-default group"
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              {React.cloneElement(feat.icon as React.ReactElement, { size: 20 })}
            </div>
            <span className="text-[10px] font-black tracking-[0.3em] uppercase">{feat.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Slider Controls */}
      <div className="absolute right-10 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-4">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`w-1.5 h-12 rounded-full transition-all duration-500 ${
              currentSlide === i ? "bg-[#FFD700] h-20" : "bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <motion.button
        type="button"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3"
        onClick={onScrollNext}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/20 p-2 flex justify-center">
          <motion.div 
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-1 bg-white rounded-full"
          />
        </div>
      </motion.button>
    </section>
  );
};

export default HeroSection;
