import React from "react";
import { useTranslation } from "react-i18next";

import "./index.scss";

/** Cloudinary: higher-res face crop + brighten slightly so the face reads clearly in the small circle. */
const FOUNDER_AVATAR_URL =
  "https://res.cloudinary.com/dfjecxrnl/image/upload/f_auto,q_auto:good,w_480,h_480,c_fill,g_face,e_improve,e_brightness:14,e_contrast:10/v1776360467/phan_coffee_avatars/ae5hmir5v35pbyhczse7.png";

const HandsToHeartSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className='hands-to-heart'>
      <div className='hands-to-heart__container'>
        <div className='hands-to-heart__grid'>
          <div className='hands-to-heart__content'>
            <h2 className='hands-to-heart__title'>
              {t("home.handsToHeart.titleLine1")} <br />
              {t("home.handsToHeart.titleLine2")}
            </h2>
            <p className='hands-to-heart__desc'>
              {t("home.handsToHeart.desc")}
            </p>

            <div className='hands-to-heart__author'>
              <div className='hands-to-heart__avatar'>
                <img
                  src={FOUNDER_AVATAR_URL}
                  alt={t("home.handsToHeart.founderName")}
                  loading='lazy'
                  className='hands-to-heart__avatar-img'
                />
              </div>
              <div>
                <div className='hands-to-heart__author-name'>{t("home.handsToHeart.founderName")}</div>
                <div className='hands-to-heart__author-role'>{t("home.handsToHeart.founderRole")}</div>
              </div>
            </div>
          </div>

          <div className='hands-to-heart__media'>
            <div className='hands-to-heart__media-grid'>
              <img
                className='hands-to-heart__img'
                src='https://res.cloudinary.com/dfjecxrnl/image/upload/v1776575273/6e373738-460c-4bbe-ba25-ca986067cad3.png'
                alt={t("home.handsToHeart.mediaAlt.farmer")}
                loading='lazy'
              />
              <img
                className='hands-to-heart__img hands-to-heart__img--offset'
                src='https://res.cloudinary.com/dfjecxrnl/image/upload/v1776575323/fb03f37a-d52b-4b2d-83dc-6de01696c4d3.png'
                alt={t("home.handsToHeart.mediaAlt.barista")}
                loading='lazy'
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HandsToHeartSection;

