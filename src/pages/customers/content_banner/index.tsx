import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import product1Img from "../../../../src/assets/img/vn-11134207-7ras8-m30uml3b3auyb2.jpg";
import product3Img from "../../../../src/assets/img/rangxay.jpg";

import "./index.scss";

const ContentBanner: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const product2Img =
    "https://res.cloudinary.com/dfjecxrnl/image/upload/v1768211093/arabicamangden4_ymrrpn.jpg";

  const products = [
    {
      key: "dalat-highlands-blend",
      badge: "Signature",
      roastLevel: "Light Roast",
      title: "Dalat Highlands Blend",
      notes: "Honey • Citrus • Chocolate",
      price: "$24.00",
      image: product1Img,
      imageAlt: "Dalat Highlands Blend",
    },
    {
      key: "golden-robusta",
      badge: "Best Seller",
      roastLevel: "Dark Roast",
      title: "Golden Robusta",
      notes: "Earthy • Nutty • Full Body",
      price: "$21.00",
      image: product2Img,
      imageAlt: "Golden Robusta",
      featured: true,
    },
    {
      key: "phan-select-single-origin",
      badge: "Light Roast",
      roastLevel: "Single Origin",
      title: "Phan Select Single Origin",
      notes: "Floral • Jasmine • Tea-like",
      price: "$32.00",
      image: product3Img,
      imageAlt: "Phan Select Single Origin",
    },
  ];

  return (
    <section className='best-sellers'>
      <div className='best-sellers__container'>
        <div className='best-sellers__header'>
          <h2 className='best-sellers__title'>{t("home.updateNews.title")}</h2>
          <p className='best-sellers__subtitle'>
            {t("home.updateNews.subtitle")}
          </p>
        </div>

        <div className='best-sellers__grid'>
          {products.map((p) => (
            <article key={p.key} className='best-sellers__card'>
              <div className='best-sellers__media'>
                <img src={p.image} alt={p.imageAlt} loading='lazy' />
              </div>

              <div className='best-sellers__body'>
                <h3 className='best-sellers__name'>{p.title}</h3>
                <p className='best-sellers__notes'>{p.notes}</p>

                <button
                  type='button'
                  className='best-sellers__link'
                  onClick={() => navigate("/products")}>
                  {t("home.updateNews.learnMore")}
                </button>
              </div>
            </article>
          ))}
          </div>
      </div>
    </section>
  );
};

export default ContentBanner;
