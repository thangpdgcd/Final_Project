import React from "react";
import { Layout, Button, Card } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Contact from "../../customers/contact";
import aboutImage from "../../../assets/img/robustakontum.jpg";

import "./index.scss";
import BannerCarousel from "../banner";
import FooterPage from "../../../components/footer";
import HeaderPage from "../../../components/header";
import ContentBanner from "../content_banner";
import Chatbox from "../../../components/chatbox";

const bannerImage =
  "https://res.cloudinary.com/dfjecxrnl/image/upload/v1772095630/vn-11134210-7ras8-mdenqmstth3970_resize_ss700x700sssss_bett8q.jpg";

const { Content } = Layout;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const galleryImages: string[] = [
    "https://res.cloudinary.com/dfjecxrnl/image/upload/v1768211093/518290335_780416141172650_7724989381247019356_n_danpue.jpg",
    "https://res.cloudinary.com/dfjecxrnl/image/upload/v1768823885/485279782_695975656283366_2260645432310935248_n_sncinx.jpg",
    "https://res.cloudinary.com/dfjecxrnl/image/upload/v1768823885/492005643_716963337517931_4130308983468400647_n_sc00pf.jpg",
    "https://res.cloudinary.com/dfjecxrnl/image/upload/v1768823885/480786471_676403564907242_3718868989640179000_n_ywtgkd.jpg",
    "https://res.cloudinary.com/dfjecxrnl/image/upload/v1768823884/481510994_683018360912429_2259457484289900981_n_n8utep.jpg",
    "https://res.cloudinary.com/dfjecxrnl/image/upload/v1768823884/475490261_621535617038442_2719110238239506408_n_yxhoz3.jpg",
    "https://res.cloudinary.com/dfjecxrnl/image/upload/v1768823884/475772186_621550380370299_5871532636348375883_n_opdeof.jpg",
    "https://res.cloudinary.com/dfjecxrnl/image/upload/v1768823883/485144388_696963506184581_8177906150215252834_n_d8ejaz.jpg",
  ];


  return (
    <Layout className='homepage'>
      <HeaderPage />

      <Content className='homepage__content'>
        {/* HERO */}
        <section
          className='hero-banner'
          style={{ backgroundImage: `url(${bannerImage})` }}>
          <div className='hero-banner__overlay' />
        </section>

        {/* INTRO STRIP */}
        <section className='homepage__intro-strip'>
          <div className='intro-item'>
            <h4>{t("home.introRoastedTitle")}</h4>
            <p>{t("home.introRoastedSubtitle")}</p>
          </div>
          <div className='intro-item'>
            <h4>{t("home.introExperimentalTitle")}</h4>
            <p>{t("home.introExperimentalSubtitle")}</p>
          </div>
          <div className='intro-item'>
            <h4>{t("home.introShippingTitle")}</h4>
            <p>{t("home.introShippingSubtitle")}</p>
          </div>
        </section>

        {/* BEST SELLERS */}

        <ContentBanner />

        {/* ABOUT */}
        <section
          className='about-us'
        >
          <div className='about-container'>
            <div className='about-text'>
              <h2>{t("home.aboutTitle")}</h2>
              <p>{t("home.aboutDescription")}</p>
              <Button onClick={() => navigate("/about")}>
                {t("home.aboutReadMore")}
              </Button>
            </div>
            <div className='about-image'>
              <Link
                to='/about'
                aria-label={t("home.aboutMoreAria")}
              >
                <img src={aboutImage} alt='About Phan Coffee' />
              </Link>
            </div>
          </div>
        </section>

        {/* GALLERY */}
        <section className='gallery-section'>
          <div className='gallery-grid'>
            {galleryImages.map((img, idx) => (
              <Card
                key={idx}
                className='gallery-card'
                cover={<img alt={`g-${idx}`} src={img} />}
              />
            ))}
          </div>
        </section>

        <BannerCarousel />

        {/* CONTACT SECTION (không lấy header/footer) */}
        {/* using embedded to not show footer */}
        <Contact embedded />
      </Content>

      <FooterPage />
      <Chatbox />
    </Layout>
  );
};

export default HomePage;
