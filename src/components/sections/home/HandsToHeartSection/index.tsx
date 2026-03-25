import React from "react";
import { useTranslation } from "react-i18next";

import "./index.scss";

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
                  src='https://lh3.googleusercontent.com/aida-public/AB6AXuA3MupKIqTTWAPjfdldGoehjaGn3u27jynXRXN8R2a3jft2VYh8oasazVr2mI8bpnILi6a3zzQ5ZOz4l1TMSAU11zoyzhIGKIYzpxcvmpOmfxVk9ySLDxa1_aqc2EA0uYEzg4vASQtgEXUPzVEAb9mJQ9nPSxA5AJc6LxEFvILgD4FdXBDevzEogOEYIHuibC7QnZDrT1UV2jyTMAW0gq4OojmHBv9xa00x0VHUHX4oTbOH1aiN-vy4XsQfsFn-5NojBHxpNQwKbswk'
                  alt={t("home.handsToHeart.founderName")}
                  loading='lazy'
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
                src='https://lh3.googleusercontent.com/aida-public/AB6AXuBfuiN4sR7jVKAhcZPdlh7vJ3DCPxqyTpo3R9ViQIWMR61kleC7lxbi2sXETZYn9x_9pnLCIB1EHJhLuUgk1oTZglNYSyENoe0Ir14MCAadRAHY-44AlSCBcMXH_lVWgRi3A8EuTsA_mYqohJqJmZ-4aevdr5F4kCUsI-LWbmdRX8ed055d_AF3kibr9n4UkR7EaEArbVWU0Yg-QhzuUkRF4dZ5oidetIJZpuMuldyHkis2-msPeoZ7Z96a9om43HNnwg5QJFrJljVz'
                alt={t("home.handsToHeart.mediaAlt.farmer")}
                loading='lazy'
              />
              <img
                className='hands-to-heart__img hands-to-heart__img--offset'
                src='https://lh3.googleusercontent.com/aida-public/AB6AXuA-iZm2Kl7q0CKr1tZaz4Y0-rAHrLqdlRkNw1KNXDXaL6dwIcrm5775_Ujy1RdDn5HUP3R4J7C-IRgb4lc-vYwiGkXQBS9hscZuHiTx2xBjLBFFIH0DDl_ztlPcsAPccgo8BRfOFSDrYhTcTc4M7LkmwviHpv9dRD5IRKgfu4S6lxYdzdtoKKoAErfz0AIHsBrz-JZrMAXYtLm_kqxY_g0KX_ynUKfhuO3lvfpeGwKzqg5k5qudMrOZ4_MTVhD-yEq90rqO9gFUnkug'
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

