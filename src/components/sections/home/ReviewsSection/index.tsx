import React from "react";
import { useTranslation } from "react-i18next";

import "./index.scss";

const LeafIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width='16'
    height='16'
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    aria-hidden='true'
    focusable='false'
  >
    <path
      d='M20.8 3.2c-6.2 1-11 4.5-13.3 9.7C6 16.4 6.9 20 6.9 20s3.6.9 7.1-.6c5.2-2.3 8.7-7.1 9.7-13.3.1-.7-.5-1.3-1.2-1.2Z'
      fill='#2E7D32'
      opacity='0.18'
    />
    <path
      d='M20.8 3.2c-6.2 1-11 4.5-13.3 9.7C6 16.4 6.9 20 6.9 20s3.6.9 7.1-.6c5.2-2.3 8.7-7.1 9.7-13.3.1-.7-.5-1.3-1.2-1.2Z'
      stroke='#2E7D32'
      strokeWidth='1.6'
      strokeLinejoin='round'
    />
    <path
      d='M7.6 18.4c2.1-3.8 6.5-8.1 12-11.3'
      stroke='#2E7D32'
      strokeWidth='1.6'
      strokeLinecap='round'
    />
  </svg>
);

const ReviewsSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className='customer-reviews'>
      <div className='customer-reviews__container'>
        <div className='customer-reviews__header'>
          <div className='customer-reviews__eyebrow'>
            {t("home.reviewsEyebrow", { defaultValue: "ĐÁNH GIÁ KHÁCH HÀNG" })}
          </div>
          <h2 className='customer-reviews__title'>
            {t("home.reviewsTitle", {
              defaultValue: "Người yêu cà phê nói gì?",
            })}
          </h2>
          <p className='customer-reviews__subtitle'>
            {t("home.reviewsSubtitle", {
              defaultValue:
                "Những chia sẻ chân thành từ khách hàng đã và đang đồng hành cùng Phan Coffee.",
            })}
          </p>
        </div>

        <div className='customer-reviews__grid'>
          <article className='customer-reviews__item'>
            <div className='customer-reviews__stars'>☆☆☆☆☆</div>
            <p className='customer-reviews__content'>
              {t("home.reviews1Content")}
            </p>
            <div className='customer-reviews__profile'>
              <div className='customer-reviews__badge'>
                <LeafIcon className='customer-reviews__badge-icon' />
                <div className='customer-reviews__badge-name'>
                  {t("home.reviews1ShortName", { defaultValue: "Trần" })}
                </div>
              </div>
              <div>
                <div className='customer-reviews__author'>
                  {t("home.reviews1Author", {
                    defaultValue: "Trần Hoàng Long",
                  })}
                </div>
                <div className='customer-reviews__role'>
                  {t("home.reviews1Role", {
                    defaultValue: "BARISTA PROFESSIONAL",
                  })}
                </div>
              </div>
            </div>
          </article>

          <article className='customer-reviews__item'>
            <div className='customer-reviews__stars'>☆☆☆☆☆</div>
            <p className='customer-reviews__content'>{t("home.reviews2Content")}</p>
            <div className='customer-reviews__profile'>
              <div className='customer-reviews__badge'>
                <LeafIcon className='customer-reviews__badge-icon' />
                <div className='customer-reviews__badge-name'>
                  {t("home.reviews2ShortName", { defaultValue: "Nguyễn" })}
                </div>
              </div>
              <div>
                <div className='customer-reviews__author'>{t("home.reviews2Author")}</div>
                <div className='customer-reviews__role'>
                  {t("home.reviews2Role", { defaultValue: "COFFEE LOVER" })}
                </div>
              </div>
            </div>
          </article>

          <article className='customer-reviews__item'>
            <div className='customer-reviews__stars'>☆☆☆☆☆</div>
            <p className='customer-reviews__content'>{t("home.reviews3Content")}</p>
            <div className='customer-reviews__profile'>
              <div className='customer-reviews__badge'>
                <LeafIcon className='customer-reviews__badge-icon' />
                <div className='customer-reviews__badge-name'>
                  {t("home.reviews3ShortName", { defaultValue: "Phạm" })}
                </div>
              </div>
              <div>
                <div className='customer-reviews__author'>{t("home.reviews3Author")}</div>
                <div className='customer-reviews__role'>
                  {t("home.reviews3Role", { defaultValue: "CHỦ QUÁN CAFE" })}
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;

