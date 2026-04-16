import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { BlogCardProps } from '@/components/blog/blog.types';

const BlogCard = ({ post }: BlogCardProps) => {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className="group overflow-hidden rounded-md border border-[color:color-mix(in_srgb,var(--hl-outline-variant)_22%,transparent)] bg-[color:var(--hl-surface-lowest)] shadow-[var(--hl-ambient-shadow)] hover:shadow-[var(--hl-ambient-shadow-hover)]"
    >
      <Link to={`/blog/${post.id}`} className="block no-underline text-inherit">
        <div className="relative aspect-[16/10] overflow-hidden about-ambient-float">
          <img
            src={post.image}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            loading="lazy"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[color-mix(in_srgb,var(--hl-primary)_35%,transparent)] via-transparent to-transparent opacity-80" />
        </div>

        <div className="p-5 sm:p-6">
          <div className="hl-sans text-[10px] sm:text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--hl-secondary)]">
            {post.author} •{' '}
            {new Date(post.date).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
          <h3
            className="mt-3 text-lg font-medium text-[color:var(--hl-primary)] leading-snug"
            style={{ fontFamily: 'var(--font-highland-display)' }}
          >
            {post.title}
          </h3>
          <p className="hl-sans mt-2 text-sm text-[color:color-mix(in_srgb,var(--hl-on-surface)_72%,transparent)] line-clamp-3 leading-relaxed">
            {post.excerpt}
          </p>

          <span className="btn-highland-outline mt-5 inline-flex">Read More</span>
        </div>
      </Link>
    </motion.article>
  );
};

export default BlogCard;
