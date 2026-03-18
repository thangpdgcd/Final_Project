import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import "./index.scss";

const BestSellersSection: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const product = {
    key: "mangDenBlend",
    image:
      "https://res.cloudinary.com/dfjecxrnl/image/upload/v1768211093/caphehoneyphancoffee_j1ogrm.webp",
    alt: t("home.bestSeller.imageAlt", { defaultValue: "Sản phẩm Măng Đen Blend" }),
    badge: t("home.bestSeller.badge", { defaultValue: "Best Seller" }),
    eyebrow: t("home.bestSeller.eyebrow", { defaultValue: "Sản phẩm nổi bật" }),
    title: t("home.bestSeller.title", { defaultValue: "Măng Đen Blend" }),
    quote: t("home.bestSeller.quote", {
      defaultValue:
        "“Sự hòa quyện tuyệt vời giữa vị đắng thanh thoát và hương thơm nồng nàn từ tài nguyên Tây Nguyên. Một hành trình cảm xúc trong từng ngụm cà phê.”",
    }),
    bullets: [
      t("home.bestSeller.bullets.0", { defaultValue: "100% cà phê rang mộc tự nhiên" }),
      t("home.bestSeller.bullets.1", { defaultValue: "Nguồn gốc: Vùng núi Măng Đen, Kon Tum" }),
      t("home.bestSeller.bullets.2", { defaultValue: "Hương vị: Socola, Caramel, Thảo mộc" }),
    ],
    price: t("home.bestSeller.price", { defaultValue: "285.000đ" }),
  };

  return (
    <section className='best-sellers'>
      <div className='best-sellers__container'>
        <div className='best-sellers__spotlight'>
          <div className='best-sellers__media' onClick={() => navigate("/products")}>
            <div className='best-sellers__badge'>{product.badge}</div>
            <img className='best-sellers__image' src={product.image} alt={product.alt} loading='lazy' />
          </div>

          <div className='best-sellers__content'>
            <p className='best-sellers__eyebrow'>{product.eyebrow}</p>
            <h2 className='best-sellers__title'>{product.title}</h2>
            <p className='best-sellers__quote'>{product.quote}</p>

            <ul className='best-sellers__bullets'>
              {product.bullets.map((b) => (
                <li key={b} className='best-sellers__bullet'>
                  <span className='best-sellers__dot' aria-hidden='true' />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className='best-sellers__cta-row'>
              <div className='best-sellers__price'>{product.price}</div>
              <button
                className='best-sellers__cta'
                onClick={() => {
                  navigate("/products");
                }}>
                {t("home.bestSeller.addToCart", { defaultValue: "Thêm vào giỏ hàng" })}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BestSellersSection;

