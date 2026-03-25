import React from "react";
import { useTranslation } from "react-i18next";

import "./index.scss";

const RoastingProcessSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className='roasting-process'>
      <div className='roasting-process__inner'>
        <div>
          <div className='roasting-process__eyebrow'>{t("home.roastingProcess.eyebrow")}</div>
          <h2 className='roasting-process__title'>{t("home.roastingProcess.title")}</h2>
          <p className='roasting-process__description'>
            {t("home.roastingProcess.description")}
          </p>

          <div className='roasting-process__highlights'>
            <div className='roasting-process__item'>
              <div className='roasting-process__icon' aria-hidden='true'>
                <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M12 21s-7-4.35-7-10.2C5 7.7 7.55 5 12 5s7 2.7 7 5.8C19 16.65 12 21 12 21Z'
                    stroke='currentColor'
                    strokeWidth='1.8'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M9.25 11.7c1.05-1.2 2.6-2.05 4.75-2.35'
                    stroke='currentColor'
                    strokeWidth='1.8'
                    strokeLinecap='round'
                  />
                </svg>
              </div>
              <div>
                <div className='roasting-process__item-title'>{t("home.roastingProcess.items.manualSelect.title")}</div>
                <div className='roasting-process__item-desc'>
                  {t("home.roastingProcess.items.manualSelect.desc")}
                </div>
              </div>
            </div>

            <div className='roasting-process__item'>
              <div className='roasting-process__icon' aria-hidden='true'>
                <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M12 2.5c2.9 2.7 4.5 5.2 4.5 7.6 0 2.9-2 5.2-4.5 5.2s-4.5-2.3-4.5-5.2c0-2.4 1.6-4.9 4.5-7.6Z'
                    stroke='currentColor'
                    strokeWidth='1.8'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M5 21h14'
                    stroke='currentColor'
                    strokeWidth='1.8'
                    strokeLinecap='round'
                  />
                  <path
                    d='M8.5 18.2c1.1.8 2.4 1.3 3.5 1.3s2.4-.5 3.5-1.3'
                    stroke='currentColor'
                    strokeWidth='1.8'
                    strokeLinecap='round'
                  />
                </svg>
              </div>
              <div>
                <div className='roasting-process__item-title'>{t("home.roastingProcess.items.pureRoast.title")}</div>
                <div className='roasting-process__item-desc'>
                  {t("home.roastingProcess.items.pureRoast.desc")}
                </div>
              </div>
            </div>

            <div className='roasting-process__item'>
              <div className='roasting-process__icon' aria-hidden='true'>
                <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M7 7.5h10v12H7v-12Z'
                    stroke='currentColor'
                    strokeWidth='1.8'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M9 7.5V5.8C9 4.25 10.35 3 12 3s3 1.25 3 2.8v1.7'
                    stroke='currentColor'
                    strokeWidth='1.8'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M9.5 12h5'
                    stroke='currentColor'
                    strokeWidth='1.8'
                    strokeLinecap='round'
                  />
                  <path
                    d='M9.5 15h5'
                    stroke='currentColor'
                    strokeWidth='1.8'
                    strokeLinecap='round'
                  />
                </svg>
              </div>
              <div>
                <div className='roasting-process__item-title'>{t("home.roastingProcess.items.scaPack.title")}</div>
                <div className='roasting-process__item-desc'>
                  {t("home.roastingProcess.items.scaPack.desc")}
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className='roasting-process__media'>
          <img
            className='roasting-process__image'
            src='https://res.cloudinary.com/dfjecxrnl/image/upload/v1773308043/a_close_up_high_quality_photograph_of_a_person_s_hands_holding_a_handful_of_roasted_coffee_beans_over_a_large_bowl_of_coffee_beans._the_person_is_wearing_a_teal_colored_button_up_shirt._the_lighting_is_warm_and_art_apfefk.png'
            alt={t("home.roastingProcess.imageAlt")}
            loading='lazy'
          />
          <div className='roasting-process__badge'>
            <div className='roasting-process__badge-number'>12+</div>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default RoastingProcessSection;

