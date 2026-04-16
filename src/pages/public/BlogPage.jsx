import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import BlogCard from "@/components/blog/BlogCard";
import EditorialPageShell from "@/components/layout/EditorialPageShell";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { blogs } from "@/data/blogs";

export const BlogPage = () => {
  const { t } = useTranslation();

  useDocumentTitle("pages.blog.documentTitle");

  return (
    <EditorialPageShell>
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12 pt-8 pb-20 lg:pt-12 lg:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-2xl">
            <p className="hl-sans text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--hl-secondary)] mb-4">
              {t("blogPage.eyebrow")}
            </p>
            <h1
              className="text-[color:var(--hl-primary)] text-4xl sm:text-5xl font-medium leading-[1.12] tracking-tight"
              style={{ fontFamily: "var(--font-highland-display)" }}
            >
              {t("blogPage.title")}
            </h1>
            <p className="hl-sans mt-4 text-base text-[color:color-mix(in_srgb,var(--hl-on-surface)_78%,transparent)] leading-relaxed">
              {t("blogPage.subtitle")}
            </p>
          </div>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {blogs.map((b) => (
            <BlogCard key={b.id} post={b} />
          ))}
        </div>
      </div>
    </EditorialPageShell>
  );
};

export default BlogPage;

