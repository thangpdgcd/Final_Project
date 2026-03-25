import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const steps = t('aboutPage.process.steps', { returnObjects: true }) as Array<{
    icon: string;
    title: string;
    desc: string;
  }>;
  const values = t('aboutPage.values.items', { returnObjects: true }) as Array<{
    icon: string;
    title: string;
    desc: string;
  }>;

  return (
    <div className="about-page">
      {/* HERO */}
      <section
        className="relative min-h-[70vh] flex items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(150deg, #1a0a00 0%, #4e3524 50%, #6f4e37 100%)' }}
      >
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #c4963b, transparent)' }} />
          <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #c4963b, transparent)' }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center z-10 px-4"
        >
          <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-4">{t('aboutPage.heroLabel')}</p>
          <h1 className="text-white text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: 'var(--font-display)' }}>
            {t('aboutPage.heroTitle')}
          </h1>
          <p className="text-amber-100 text-lg max-w-2xl mx-auto leading-relaxed">
            {t('aboutPage.heroSubtitle')}
          </p>
          <button
            onClick={() => navigate('/products')}
            className="mt-8 cursor-pointer btn-grad"
          >
            {t('aboutPage.heroCta')}
          </button>
        </motion.div>
      </section>

      {/* ORIGIN STORY */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="text-amber-600 text-sm font-semibold tracking-widest uppercase mb-3">{t('aboutPage.origin.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#4e3524] dark:text-amber-100 mb-6" style={{ fontFamily: 'var(--font-display)' }}>
              {t('aboutPage.origin.titleLine1')}<br />{t('aboutPage.origin.titleLine2')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              {t('aboutPage.origin.p1')}
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('aboutPage.origin.p2')}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
            <div
              className="rounded-3xl overflow-hidden"
              style={{ height: 380, background: 'linear-gradient(135deg, #6f4e37, #c4963b)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <span className="text-9xl">☕</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(to right, #fdf6e3, #f5ead0)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-amber-600 text-sm font-semibold tracking-widest uppercase mb-3">{t('aboutPage.process.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#4e3524]" style={{ fontFamily: 'var(--font-display)' }}>
              {t('aboutPage.process.title')}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="font-bold text-[#4e3524] dark:text-amber-100 mb-2">{step.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <p className="text-amber-600 text-sm font-semibold tracking-widest uppercase mb-3">{t('aboutPage.values.label')}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#4e3524] dark:text-amber-100" style={{ fontFamily: 'var(--font-display)' }}>
            {t('aboutPage.values.title')}
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="text-center"
            >
              <div className="text-5xl mb-4">{v.icon}</div>
              <h3 className="text-xl font-bold text-[#4e3524] dark:text-amber-100 mb-2" style={{ fontFamily: 'var(--font-display)' }}>{v.title}</h3>
              <p className="text-gray-500 dark:text-gray-400">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-20 px-4 text-center"
        style={{ background: 'linear-gradient(135deg, #4e3524, #6f4e37)' }}
      >
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 className="text-white text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            {t('aboutPage.cta.title')}
          </h2>
          <p className="text-amber-100 mb-8">{t('aboutPage.cta.subtitle')}</p>
          <button
            onClick={() => navigate('/products')}
            className="px-10 py-4 bg-amber-400 text-[#1a0a00] font-bold rounded-full hover:bg-amber-300 transition-all hover:scale-105"
          >
            {t('aboutPage.cta.button')}
          </button>
        </motion.div>
      </section>
    </div>
  );
};

export default AboutPage;
