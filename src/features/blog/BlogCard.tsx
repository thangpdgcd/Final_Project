import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { BlogCardProps } from '@/types/blog/blog.types';

const BlogCard = ({ post }: BlogCardProps) => {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language?.toLowerCase().startsWith('vi');
  const fallbackImg = useMemo(() => {
    const svg = encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750" viewBox="0 0 1200 750">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#1d1106"/>
            <stop offset="1" stop-color="#423224"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="750" fill="url(#g)"/>
        <text x="50%" y="50%" fill="#f8deca" font-size="42" font-family="Georgia, serif" text-anchor="middle" dominant-baseline="middle">Phan Coffee Journal</text>
      </svg>`,
    );
    return `data:image/svg+xml;charset=utf-8,${svg}`;
  }, []);

  const [imgSrc, setImgSrc] = useState(post.image);

  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ type: 'tween', duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="group overflow-hidden rounded-lg border border-[color:var(--hl-outline-variant)] bg-[color:color-mix(in_srgb,var(--hl-surface)_90%,transparent)] shadow-[var(--hl-shadow-card)] transition-colors hover:bg-[color:color-mix(in_srgb,var(--hl-surface)_86%,transparent)] hover:shadow-[var(--hl-shadow-card-hover)]"
    >
      <Link to={`/blog/${post.id}`} className="block no-underline text-inherit">
        <div className="relative aspect-[16/10] overflow-hidden about-ambient-float">
          <img
            src={imgSrc}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
            loading="lazy"
            onError={() => setImgSrc(fallbackImg)}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-85" />
        </div>

        <div className="p-5 sm:p-6">
          <div className="hl-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--hl-secondary)] sm:text-xs">
            {post.author} •{' '}
            {new Date(post.date).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
          <h3
            className="mt-3 text-lg font-semibold leading-snug text-[color:var(--hl-primary)]"
            style={{ fontFamily: 'var(--font-highland-display)' }}
          >
            {isVi ? post.title_vi ?? post.title : post.title}
          </h3>
          <p className="hl-sans mt-2 text-sm leading-relaxed text-[color:color-mix(in_srgb,var(--hl-on-surface)_74%,transparent)] line-clamp-3">
            {isVi ? post.excerpt_vi ?? post.excerpt : post.excerpt}
          </p>

          <span className="mt-5 inline-flex items-center justify-center rounded-md border border-[color:var(--hl-outline)] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--hl-primary)] transition-colors hover:border-[color:var(--hl-secondary)] hover:text-[color:var(--hl-secondary)]">
            {t('blog.ui.readMore')}
          </span>
        </div>
      </Link>
    </motion.article>
  );
};

export default BlogCard;
