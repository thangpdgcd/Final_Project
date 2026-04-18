import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

type Props = {
  onScrollNext?: () => void;
};

const HeroSection: React.FC<Props> = ({ onScrollNext }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageFits, setImageFits] = useState<Record<number, "cover" | "contain">>({});

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

  const handleImageLoad = (index: number) => (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const { naturalWidth, naturalHeight } = img;
    if (!naturalWidth || !naturalHeight) return;

    // If the image is close to square/portrait, `cover` crops too aggressively on wide hero.
    // Use `contain` to keep the whole subject visible.
    const ratio = naturalWidth / naturalHeight;
    const fit: "cover" | "contain" = ratio < 1.35 ? "contain" : "cover";

    setImageFits((prev) => (prev[index] === fit ? prev : { ...prev, [index]: fit }));
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
            onLoad={handleImageLoad(currentSlide)}
            className={[
              "w-full h-full",
              imageFits[currentSlide] === "contain" ? "object-contain bg-black" : "object-cover",
            ].join(" ")}
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
              className="
px-10 py-5
bg-gradient-to-r from-[#FFD700] via-[#f5c542] to-[#4B3621]
bg-[length:200%_auto]

text-[#4B3621]
font-black uppercase
tracking-[0.2em] text-sm

rounded-2xl
cursor-pointer

transition-all duration-500 ease-in-out

shadow-lg shadow-[#FFD700]/30

hover:bg-right
hover:text-white
hover:scale-105
hover:shadow-[0_15px_40px_rgba(255,215,0,0.5)]
hover:brightness-110

active:scale-95
"
              >
                {t("home.heroBtnPrimary")}
              </button>
              <button
                onClick={() => navigate("/about")}
                className="px-10 cursor-pointer py-5 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white border border-white/20 font-black uppercase tracking-[0.2em] text-sm rounded-2xl hover:scale-105 active:scale-95 transition-all"
              >
                {t("home.heroBtnGhost")}
              </button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
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
       
      </motion.button>
    </section>
  );
};

export default HeroSection;
