import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import BlogCard from '@/components/blog/BlogCard';
import EditorialPageShell from '@/components/layout/editorialpageshells/EditorialPageShell';
import PageContainer from '@/components/layout/pagescontainer/PageContainer';
import { useDocumentTitle } from '@/hooks/userdocumentitles/useDocumentTitle';
import { blogs } from '@/components/data/blogs';
import { fadeInUp } from '@/utils/motions/motion';

const BlogPage: React.FC = () => {
  const { t } = useTranslation();

  useDocumentTitle('pages.blog.documentTitle');

  return (
    <EditorialPageShell>
      <PageContainer wide className="pt-8 pb-20 lg:pt-12 lg:pb-28">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-2xl">
            <p className="hl-sans mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--hl-secondary)] sm:text-sm">
              {t('blogPage.eyebrow')}
            </p>
            <h1
              className="text-4xl font-medium leading-[1.12] tracking-tight text-[color:var(--hl-primary)] sm:text-5xl"
              style={{ fontFamily: 'var(--font-highland-display)' }}
            >
              {t('blogPage.title')}
            </h1>
            <p className="hl-sans mt-4 text-base leading-relaxed text-[color:color-mix(in_srgb,var(--hl-on-surface)_78%,transparent)]">
              {t('blogPage.subtitle')}
            </p>
          </div>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {blogs.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </PageContainer>
    </EditorialPageShell>
  );
};

export default BlogPage;
