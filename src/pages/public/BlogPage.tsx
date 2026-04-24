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

  const [featured, ...rest] = blogs;

  return (
    <EditorialPageShell className="abrew">
      <PageContainer wide className="pt-10 pb-24 lg:pt-14 lg:pb-32">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-2xl">
            <p className="hl-sans mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--hl-secondary)] sm:text-sm">
              {t('blogPage.eyebrow')}
            </p>
            <h1
              className="text-4xl font-semibold leading-[1.08] tracking-tight text-[color:var(--hl-primary)] sm:text-5xl lg:text-6xl"
              style={{ fontFamily: 'var(--font-highland-display)' }}
            >
              {t('blogPage.title')}
            </h1>
            <p className="hl-sans mt-5 max-w-xl text-base leading-relaxed text-[color:color-mix(in_srgb,var(--hl-on-surface)_78%,transparent)] lg:text-lg">
              {t('blogPage.subtitle')}
            </p>
          </div>
        </motion.div>

        {featured && (
          <motion.section
            variants={fadeInUp}
            initial="hidden"
            animate="show"
            className="mt-12 overflow-hidden rounded-lg border border-[color:var(--hl-outline-variant)] bg-[color:color-mix(in_srgb,var(--hl-surface)_92%,transparent)] shadow-[var(--hl-shadow-card)]"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="relative lg:col-span-7">
                <div className="relative aspect-[16/10] overflow-hidden lg:aspect-[16/9]">
                  <img
                    src={featured.image}
                    alt={featured.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                </div>
              </div>
              <div className="lg:col-span-5">
                <div className="p-6 sm:p-8 lg:p-10">
                  <div className="hl-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--hl-secondary)]">
                    Featured
                  </div>
                  <h2
                    className="mt-4 text-2xl font-semibold leading-snug text-[color:var(--hl-primary)] sm:text-3xl"
                    style={{ fontFamily: 'var(--font-highland-display)' }}
                  >
                    {featured.title}
                  </h2>
                  <p className="hl-sans mt-4 text-sm leading-relaxed text-[color:color-mix(in_srgb,var(--hl-on-surface)_78%,transparent)] sm:text-base">
                    {featured.excerpt}
                  </p>
                  <div className="mt-6">
                    <a
                      href={`/blog/${featured.id}`}
                      className="inline-flex items-center justify-center rounded-md bg-[color:var(--hl-tertiary)] px-5 py-2.5 text-sm font-bold text-[color:var(--hl-on-surface)] transition-transform duration-300 hover:-translate-y-0.5"
                    >
                      Read article
                    </a>
                  </div>
                  <div className="hl-sans mt-6 text-xs text-[color:color-mix(in_srgb,var(--hl-on-surface)_60%,transparent)]">
                    {featured.author} •{' '}
                    {new Date(featured.date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-10">
          {rest.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </PageContainer>
    </EditorialPageShell>
  );
};

export default BlogPage;
