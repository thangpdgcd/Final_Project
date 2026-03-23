import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import "./index.scss";

type Props = {
  onScrollNext?: () => void;
};

const HeroSection: React.FC<Props> = ({ onScrollNext }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  } as any;

  return (
    <section className='hero'>
      <div className='hero__bg' aria-hidden='true'>
        <div className='hero__overlay' />
        <img
          className='hero__bg-image'
          src='https://lh3.googleusercontent.com/aida-public/AB6AXuBhJYQ5RfhX69hHm3r4dgF_EUyAX6-caHqVsfHEUPDuQ24LSeARgR5pSL_tiEmQx-JLf-gIDWDxDE8nOIQ2Wctq0YtjVyUaoWw59NAbLenNZuXpZHACzgbxZTTsA1gI11H7Pesj4nYu9a5_tg9RUgTsigZg7Uof0RZF56-cNGZ9RsXVIpb6kpuyvRi4UsBpYzX8wGyrmmbNZwiXhsHMkAtaBlOKzYOVJkZMNiIoHjaeYsH-1VFQN0YL7cOaVb5NyTO8pvmZPgqrvZD0'
          alt=''
          loading='eager'
        />
      </div>

      <div className='hero__container'>
        <motion.div 
          className='hero__content'
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.span variants={itemVariants} className='hero__badge'>
            {t("home.heroBadge")}
          </motion.span>
          <motion.h1 
            variants={itemVariants} 
            className='hero__title'
            dangerouslySetInnerHTML={{ __html: t("home.heroTitle") }}
          />
          <motion.p variants={itemVariants} className='hero__subtitle'>
            {t("home.heroSubtitle")}
          </motion.p>
          <motion.div variants={itemVariants} className='hero__actions'>
            <motion.button 
              className='hero__btn hero__btn--primary' 
              onClick={() => navigate("/products")}
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(160, 100, 90, 0.4)" }}
              whileTap={{ scale: 0.98 }}
            >
              {t("home.heroBtnPrimary")}
            </motion.button>
            <motion.button 
              className='hero__btn hero__btn--ghost' 
              onClick={() => navigate("/abouts")}
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
              whileTap={{ scale: 0.98 }}
            >
              {t("home.heroBtnGhost")}
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      <motion.button 
        type='button' 
        className='hero__scroll' 
        aria-label='Cuộn xuống nội dung' 
        onClick={onScrollNext}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <span className='hero__scroll-dot' aria-hidden='true' />
      </motion.button>
    </section>
  );
};

export default HeroSection;

