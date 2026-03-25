import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import "./index.scss";

const FeaturedProductSection: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className='featured-product'>
      <div className='featured-product__container'>
        <div className='featured-product__grid'>
          <div className='featured-product__media'>
            <div className='featured-product__media-inner'>
              <img
                src='https://res.cloudinary.com/dfjecxrnl/image/upload/v1768211093/arabicamangden4_ymrrpn.jpg'
                alt={t("home.bestSeller.imageAlt")}
                loading='lazy'
              />
              <div className='featured-product__badge'>{t("home.bestSeller.badge")}</div>
            </div>
          </div>

          <div className='featured-product__content'>
            <p className='featured-product__eyebrow'>{t("home.bestSeller.eyebrow")}</p>
            <h2 className='featured-product__title'>{t("home.bestSeller.title")}</h2>
            <p className='featured-product__quote'>
              {t("home.bestSeller.quote")}
            </p>

            <ul className='featured-product__bullets'>
              <li>
                <span className='featured-product__dot' aria-hidden='true' />
                {t("home.bestSeller.bullets.0")}
              </li>
              <li>
                <span className='featured-product__dot' aria-hidden='true' />
                {t("home.bestSeller.bullets.1")}
              </li>
              <li>
                <span className='featured-product__dot' aria-hidden='true' />
                {t("home.bestSeller.bullets.2")}
              </li>
            </ul>

            <div className='featured-product__bottom'>
              <div className='featured-product__price'>{t("home.bestSeller.price")}</div>
              <button className='featured-product__cta' onClick={() => navigate("/products")}>
                {t("home.bestSeller.addToCart")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductSection;

