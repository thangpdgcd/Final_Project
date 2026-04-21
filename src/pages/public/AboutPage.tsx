import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDocumentTitle } from '@/hooks/userdocumentitles/useDocumentTitle';
import { Leaf, Truck } from 'lucide-react';

const cloudinaryImg = (path: string) =>
  `https://res.cloudinary.com/dfjecxrnl/image/upload/f_auto,q_auto:best/${path}`;

const IMG_HERO = cloudinaryImg('v1775892150/99e2e916-6c84-475a-b4e9-418ff62302d1.png');
const IMG_ORIGIN = cloudinaryImg('v1775892015/0275d0e9-3a86-4b5b-bf3e-bdcf1440aae2.png');
const IMG_TRAY = cloudinaryImg('v1775893934/2cba3d62-02e0-4a9c-8ce2-84ffa3f1cdba.png');
const IMG_PHIN = cloudinaryImg(
  'v1768823885/492005643_716963337517931_4130308983468400647_n_sc00pf.jpg',
);

/** Match ProductCard: article lift + image zoom (ease [0.22, 1, 0.36, 1]) */
const productCardEase = [0.22, 1, 0.36, 1] as const;

const aboutCollectionCardVariants = {
  rest: { y: 0, scale: 1 },
  hover: {
    y: -6,
    scale: 1.02,
    transition: { duration: 0.4, ease: productCardEase },
  },
};

const aboutCollectionImageVariants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.08,
    transition: { duration: 0.6, ease: productCardEase },
  },
};

const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();

  useDocumentTitle('pages.about.documentTitle');

  const scrollToOrigin = () => {
    document.getElementById('about-origin')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="about-page about-page--bg-animate bg-[color:var(--hl-surface)] text-[color:var(--hl-on-surface)]">
      <div className="relative z-[1]">
        {/* Hero — split editorial */}
        <section
          className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 pt-8 pb-16 lg:pt-12 lg:pb-24"
          aria-labelledby="about-hero-heading"
        >
          <div className="flex flex-col gap-12 lg:flex-row lg:items-stretch lg:gap-12 xl:gap-16">
            <motion.div
              className="flex-1 lg:max-w-[46%] lg:pr-2 xl:pr-4 flex flex-col justify-center"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65 }}
            >
              <p className="hl-sans text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--hl-secondary)] mb-5">
                {t('aboutPage.heroLabel')}
              </p>
              <h1
                id="about-hero-heading"
                className="text-[color:var(--hl-primary)] text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-[3.5rem] font-medium leading-[1.12] tracking-tight mb-6"
                style={{ fontFamily: 'var(--font-highland-display)' }}
              >
                {t('aboutPage.heroTitle')}
              </h1>
              <p className="hl-sans text-base sm:text-lg text-[color:color-mix(in_srgb,var(--hl-on-surface)_80%,transparent)] leading-relaxed max-w-xl mb-10">
                {t('aboutPage.heroSubtitle')}
              </p>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <button
                  type="button"
                  className="btn-highland-primary"
                  onClick={() => navigate('/products')}
                >
                  {t('aboutPage.heroCtaPrimary')}
                </button>
                <button
                  type="button"
                  className="btn-highland-ghost inline-flex items-center gap-1"
                  onClick={scrollToOrigin}
                >
                  {t('aboutPage.heroCtaGhost')}
                  <span aria-hidden className="text-[color:var(--hl-primary)]">
                    &gt;
                  </span>
                </button>
              </div>
            </motion.div>

            <motion.div
              className="flex-1 relative w-full min-h-[min(52vh,420px)] sm:min-h-[min(58vh,480px)] lg:min-h-[min(78vh,820px)]"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08 }}
            >
              <div className="absolute inset-0 rounded-md overflow-hidden about-ambient-float">
                <img
                  src={IMG_HERO}
                  alt=""
                  width={900}
                  height={1200}
                  className="absolute inset-0 h-full w-full object-cover object-center"
                  loading="eager"
                  decoding="async"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-l from-[color-mix(in_srgb,var(--hl-primary)_18%,transparent)] via-transparent to-transparent"
                  aria-hidden
                />
              </div>
              <div className="about-glass-card absolute left-4 right-4 bottom-4 sm:left-6 sm:right-auto sm:bottom-6 max-w-[min(100%,280px)] p-4 sm:p-5 z-10">
                <div className="flex gap-3">
                  <div className="shrink-0 w-10 h-10 rounded-md bg-[color-mix(in_srgb,var(--hl-primary)_10%,transparent)] flex items-center justify-center text-[color:var(--hl-primary)]">
                    <Leaf className="w-5 h-5" strokeWidth={1.75} aria-hidden />
                  </div>
                  <div>
                    <p className="hl-sans text-sm font-semibold text-[color:var(--hl-primary)] leading-snug mb-1">
                      {t('aboutPage.sustainCardTitle')}
                    </p>
                    <p className="hl-sans text-xs sm:text-[13px] text-[color:color-mix(in_srgb,var(--hl-on-surface)_65%,transparent)] leading-relaxed">
                      {t('aboutPage.sustainCardDesc')}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Origin — surface shift, image left */}
        <section
          id="about-origin"
          className="about-origin-bg-animate bg-[color:var(--hl-surface-low)] py-20 lg:py-28 px-5 sm:px-8 lg:px-12"
          aria-labelledby="about-origin-heading"
        >
          <div className="relative z-[1] max-w-[1400px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-stretch">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
                className="order-2 lg:order-1 w-full"
              >
                <div className="relative w-full min-h-[min(48vh,400px)] lg:min-h-[min(70vh,720px)] rounded-md overflow-hidden about-ambient-float">
                  <img
                    src={IMG_ORIGIN}
                    alt=""
                    width={800}
                    height={960}
                    className="absolute inset-0 h-full w-full object-cover object-center"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </motion.div>
              <motion.div
                className="order-1 lg:order-2 lg:pl-4 xl:pl-8 flex flex-col justify-center"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.05 }}
              >
                <p className="hl-sans text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--hl-secondary)] mb-4">
                  {t('aboutPage.origin.label')}
                </p>
                <h2
                  id="about-origin-heading"
                  className="text-[color:var(--hl-primary)] text-3xl sm:text-4xl font-medium leading-tight mb-6"
                  style={{ fontFamily: 'var(--font-highland-display)' }}
                >
                  {t('aboutPage.origin.title')}
                </h2>
                <div
                  className="w-12 h-0.5 bg-[color:color-mix(in_srgb,var(--hl-primary)_85%,transparent)] mb-8 rounded-full"
                  aria-hidden
                />
                <p className="hl-sans text-[color:color-mix(in_srgb,var(--hl-on-surface)_80%,transparent)] leading-relaxed mb-4 max-w-lg">
                  {t('aboutPage.origin.p1')}
                </p>
                <p className="hl-sans text-[color:color-mix(in_srgb,var(--hl-on-surface)_80%,transparent)] leading-relaxed mb-12 max-w-lg">
                  {t('aboutPage.origin.p2')}
                </p>
                <div className="grid grid-cols-2 gap-8 sm:gap-12 max-w-md">
                  <div>
                    <p
                      className="text-2xl sm:text-3xl font-medium text-[color:var(--hl-primary)] mb-1"
                      style={{ fontFamily: 'var(--font-highland-display)' }}
                    >
                      {t('aboutPage.origin.stat1Value')}
                    </p>
                    <p className="hl-sans text-[10px] sm:text-xs uppercase tracking-[0.15em] text-[color:color-mix(in_srgb,var(--hl-on-surface)_45%,transparent)] leading-snug">
                      {t('aboutPage.origin.stat1Unit')}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-2xl sm:text-3xl font-medium text-[color:var(--hl-primary)] mb-1"
                      style={{ fontFamily: 'var(--font-highland-display)' }}
                    >
                      {t('aboutPage.origin.stat2Value')}
                    </p>
                    <p className="hl-sans text-[10px] sm:text-xs uppercase tracking-[0.15em] text-[color:color-mix(in_srgb,var(--hl-on-surface)_45%,transparent)] leading-snug">
                      {t('aboutPage.origin.stat2Unit')}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Collections */}
        <section
          className="py-20 lg:py-28 px-5 sm:px-8 lg:px-12"
          aria-labelledby="about-collections-heading"
        >
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-14 lg:mb-16">
              <p className="hl-sans text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--hl-secondary)] mb-3">
                {t('aboutPage.collections.label')}
              </p>
              <h2
                id="about-collections-heading"
                className="text-[color:var(--hl-primary)] text-3xl sm:text-4xl font-medium"
                style={{ fontFamily: 'var(--font-highland-display)' }}
              >
                {t('aboutPage.collections.title')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45 }}
                className="min-h-[min(42vh,280px)] sm:min-h-[300px] md:min-h-[320px]"
              >
                <motion.button
                  type="button"
                  variants={aboutCollectionCardVariants}
                  initial="rest"
                  whileHover={reduceMotion ? undefined : 'hover'}
                  whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                  onClick={() => navigate('/products')}
                  className="group relative h-full w-full min-h-[inherit] rounded-md overflow-hidden text-left cursor-pointer border-0 p-0 shadow-sm transition-shadow duration-300 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hl-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--hl-surface)]"
                >
                  <motion.img
                    variants={aboutCollectionImageVariants}
                    initial={false}
                    src={IMG_HERO}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-center"
                    loading="lazy"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[color-mix(in_srgb,var(--hl-primary)_92%,transparent)] via-[color-mix(in_srgb,var(--hl-primary)_38%,transparent)] to-transparent transition-[opacity,background-image] duration-500 ease-out group-hover:from-[color-mix(in_srgb,var(--hl-primary)_95%,transparent)] group-hover:via-[color-mix(in_srgb,var(--hl-primary)_52%,transparent)] group-hover:to-black/10" />
                  <div className="relative z-[1] h-full min-h-[inherit] flex flex-col justify-end p-6 sm:p-8">
                    <p
                      className="text-white text-2xl sm:text-3xl font-medium mb-3 max-w-[14ch] transition-[letter-spacing] duration-300 group-hover:tracking-wide"
                      style={{ fontFamily: 'var(--font-highland-display)' }}
                    >
                      {t('aboutPage.collections.robusta.title')}
                    </p>
                    <span className="hl-sans text-sm font-semibold text-white/95 inline-flex items-center gap-1 transition-[transform,color] duration-300 group-hover:text-white group-hover:translate-x-1">
                      {t('aboutPage.collections.robusta.cta')}
                      <span
                        aria-hidden
                        className="transition-transform duration-300 group-hover:translate-x-0.5"
                      >
                        &gt;
                      </span>
                    </span>
                  </div>
                </motion.button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.05 }}
                className="min-h-[min(42vh,280px)] sm:min-h-[300px] md:min-h-[320px]"
              >
                <motion.button
                  type="button"
                  variants={aboutCollectionCardVariants}
                  initial="rest"
                  whileHover={reduceMotion ? undefined : 'hover'}
                  whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                  onClick={() => navigate('/products')}
                  className="group relative h-full w-full min-h-[inherit] rounded-md overflow-hidden text-left cursor-pointer border-0 p-0 shadow-sm transition-shadow duration-300 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hl-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--hl-surface)]"
                >
                  <motion.img
                    variants={aboutCollectionImageVariants}
                    initial={false}
                    src={IMG_PHIN}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-center"
                    loading="lazy"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1c1c19]/75 via-[#1c1c19]/20 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100 group-hover:from-[#1c1c19]/88 group-hover:via-[#1c1c19]/35" />
                  <div className="relative z-[1] h-full min-h-[inherit] flex flex-col justify-end p-6 sm:p-8">
                    <p
                      className="text-white text-xl sm:text-2xl font-medium mb-2 transition-[letter-spacing] duration-300 group-hover:tracking-wide"
                      style={{ fontFamily: 'var(--font-highland-display)' }}
                    >
                      {t('aboutPage.collections.phinCraft.title')}
                    </p>
                    <span className="hl-sans text-sm font-semibold text-white/90 inline-flex items-center gap-1 transition-[transform,color] duration-300 group-hover:text-white group-hover:translate-x-1">
                      {t('aboutPage.collections.phinCraft.cta')}
                      <span
                        aria-hidden
                        className="transition-transform duration-300 group-hover:translate-x-0.5"
                      >
                        &gt;
                      </span>
                    </span>
                  </div>
                </motion.button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.1 }}
                className="min-h-[min(42vh,280px)] sm:min-h-[300px] md:min-h-[320px]"
              >
                <motion.div
                  variants={aboutCollectionCardVariants}
                  initial="rest"
                  whileHover={reduceMotion ? undefined : 'hover'}
                  whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                  className="group h-full min-h-[inherit] rounded-md bg-[color:var(--hl-surface-low)] p-8 sm:p-10 flex flex-col justify-center items-start shadow-sm transition-[background-color,box-shadow] duration-300 hover:bg-[color:color-mix(in_srgb,var(--hl-secondary)_10%,var(--hl-surface-low))] hover:shadow-xl"
                >
                  <div className="w-12 h-12 rounded-md bg-[color-mix(in_srgb,var(--hl-primary)_10%,transparent)] flex items-center justify-center text-[color:var(--hl-primary)] mb-6 transition-[transform,background-color] duration-500 ease-out group-hover:scale-110 group-hover:bg-[color-mix(in_srgb,var(--hl-primary)_18%,transparent)] motion-reduce:group-hover:scale-100">
                    <Truck
                      className="w-6 h-6 transition-transform duration-500 group-hover:-translate-y-0.5 motion-reduce:group-hover:translate-y-0"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  </div>
                  <h3
                    className="text-[color:var(--hl-primary)] text-2xl font-medium mb-3"
                    style={{ fontFamily: 'var(--font-highland-display)' }}
                  >
                    {t('aboutPage.collections.monthly.title')}
                  </h3>
                  <p className="hl-sans text-sm text-[color:color-mix(in_srgb,var(--hl-on-surface)_70%,transparent)] leading-relaxed mb-8 max-w-sm">
                    {t('aboutPage.collections.monthly.desc')}
                  </p>
                  <button
                    type="button"
                    className="btn-highland-outline transition-[transform,box-shadow] duration-300 group-hover:scale-[1.03] group-hover:shadow-[0_12px_28px_rgba(28,28,25,0.06)] motion-reduce:group-hover:scale-100 motion-reduce:group-hover:shadow-none"
                    onClick={() => navigate('/products')}
                  >
                    {t('aboutPage.collections.monthly.cta')}
                  </button>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.15 }}
                className="min-h-[min(42vh,280px)] sm:min-h-[300px] md:min-h-[320px]"
              >
                <motion.button
                  type="button"
                  variants={aboutCollectionCardVariants}
                  initial="rest"
                  whileHover={reduceMotion ? undefined : 'hover'}
                  whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                  onClick={() => navigate('/products')}
                  className="group relative h-full w-full min-h-[inherit] rounded-md overflow-hidden text-left cursor-pointer border-0 p-0 shadow-sm transition-shadow duration-300 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hl-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--hl-surface)]"
                >
                  <motion.img
                    variants={aboutCollectionImageVariants}
                    initial={false}
                    src={IMG_TRAY}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-center"
                    loading="lazy"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[color-mix(in_srgb,var(--hl-primary)_90%,transparent)] via-[color-mix(in_srgb,var(--hl-primary)_28%,transparent)] to-transparent transition-all duration-500 ease-out group-hover:from-[color-mix(in_srgb,var(--hl-primary)_95%,transparent)] group-hover:via-[color-mix(in_srgb,var(--hl-primary)_48%,transparent)] group-hover:to-black/10" />
                  <div className="relative z-[1] h-full min-h-[inherit] flex flex-col justify-end p-6 sm:p-8">
                    <p
                      className="text-white text-2xl sm:text-3xl font-medium mb-2 max-w-[16ch] transition-[letter-spacing] duration-300 group-hover:tracking-wide"
                      style={{ fontFamily: 'var(--font-highland-display)' }}
                    >
                      {t('aboutPage.collections.heritage.title')}
                    </p>
                    <p className="hl-sans text-sm text-white/85 mb-4 max-w-md leading-relaxed transition-colors duration-300 group-hover:text-white/95">
                      {t('aboutPage.collections.heritage.desc')}
                    </p>
                    <span className="hl-sans text-sm font-semibold text-white inline-flex items-center gap-1 transition-[transform] duration-300 group-hover:translate-x-1">
                      {t('aboutPage.collections.heritage.cta')}
                      <span
                        aria-hidden
                        className="transition-transform duration-300 group-hover:translate-x-0.5"
                      >
                        &gt;
                      </span>
                    </span>
                  </div>
                </motion.button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section
          className="about-cta-gradient-animated py-20 lg:py-24 px-5 sm:px-8 text-center"
          aria-labelledby="about-cta-heading"
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2
              id="about-cta-heading"
              className="text-black text-3xl sm:text-4xl font-medium mb-4 max-w-2xl mx-auto"
              style={{ fontFamily: 'var(--font-highland-display)' }}
            >
              {t('aboutPage.cta.title')}
            </h2>
            <p className="hl-sans text-white/85 mb-10 max-w-xl mx-auto leading-relaxed">
              {t('aboutPage.cta.subtitle')}
            </p>
            <button
              type="button"
              className="btn-highland-on-gradient"
              onClick={() => navigate('/products')}
            >
              {t('aboutPage.cta.button')}
            </button>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
