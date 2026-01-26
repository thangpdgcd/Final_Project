import React from "react";
import { Layout, Button, Card } from "antd";

import bannerImage from "../../../assets/img/backgroud_PhanCoffee.png";
import aboutImage from "../../../assets/img/robustakontum.jpg";

import "./index.scss";
import Chatbox from "../../../components/chatbox";
import HeaderPage from "../../../components/header";
import FooterPage from "../../../components/footer";

const { Content } = Layout;

const About: React.FC = () => {

  const processingMethods = [
    {
      title: "Natural Process",
      image: "https://res.cloudinary.com/dfjecxrnl/image/upload/v1769110199/ChatGPT_Image_02_27_53_23_thg_1_2026_gj9nxi.png",
      description:
        "Phương pháp khô tự nhiên, giữ nguyên trái chín trên giàn phơi để tạo nên hương vị trái cây phong phú và hậu vị ngọt đậm.",
      tags: ["FRUITY", "HEAVY BODY", "WINEY"],
    },
    {
      title: "Washed Process",
      image: "https://res.cloudinary.com/dfjecxrnl/image/upload/v1769110199/ChatGPT_Image_02_27_53_23_thg_1_2026_gj9nxi.png",
      description:
        "Loại bỏ hoàn toàn lớp vỏ và thịt quả trước khi phơi, tạo ra độ sáng đặc trưng, hương vị thanh sạch và tinh tế.",
      tags: ["CLEAN", "BRIGHT ACID", "FLORAL"],
    },
    {
      title: "Honey Process",
      image: "https://res.cloudinary.com/dfjecxrnl/image/upload/v1769110199/ChatGPT_Image_02_27_53_23_thg_1_2026_gj9nxi.png",
      description:
        "Sự kết hợp hoàn hảo khi giữ lại một phần lớp nhầy (mucilage) trong khi phơi, mang đến sự cân bằng giữa vị ngọt mật ong và độ chua thanh.",
      tags: ["BALANCED", "SWEETNESS", "SMOOTH"],
    },
  ];

  return (
    <Layout className='about-page'>
      <HeaderPage />

      <Content className='about-page__content'>
        {/* ===== HERO BANNER ===== */}
        <section
          className='about-hero'
          style={{ backgroundImage: `url(${bannerImage})` }}>
          <div className='about-hero__overlay' />
          <div className='about-hero__content'>
            <span className='about-hero__tagline'>EXPERIMENTAL VIETNAMESE COFFEE</span>
            <h1 className='about-hero__title'>About Phan Coffee</h1>
            <p className='about-hero__subtitle'>
              We source beans from the Central Highlands and roast in small
              batches to keep flavors vibrant and clean.
            </p>
            <div className='about-hero__platforms'>
              <span className='about-hero__platforms-label'>We are available on</span>
              <div className='about-hero__platforms-logos'>
                <a
                  href='https://shopee.vn'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='platform-logo platform-logo--shopee'>
                  <span>Shopee</span>
                </a>
                <a
                  href='https://lazada.vn'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='platform-logo platform-logo--lazada'>
                  <span>Lazada</span>
                </a>
                <a
                  href='https://tiktok.com/shop'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='platform-logo platform-logo--tiktok'>
                  <span>TikTok Shop</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ===== ABOUT US SECTION ===== */}
        <section className='about-us'>
          <div className='about-container'>
            {/* Left text */}
            <div className='about-text'>
              <h2>About Phan Coffee</h2>
              <p>
                When you hold a cup of coffee from Phan Coffee, you not only
                receive a product - but also the passion that we have put into
                it. Thank you to our companions, those who have shared. Please
                share and give us your real reviews. Each review is a member who
                builds trust, is the motivation for us to continue to develop.
                Have a nice day ❤️
              </p>
              <p className='about-location'>
                ☕ PHAN COFFEE ROASTERS 📍 86 Lâm Tùng, xã Ia Chim, Kon Tum
              </p>
              <Button type='primary' size='large' className='read-more'>
                Read More
              </Button>
            </div>

            {/* Right image */}
            <div className='about-image'>
              <img src={aboutImage} alt='About Coffee' />
            </div>
          </div>
        </section>

        {/* ===== PROCESSING METHODS SECTION ===== */}
        <section className='processing-methods'>
          <div className='processing-methods__header'>
            <h2 className='processing-methods__title'>Quy Trình Chế Biến</h2>
            <p className='processing-methods__subtitle'>
              Tại Phan Coffee, chúng tôi không ngừng thử nghiệm các phương pháp
              sơ chế để khai phá những tầng hương vị mới từ hạt Robusta Kon Tum.
            </p>
          </div>

          <div className='processing-methods__grid'>
            {processingMethods.map((method, index) => (
              <Card
                key={index}
                className='process-card'
                cover={
                  <div className='process-card__image-wrapper'>
                    <img
                      src={method.image}
                      alt={method.title}
                      className='process-card__image'
                    />
                    <div className='process-card__title-overlay'>
                      {method.title}
                    </div>
                  </div>
                }>
                <div className='process-card__content'>
                  <p className='process-card__description'>{method.description}</p>
                  <div className='process-card__tags'>
                    {method.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className='process-tag'>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </Content>

      <FooterPage />
      <Chatbox />
    </Layout >
  );
};

export default About;
