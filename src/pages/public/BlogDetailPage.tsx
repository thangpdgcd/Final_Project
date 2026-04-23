import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import EditorialPageShell from '@/components/layout/editorialpageshells/EditorialPageShell';
import PageContainer from '@/components/layout/pagescontainer/PageContainer';
import { useDocumentTitle } from '@/hooks/userdocumentitles/useDocumentTitle';
import { blogs } from '@/components/data/blogs';
import { fadeInUp } from '@/utils/motions/motion';

const BlogNotFound: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useDocumentTitle('pages.blogDetail.notFoundDocumentTitle');

  return (
    <EditorialPageShell>
      <PageContainer wide className="py-12 lg:py-16">
        <div className="contact-form-card max-w-xl rounded-md p-8">
          <h2
            className="text-xl font-medium text-[color:var(--hl-primary)]"
            style={{ fontFamily: 'var(--font-highland-display)' }}
          >
            {t('blogDetail.notFoundTitle')}
          </h2>
          <p className="hl-sans mt-3 text-sm leading-relaxed text-[color:color-mix(in_srgb,var(--hl-on-surface)_72%,transparent)]">
            {t('blogDetail.notFoundDescription')}
          </p>
          <button
            type="button"
            onClick={() => navigate('/blog')}
            className="btn-highland-primary mt-6 inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            {t('blogDetail.notFoundCta')}
          </button>
        </div>
      </PageContainer>
    </EditorialPageShell>
  );
};

const BlogDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const post = useMemo(() => blogs.find((b) => b.id === id), [id]);

  useEffect(() => {
    if (!post) return;
    const prev = document.title;
    document.title = t('pages.blogDetail.documentTitle', { title: post.title });
    return () => {
      document.title = prev;
    };
  }, [post, t, i18n.language]);

  if (!post) return <BlogNotFound />;

  const locale = i18n.language?.startsWith('vi') ? 'vi-VN' : 'en-US';
  const dateLabel = new Date(post.date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const sections = post.content?.sections ?? [];

  return (
    <EditorialPageShell>
      <PageContainer className="max-w-4xl py-10 lg:py-14">
        <button
          type="button"
          onClick={() => navigate('/blog')}
          className="hl-sans inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--hl-secondary)] transition-colors hover:text-[color:var(--hl-primary)]"
        >
          <ArrowLeft size={16} />
          {t('blogDetail.backToBlog')}
        </button>

        <motion.h1
          variants={fadeInUp}
          initial="hidden"
          animate="show"
          className="mt-6 text-3xl font-medium leading-tight text-[color:var(--hl-primary)] sm:text-4xl"
          style={{ fontFamily: 'var(--font-highland-display)' }}
        >
          {post.title}
        </motion.h1>

        <div className="hl-sans mt-4 text-sm text-[color:color-mix(in_srgb,var(--hl-on-surface)_65%,transparent)]">
          <span className="font-medium text-[color:var(--hl-on-surface)]">{post.author}</span> •{' '}
          <span>{dateLabel}</span>
        </div>

        <div className="mt-8 overflow-hidden rounded-md border border-[color:color-mix(in_srgb,var(--hl-outline-variant)_25%,transparent)]">
          <img src={post.image} alt={post.title} className="max-h-[420px] w-full object-cover" />
        </div>

        {post.content?.intro && (
          <p className="hl-sans mt-8 text-base leading-relaxed text-[color:color-mix(in_srgb,var(--hl-on-surface)_88%,transparent)]">
            {post.content.intro}
          </p>
        )}

        {sections.length > 0 && (
          <div className="mt-10 space-y-6">
            {sections.map((s, idx) => (
              <section
                key={`${s.title}-${idx}`}
                className="rounded-md border border-[color:color-mix(in_srgb,var(--hl-outline-variant)_22%,transparent)] bg-[color:var(--hl-surface-lowest)] p-6 shadow-sm"
              >
                <h2
                  className="text-lg font-medium text-[color:var(--hl-primary)]"
                  style={{ fontFamily: 'var(--font-highland-display)' }}
                >
                  {s.title}
                </h2>
                <ul className="hl-sans mt-4 list-disc space-y-2 pl-5 text-[color:color-mix(in_srgb,var(--hl-on-surface)_88%,transparent)]">
                  {s.bullets.map((b, i) => (
                    <li key={`${idx}-${i}`} className="leading-relaxed">
                      {b}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        {post.content?.conclusion && (
          <div className="mt-10 rounded-md border border-[color:color-mix(in_srgb,var(--hl-outline-variant)_22%,transparent)] bg-[color:var(--hl-surface-low)] p-6">
            <div
              className="hl-sans text-sm font-semibold uppercase tracking-wider text-[color:var(--hl-primary)]"
              style={{ fontFamily: 'var(--font-highland-display)' }}
            >
              {t('blogDetail.conclusionHeading')}
            </div>
            <p className="hl-sans mt-3 leading-relaxed text-[color:color-mix(in_srgb,var(--hl-on-surface)_88%,transparent)]">
              {post.content.conclusion}
            </p>
          </div>
        )}
      </PageContainer>
    </EditorialPageShell>
  );
};

export default BlogDetailPage;
