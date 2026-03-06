import React from "react";
import { Layout } from "antd";
import { useTranslation } from "react-i18next";

import mainAboutImage from "../../../assets/img/rangxay.jpg";
import secondaryAboutImage from "../../../assets/img/coffee_arabica_vn.png";

import "./index.scss";
import Chatbox from "../../../components/chatbox";
import HeaderPage from "../../../components/header";
import FooterPage from "../../../components/footer";

const { Content } = Layout;

const About: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Layout className='about-page'>
      <HeaderPage />

      <Content className='about-page__content'>
        <section className='about-section'>
          <h2 className='about-section__label'>{t("about.sectionLabel")}</h2>

          <div className='about-section__body'>
            <div className='about-section__images'>
              <div className='about-section__image about-section__image--main'>
                <img src={mainAboutImage} alt={t("about.images.mainAlt")} />
              </div>

              <div className='about-section__image about-section__image--secondary'>
                <img src={secondaryAboutImage} alt={t("about.images.secondaryAlt")} />
              </div>
            </div>

            <div className='about-section__content'>
              <h3 className='about-section__title'>{t("about.heroTitle")}</h3>
              <p className='about-section__description'>
                {t("about.heroDescription")}
              </p>
              <ul className='about-section__list'>
                <li>{t("about.products.natural")}</li>
                <li>{t("about.products.honey")}</li>
                <li>{t("about.products.wash")}</li>
              </ul>
            </div>
          </div>
        </section>

        <section className='processing-methods'>
          <div className='processing-methods__header'>
            <h2 className='processing-methods__title'>
              {t("about.process.title")}
            </h2>
            <h3 className='processing-methods__heading'>
              {t("about.process.heading")}
            </h3>
          </div>

          <div className='processing-methods__grid'>
            <article className='processing-methods__card'>
              <div className='processing-methods__image-wrapper'>
                <img
                  src={mainAboutImage}
                  alt={t("about.images.processNaturalAlt")}
                />
              </div>
              <h4 className='processing-methods__title'>
                {t("about.cards.natural.title")}
              </h4>
              <p className='processing-methods__description'>
                {t("about.cards.natural.description")}
              </p>
            </article>

            <article className='processing-methods__card'>
              <div className='processing-methods__image-wrapper'>
                <img src={secondaryAboutImage} alt={t("about.images.freshAlt")} />
              </div>
              <h4 className='processing-methods__title'>
                {t("about.cards.fresh.title")}
              </h4>
              <p className='processing-methods__description'>
                {t("about.cards.fresh.description")}
              </p>
            </article>

            <article className='processing-methods__card'>
              <div className='processing-methods__image-wrapper'>
                <img src={mainAboutImage} alt={t("about.images.qualityAlt")} />
              </div>
              <h4 className='processing-methods__title'>
                {t("about.cards.quality.title")}
              </h4>
              <p className='processing-methods__description'>
                {t("about.cards.quality.description")}
              </p>
            </article>
          </div>
        </section>
      </Content>

      <FooterPage />
      <Chatbox />
    </Layout>
  );
};

export default About;
