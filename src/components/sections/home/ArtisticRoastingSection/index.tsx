import React from "react";
import { useTranslation } from "react-i18next";

import "./index.scss";

const ArtisticRoastingSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className='artistic-roasting'>
      <div className='artistic-roasting__bg' aria-hidden='true'>
        <img
          src='https://lh3.googleusercontent.com/aida-public/AB6AXuBht9BrztcHyZynCJPKwFFWILvli3dEGVJUY6_GL6eTJAUXlfsFIioogh91wjxKrcZYds9ZPGNi614TSbgC9Cp7KXkHnt-MIC1qIJP0-fuwKD1v1fFNz5lwbpX4B_dxGKGdvmeBYZsHnwz88D_-UZoapIcblayYz0PEn41bcEr8hHl7cpHaxaLyUoPav1Pva9-a89jH7zTz9ZHMfkDXCavQwS3V61E8KeeuX8SzgWkWMqYX2iPKXFLdofHHkk2qb6Fuj7r8aqWw-R45'
          alt=''
          loading='lazy'
        />
      </div>
      <div className='artistic-roasting__container'>
        <div className='artistic-roasting__content'>
          <h2 className='artistic-roasting__title'>{t("home.artisticRoasting.title")}</h2>
          <p className='artistic-roasting__desc'>
            {t("home.artisticRoasting.desc")}
          </p>

          <div className='artistic-roasting__grid'>
            <div className='artistic-roasting__card'>
              <div className='artistic-roasting__icon' aria-hidden='true'>
                🔥
              </div>
              <div className='artistic-roasting__card-title'>{t("home.artisticRoasting.cards.temp.title")}</div>
              <div className='artistic-roasting__card-desc'>
                {t("home.artisticRoasting.cards.temp.desc")}
              </div>
            </div>

            <div className='artistic-roasting__card'>
              <div className='artistic-roasting__icon' aria-hidden='true'>
                ⏱️
              </div>
              <div className='artistic-roasting__card-title'>{t("home.artisticRoasting.cards.slowRoast.title")}</div>
              <div className='artistic-roasting__card-desc'>
                {t("home.artisticRoasting.cards.slowRoast.desc")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArtisticRoastingSection;

