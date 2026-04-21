import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import EditorialPageShell from '@/components/layout/editorialpageshells/EditorialPageShell';
import { useDocumentTitle } from '@/hooks/userdocumentitles/useDocumentTitle';

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();

  useDocumentTitle('pages.notFound.documentTitle');

  return (
    <EditorialPageShell innerClassName="min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center px-5 py-20 text-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-lg"
      >
        <p className="hl-sans text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--hl-secondary)] mb-6">
          {t('common.brandName')}
        </p>
        <div className="text-6xl sm:text-7xl mb-4" aria-hidden>
          ☕
        </div>
        <h1
          className="text-[color:var(--hl-primary)] text-6xl sm:text-7xl font-medium leading-none tracking-tight mb-4"
          style={{ fontFamily: 'var(--font-highland-display)' }}
        >
          404
        </h1>
        <h2 className="hl-sans text-xl sm:text-2xl font-semibold text-[color:var(--hl-on-surface)] mb-3">
          {t('notFoundPage.heading')}
        </h2>
        <p className="hl-sans text-sm sm:text-base text-[color:color-mix(in_srgb,var(--hl-on-surface)_72%,transparent)] leading-relaxed mb-10">
          {t('notFoundPage.description')}
        </p>
        <Link to="/" className="btn-highland-primary inline-block no-underline">
          {t('notFoundPage.cta')} →
        </Link>
      </motion.div>
    </EditorialPageShell>
  );
};

export default NotFoundPage;
