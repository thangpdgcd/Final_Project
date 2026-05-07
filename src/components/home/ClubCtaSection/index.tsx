import React from 'react';
import { useTranslation } from 'react-i18next';

import './index.scss';

const ClubCtaSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className="club-cta">
      <div className="club-cta__container">
        <h2 className="club-cta__title">{t('home.clubCtaTitle')}</h2>
        <p className="club-cta__subtitle">{t('home.clubCtaSubtitle')}</p>

        <form
          className="club-cta__form"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <input
            className="club-cta__input"
            placeholder={t('home.clubCtaEmailPlaceholder')}
            type="email"
          />
          <button className="club-cta__btn" type="submit">
            {t('home.clubCtaButton')}
          </button>
        </form>
      </div>
    </section>
  );
};

export default ClubCtaSection;
