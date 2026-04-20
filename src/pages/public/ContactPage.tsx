import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Mail, Phone, ArrowRight, Instagram, Facebook, Twitter } from 'lucide-react';
import { toast } from 'react-toastify';

const IMG_CONTACT =
  'https://res.cloudinary.com/dfjecxrnl/image/upload/e_grayscale,f_auto,q_auto:best,c_fill,g_faces,h_1100,w_720/v1768823885/492005643_716963337517931_4130308983468400647_n_sc00pf.jpg';

/** Google Maps embed — CÔNG TY TNHH PHAN COFFEE (same pin as “Directions”) */
const MAP_EMBED_SRC =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3866.0051352833216!2d107.92426178451606!3d14.311134348382254!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x316c07005090c739%3A0xa89c75670a39361d!2sC%C3%94NG%20TY%20TNHH%20PHAN%20COFFEE!5e0!3m2!1svi!2s!4v1775898110500!5m2!1svi!2s';

/** Lat,lng from embed — stable across locales for opening Google Maps directions */
const MAP_DIRECTIONS_DEST = '14.311134348382254,107.92426178451606';

const ContactPage: React.FC = () => {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const [loading, setLoading] = useState(false);

  useDocumentTitle('pages.contact.documentTitle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    inquiryType: 'general',
    message: '',
    newsletter: false,
  });

  const address = t('footer.contact.address');
  const phone = t('footer.contact.phone');
  const email = t('footer.contact.email');
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(MAP_DIRECTIONS_DEST)}`;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error(t('contact.form.nameRequired'));
      return;
    }
    if (!formData.email.trim()) {
      toast.error(t('contact.form.emailRequired'));
      return;
    }
    if (!formData.message.trim()) {
      toast.error(t('contact.form.messageRequired'));
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success(t('contact.success'));
    setFormData({
      name: '',
      email: '',
      inquiryType: 'general',
      message: '',
      newsletter: false,
    });
    setLoading(false);
  };

  const motionFade = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-80px' },
        transition: { duration: 0.55 },
      };

  const telHref = `tel:${phone.replace(/\s/g, '')}`;

  return (
    <div className="about-page about-page--bg-animate min-h-screen bg-[color:var(--hl-surface)] text-[color:var(--hl-on-surface)]">
      <div className="relative z-[1]">
        {/* Hero */}
        <section
          className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 pt-10 pb-16 lg:pt-14 lg:pb-24"
          aria-labelledby="contact-hero-heading"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 lg:items-end">
            <motion.div
              className="lg:col-span-7"
              initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="hl-sans text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--hl-secondary)] mb-5">
                {t('contact.heroLabel')}
              </p>
              <h1
                id="contact-hero-heading"
                className="text-[color:var(--hl-primary)] text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-[3.5rem] font-medium leading-[1.12] tracking-tight"
                style={{ fontFamily: 'var(--font-highland-display)' }}
              >
                {t('contact.heroTitle')}
              </h1>
            </motion.div>
            <motion.div
              className="lg:col-span-5"
              initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.08 }}
            >
              <p className="hl-sans text-base sm:text-lg text-[color:color-mix(in_srgb,var(--hl-on-surface)_78%,transparent)] leading-relaxed lg:max-w-md lg:ml-auto lg:text-right">
                {t('contact.heroSubtitle')}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main: info + image | form */}
        <section
          className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 pb-24 lg:pb-36"
          aria-labelledby="contact-form-heading"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-16 xl:gap-20 items-start">
            <div className="lg:col-span-5 flex flex-col gap-12 lg:gap-14">
              <motion.div {...motionFade}>
                <h2 className="hl-sans text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--hl-secondary)] mb-3">
                  {t('contact.roasteryTitle')}
                </h2>
                <p className="hl-sans text-lg text-[color:var(--hl-on-surface)] leading-relaxed max-w-sm">
                  {address}
                </p>
              </motion.div>

              <motion.div {...motionFade}>
                <h2 className="hl-sans text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--hl-secondary)] mb-6">
                  {t('contact.directLinesTitle')}
                </h2>
                <ul className="space-y-5">
                  <li className="flex items-start gap-4">
                    <div className="contact-icon-well" aria-hidden>
                      <Mail className="w-[18px] h-[18px]" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="hl-sans text-[10px] uppercase tracking-[0.12em] text-[color:color-mix(in_srgb,var(--hl-on-surface)_50%,transparent)] mb-0.5">
                        {t('contact.emailLabel')}
                      </p>
                      <a
                        href={`mailto:${email}`}
                        className="hl-sans text-base font-medium text-[color:var(--hl-primary)] hover:underline underline-offset-4"
                      >
                        {email}
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="contact-icon-well" aria-hidden>
                      <Phone className="w-[18px] h-[18px]" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="hl-sans text-[10px] uppercase tracking-[0.12em] text-[color:color-mix(in_srgb,var(--hl-on-surface)_50%,transparent)] mb-0.5">
                        {t('contact.phoneLabel')}
                      </p>
                      <a
                        href={telHref}
                        className="hl-sans text-base font-medium text-[color:var(--hl-primary)] hover:underline underline-offset-4"
                      >
                        {phone}
                      </a>
                    </div>
                  </li>
                </ul>
              </motion.div>

              <motion.div {...motionFade}>
                <h2 className="hl-sans text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--hl-secondary)] mb-4">
                  {t('contact.socialTitle')}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="https://www.instagram.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-social-btn"
                    aria-label={t('contact.socialInstagram')}
                  >
                    <Instagram size={18} strokeWidth={1.75} />
                  </a>
                  <a
                    href="https://www.facebook.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-social-btn"
                    aria-label={t('contact.socialFacebook')}
                  >
                    <Facebook size={18} strokeWidth={1.75} />
                  </a>
                  <a
                    href="https://twitter.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-social-btn"
                    aria-label={t('contact.socialTwitter')}
                  >
                    <Twitter size={18} strokeWidth={1.75} />
                  </a>
                </div>
              </motion.div>

              <motion.div className="relative w-full max-w-md lg:max-w-none mt-4" {...motionFade}>
                <div className="relative w-full min-h-[min(52vh,440px)] lg:min-h-[min(64vh,560px)] rounded-md overflow-hidden about-ambient-float">
                  <img
                    src={IMG_CONTACT}
                    alt=""
                    width={720}
                    height={1100}
                    className="absolute inset-0 h-full w-full object-cover object-center contrast-[1.05]"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="contact-form-card absolute right-4 bottom-4 left-4 sm:left-auto sm:right-6 sm:bottom-6 max-w-[min(100%,300px)] p-4 sm:p-5 z-10">
                  <p
                    className="text-[color:var(--hl-primary)] text-lg sm:text-xl italic leading-snug"
                    style={{ fontFamily: 'var(--font-highland-display)' }}
                  >
                    {t('contact.quote')}
                  </p>
                </div>
              </motion.div>
            </div>

            <motion.div
              className="lg:col-span-6 lg:col-start-7 w-full"
              initial={reduceMotion ? undefined : { opacity: 0, x: 24 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.65 }}
            >
              <div className="contact-form-card pl-6 pr-6 pt-8 pb-8 sm:pl-8 sm:pr-10 sm:pt-10 sm:pb-10 lg:pl-10 lg:pr-12">
                <h2
                  id="contact-form-heading"
                  className="text-[color:var(--hl-primary)] text-2xl sm:text-[1.75rem] font-medium mb-8"
                  style={{ fontFamily: 'var(--font-highland-display)' }}
                >
                  {t('contact.form.title')}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div>
                    <label htmlFor="contact-name" className="hl-field-label">
                      {t('contact.form.nameLabel')}
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="hl-input-underline"
                      placeholder={t('contact.form.namePlaceholder')}
                      autoComplete="name"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="hl-field-label">
                      {t('contact.form.emailLabel')}
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="hl-input-underline"
                      placeholder={t('contact.form.emailPlaceholder')}
                      autoComplete="email"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-inquiry" className="hl-field-label">
                      {t('contact.form.inquiryTypeLabel')}
                    </label>
                    <select
                      id="contact-inquiry"
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleChange}
                      className="hl-select-underline"
                    >
                      <option value="general">{t('contact.form.inquiryGeneral')}</option>
                      <option value="wholesale">{t('contact.form.inquiryWholesale')}</option>
                      <option value="press">{t('contact.form.inquiryPress')}</option>
                      <option value="other">{t('contact.form.inquiryOther')}</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="hl-field-label">
                      {t('contact.form.messageLabel')}
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      className="hl-input-underline"
                      placeholder={t('contact.form.messagePlaceholder')}
                    />
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-6 pt-2">
                    <label className="hl-sans flex items-center gap-3 cursor-pointer text-sm text-[color:color-mix(in_srgb,var(--hl-on-surface)_75%,transparent)] select-none">
                      <input
                        type="checkbox"
                        name="newsletter"
                        checked={formData.newsletter}
                        onChange={handleCheckbox}
                        className="h-4 w-4 rounded border-0 accent-[color:var(--hl-primary)] focus-visible:ring-2 focus-visible:ring-[color:var(--hl-primary)] focus-visible:ring-offset-2"
                      />
                      <span>{t('contact.form.newsletterLabel')}</span>
                    </label>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-highland-primary inline-flex items-center justify-center gap-2 self-end sm:self-auto shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span
                          className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                          aria-hidden
                        />
                      ) : (
                        <>
                          <span className="uppercase tracking-[0.06em] text-sm font-semibold">
                            {t('contact.form.submit')}
                          </span>
                          <ArrowRight className="w-4 h-4 shrink-0" strokeWidth={2.25} aria-hidden />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Map */}
        <section
          className="relative w-full min-h-[min(52vh,520px)] lg:min-h-[480px]"
          aria-labelledby="contact-map-heading"
        >
          <div className="absolute inset-0 grayscale contrast-[0.92]">
            <iframe
              title={t('contact.mapTitle')}
              src={MAP_EMBED_SRC}
              className="absolute inset-0 h-full w-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div
            className="pointer-events-none absolute inset-0 bg-[color-mix(in_srgb,var(--hl-surface)_8%,transparent)]"
            aria-hidden
          />

          <div className="relative z-[1] max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-12 lg:py-16 min-h-[inherit] flex items-center">
            <a
              href={directionsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-white/95 px-5 py-2.5 text-sm font-semibold text-stone-900 shadow-lg ring-1 ring-black/5 hover:bg-white"
            >
              {t('contact.mapDirections')}
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ContactPage;
