import React from "react";
import { Layout, Button, Card, Carousel, Form, Input } from "antd";
import { useNavigate } from "react-router-dom";

import Contact from "../contact";
import bannerImage from "../../../assets/img/backgroud_PhanCoffee.png";

import aboutImage from "../../../assets/img/robustakontum.jpg";

import "./index.scss";
import BannerCarousel from "../service";
import FooterPage from "../../../components/footer";
import HeaderPage from "../../../components/header";
import ContentBanner from "../content_banner";
import Chatbox from "../../../components/chatbox";

const { Content } = Layout;

const HomePage: React.FC = () => {
  const navigate = useNavigate();

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

  const handleContactSubmit = (values: any) => {
    console.log("Contact form:", values);
  };

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
            <h4>ROASTED IN KONTUM</h4>
            <p>86 Lam Tung, Ia Chim, Kon Tum City, Kon Tum</p>
          </div>
          <div className='intro-item'>
            <h4>EXPERIMENTAL ROASTS</h4>
            <p>Single-origin, honey & natural processed coffees.</p>
          </div>
          <div className='intro-item'>
            <h4>WORLDWIDE SHIPPING</h4>
            <p>From the Phan Coffee to your doorstep.</p>
          </div>
        </section>

        {/* BEST SELLERS */}

        <ContentBanner />

        {/* ABOUT */}
        <section 
          className='about-us'
          style={{ backgroundImage: `url(${bannerImage})` }}>
          <div className='about-container'>
            <div className='about-text'>
              <h2>About Phan Coffee</h2>
              <p>
                We source beans from the Central Highlands and roast in small
                batches to keep flavors vibrant and clean.
              </p>
              <Button onClick={() => navigate("/about")}>Read more</Button>
            </div>
            <div className='about-image'>
              <img src={aboutImage} alt='About Phan Coffee' />
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

        {/* ✅ CONTACT (đã bọc container + 2 card) */}
        <Contact />
      </Content>

      <FooterPage />
      <Chatbox />
    </Layout>
  );
};

export default HomePage;
