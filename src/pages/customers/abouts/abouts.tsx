import React from "react";
import { Layout } from "antd";
import { useTranslation } from "react-i18next";

import Chatbox from "../../../components/chatbox";
import HeaderPage from "../../../components/layout/Header";
import FooterPage from "../../../components/layout/Footer";

const { Content } = Layout;

const About: React.FC = () => {
  const { t } = useTranslation();
  const mainAboutImage = "/assets/img/rangxay.jpg";
  const secondaryAboutImage = "/assets/img/coffee_arabica_vn.png";

  return (
    <Layout className="min-h-screen bg-white">
      <HeaderPage />

      <Content className="bg-white pb-[60px] pt-[100px] max-md:py-10">
        <section className="mx-auto flex max-w-[1100px] flex-col gap-12 px-10 max-md:gap-8 max-md:px-6 max-sm:px-5">
          <h2
            className="text-center text-[28px] tracking-widest text-[#1d5b4c] max-sm:text-2xl"
            style={{ fontFamily: "var(--font-display), Georgia, serif" }}
          >
            {t("about.sectionLabel")}
          </h2>

          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-[1.1fr_1fr] max-md:gap-8">
            <div className="relative flex flex-col gap-5">
              <div className="overflow-hidden rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-transform [&_img]:block [&_img]:h-full [&_img]:w-full [&_img]:object-cover hover:[&_img]:scale-[1.02]">
                <img src={mainAboutImage} alt={t("about.images.mainAlt")} />
              </div>

              <div className="max-w-[65%] self-end overflow-hidden rounded-xl shadow-[0_12px_35px_rgba(0,0,0,0.12)] transition-transform max-md:max-w-[70%] max-sm:max-w-[80%] [&_img]:block [&_img]:h-full [&_img]:w-full [&_img]:object-cover hover:[&_img]:scale-[1.02]">
                <img
                  src={secondaryAboutImage}
                  alt={t("about.images.secondaryAlt")}
                />
              </div>
            </div>

            <div className="text-neutral-700">
              <h3 className="mb-4 text-[26px] font-bold text-neutral-800 max-sm:text-[22px]">
                {t("about.heroTitle")}
              </h3>
              <p className="mb-4 text-[15px] leading-relaxed text-neutral-600 max-sm:text-sm">
                {t("about.heroDescription")}
              </p>
              <ul className="m-0 list-none space-y-0 p-0 text-[15px] leading-loose text-neutral-600 max-sm:text-sm">
                <li className="relative pl-4 before:absolute before:left-0 before:text-[#1d5b4c] before:content-['•']">
                  {t("about.products.natural")}
                </li>
                <li className="relative pl-4 before:absolute before:left-0 before:text-[#1d5b4c] before:content-['•']">
                  {t("about.products.honey")}
                </li>
                <li className="relative pl-4 before:absolute before:left-0 before:text-[#1d5b4c] before:content-['•']">
                  {t("about.products.wash")}
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="relative mt-0 overflow-hidden bg-[var(--bg-surface-2)] px-10 py-[60px] before:pointer-events-none before:absolute before:inset-0 before:z-0 before:bg-[radial-gradient(circle_at_25%_25%,rgba(139,90,43,0.03)_2px,transparent_2px),radial-gradient(circle_at_75%_75%,rgba(163,49,15,0.03)_2px,transparent_2px)] before:bg-[length:60px_60px] before:bg-[position:0_0,30px_30px] before:opacity-50 max-md:px-6 max-sm:px-5">
          <div className="relative z-[1] mx-auto mb-10 max-w-[750px] text-left">
            <h2 className="mb-3 text-4xl font-bold tracking-tight text-[var(--text-main)]">
              {t("about.process.title")}
            </h2>
            <h3
              className="mb-8 text-3xl text-neutral-800 max-md:mb-8 max-sm:text-[26px]"
              style={{ fontFamily: "var(--font-display), Georgia, serif" }}
            >
              {t("about.process.heading")}
            </h3>
          </div>

          <div className="relative z-[1] mx-auto grid max-w-[1100px] grid-cols-1 gap-8 md:grid-cols-3">
            <article className="flex flex-col text-neutral-800">
              <div className="mb-4 overflow-hidden rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.12)] transition-transform group-hover:[&_img]:scale-[1.03]">
                <img
                  src={mainAboutImage}
                  alt={t("about.images.processNaturalAlt")}
                  className="block h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                />
              </div>
              <h4 className="mb-2.5 text-[22px] font-bold">
                {t("about.cards.natural.title")}
              </h4>
              <p className="text-[15px] leading-relaxed text-neutral-600">
                {t("about.cards.natural.description")}
              </p>
            </article>

            <article className="flex flex-col text-neutral-800">
              <div className="mb-4 overflow-hidden rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.12)]">
                <img
                  src={secondaryAboutImage}
                  alt={t("about.images.freshAlt")}
                  className="block h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                />
              </div>
              <h4 className="mb-2.5 text-[22px] font-bold">
                {t("about.cards.fresh.title")}
              </h4>
              <p className="text-[15px] leading-relaxed text-neutral-600">
                {t("about.cards.fresh.description")}
              </p>
            </article>

            <article className="flex flex-col text-neutral-800 md:max-lg:col-span-3">
              <div className="mb-4 overflow-hidden rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.12)]">
                <img
                  src={mainAboutImage}
                  alt={t("about.images.qualityAlt")}
                  className="block h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                />
              </div>
              <h4 className="mb-2.5 text-[22px] font-bold">
                {t("about.cards.quality.title")}
              </h4>
              <p className="text-[15px] leading-relaxed text-neutral-600">
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
