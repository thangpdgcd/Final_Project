import React, { useEffect, useMemo, useState } from 'react';
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
    <EditorialPageShell className="abrew">
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
  const fallbackImg = useMemo(() => {
    const svg = encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#1d1106"/>
            <stop offset="1" stop-color="#423224"/>
          </linearGradient>
        </defs>
        <rect width="1600" height="900" fill="url(#g)"/>
        <text x="50%" y="50%" fill="#f8deca" font-size="52" font-family="Georgia, serif" text-anchor="middle" dominant-baseline="middle">Phan Coffee Journal</text>
      </svg>`,
    );
    return `data:image/svg+xml;charset=utf-8,${svg}`;
  }, []);
  const [heroSrc, setHeroSrc] = useState(post.image);

  return (
    <EditorialPageShell className="abrew">
      <PageContainer className="max-w-5xl py-10 lg:py-16">
        <button
          type="button"
          onClick={() => navigate('/blog')}
          className="hl-sans inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--hl-secondary)] transition-colors hover:text-[color:var(--hl-primary)]"
        >
          <ArrowLeft size={16} />
          {t('blogDetail.backToBlog')}
        </button>

        <motion.header
          variants={fadeInUp}
          initial="hidden"
          animate="show"
          className="mt-8"
        >
          <div className="hl-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--hl-secondary)]">
            {t('blogPage.eyebrow')}
          </div>
          <h1
            className="mt-4 text-3xl font-semibold leading-[1.12] tracking-tight text-[color:var(--hl-primary)] sm:text-4xl lg:text-5xl"
            style={{ fontFamily: 'var(--font-highland-display)' }}
          >
            {post.title}
          </h1>
          <div className="hl-sans mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[color:color-mix(in_srgb,var(--hl-on-surface)_68%,transparent)]">
            <span className="font-semibold text-[color:var(--hl-on-surface)]">{post.author}</span>
            <span className="opacity-70">•</span>
            <span>{dateLabel}</span>
          </div>
        </motion.header>

        <div className="mt-10 overflow-hidden rounded-lg border border-[color:var(--hl-outline-variant)] bg-[color:color-mix(in_srgb,var(--hl-surface)_92%,transparent)] shadow-[var(--hl-shadow-card)]">
          <img
            src={heroSrc}
            alt={post.title}
            className="max-h-[520px] w-full object-cover"
            loading="lazy"
            onError={() => setHeroSrc(fallbackImg)}
          />
        </div>

        {post.content?.intro && (
          <p className="hl-sans mt-10 text-base leading-relaxed text-[color:color-mix(in_srgb,var(--hl-on-surface)_88%,transparent)] lg:text-lg">
            {post.content.intro}
          </p>
        )}

        {sections.length > 0 && (
          <div className="mt-12 space-y-7">
            {sections.map((s, idx) => (
              <section
                key={`${s.title}-${idx}`}
                className="rounded-lg border border-[color:var(--hl-outline-variant)] bg-[color:color-mix(in_srgb,var(--hl-surface)_88%,transparent)] p-6 shadow-[var(--hl-shadow-card)] lg:p-7"
              >
                <h2
                  className="text-lg font-semibold text-[color:var(--hl-primary)] lg:text-xl"
                  style={{ fontFamily: 'var(--font-highland-display)' }}
                >
                  {s.title}
                </h2>
                <ul className="hl-sans mt-4 list-disc space-y-2.5 pl-5 text-[color:color-mix(in_srgb,var(--hl-on-surface)_88%,transparent)]">
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
          <div className="mt-12 rounded-lg border border-[color:var(--hl-outline-variant)] bg-[color:color-mix(in_srgb,var(--hl-surface)_84%,transparent)] p-6 shadow-[var(--hl-shadow-card)] lg:p-7">
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
