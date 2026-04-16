import React, { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import EditorialPageShell from "@/components/layout/EditorialPageShell";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { blogs } from "@/data/blogs";

const BlogNotFound = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useDocumentTitle("pages.blogDetail.notFoundDocumentTitle");

  return (
    <EditorialPageShell>
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12 py-12 lg:py-16">
        <div className="contact-form-card max-w-xl rounded-md p-8">
          <h2
            className="text-xl font-medium text-[color:var(--hl-primary)]"
            style={{ fontFamily: "var(--font-highland-display)" }}
          >
            {t("blogDetail.notFoundTitle")}
          </h2>
          <p className="hl-sans mt-3 text-sm text-[color:color-mix(in_srgb,var(--hl-on-surface)_72%,transparent)] leading-relaxed">
            {t("blogDetail.notFoundDescription")}
          </p>
          <button
            type="button"
            onClick={() => navigate("/blog")}
            className="btn-highland-primary mt-6 inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            {t("blogDetail.notFoundCta")}
          </button>
        </div>
      </div>
    </EditorialPageShell>
  );
};

export default function BlogDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const post = useMemo(() => blogs.find((b) => b.id === id), [id]);

  useEffect(() => {
    if (!post) return;
    const prev = document.title;
    document.title = t("pages.blogDetail.documentTitle", { title: post.title });
    return () => {
      document.title = prev;
    };
  }, [post, t, i18n.language]);

  if (!post) return <BlogNotFound />;

  const locale = i18n.language?.startsWith("vi") ? "vi-VN" : "en-US";
  const dateLabel = new Date(post.date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <EditorialPageShell>
      <div className="mx-auto max-w-4xl px-5 sm:px-8 lg:px-12 py-10 lg:py-14">
        <button
          type="button"
          onClick={() => navigate("/blog")}
          className="hl-sans inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--hl-secondary)] hover:text-[color:var(--hl-primary)] transition-colors"
        >
          <ArrowLeft size={16} />
          {t("blogDetail.backToBlog")}
        </button>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-6 text-3xl sm:text-4xl font-medium text-[color:var(--hl-primary)] leading-tight"
          style={{ fontFamily: "var(--font-highland-display)" }}
        >
          {post.title}
        </motion.h1>

        <div className="hl-sans mt-4 text-sm text-[color:color-mix(in_srgb,var(--hl-on-surface)_65%,transparent)]">
          <span className="font-medium text-[color:var(--hl-on-surface)]">{post.author}</span> •{" "}
          <span>{dateLabel}</span>
        </div>

        <div className="mt-8 overflow-hidden rounded-md about-ambient-float border border-[color:color-mix(in_srgb,var(--hl-outline-variant)_25%,transparent)]">
          <img src={post.image} alt={post.title} className="w-full object-cover max-h-[420px]" />
        </div>

        {post.content?.intro && (
          <p className="hl-sans mt-8 text-base text-[color:color-mix(in_srgb,var(--hl-on-surface)_88%,transparent)] leading-relaxed">
            {post.content.intro}
          </p>
        )}

        <div className="mt-10 space-y-6">
          {(post.content?.sections ?? []).map((s, idx) => (
            <section
              key={idx}
              className="rounded-md border border-[color:color-mix(in_srgb,var(--hl-outline-variant)_22%,transparent)] bg-[color:var(--hl-surface-lowest)] p-6 shadow-sm"
            >
              <h2
                className="text-lg font-medium text-[color:var(--hl-primary)]"
                style={{ fontFamily: "var(--font-highland-display)" }}
              >
                {s.title}
              </h2>
              <ul className="hl-sans mt-4 list-disc pl-5 space-y-2 text-[color:color-mix(in_srgb,var(--hl-on-surface)_88%,transparent)]">
                {s.bullets.map((b, i) => (
                  <li key={i} className="leading-relaxed">
                    {b}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {post.content?.conclusion && (
          <div className="mt-10 rounded-md border border-[color:color-mix(in_srgb,var(--hl-outline-variant)_22%,transparent)] bg-[color:var(--hl-surface-low)] p-6">
            <div
              className="hl-sans text-sm font-semibold text-[color:var(--hl-primary)] uppercase tracking-wider"
              style={{ fontFamily: "var(--font-highland-display)" }}
            >
              {t("blogDetail.conclusionHeading")}
            </div>
            <p className="hl-sans mt-3 text-[color:color-mix(in_srgb,var(--hl-on-surface)_88%,transparent)] leading-relaxed">
              {post.content.conclusion}
            </p>
          </div>
        )}
      </div>
    </EditorialPageShell>
  );
}
