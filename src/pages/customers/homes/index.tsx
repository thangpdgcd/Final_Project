import React from "react";
import { Layout, Button, Card, Carousel, Form, Input } from "antd";
import { useNavigate } from "react-router-dom";
import {
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";

import bannerImage from "../../../assets/img/backgroud_PhanCoffee.png";
import bannerrobusta from "../../../assets/img/robustaphancoffee.png";
import bannerarabica from "../../../assets/img/arabicaphancofffee.png";
import bannerhoney from "../../../assets/img/caphehoneyphancoffee.png";
import aboutImage from "../../../assets/img/robustakontum.jpg";

import "./index.scss";
import BannerCarousel from "../../service";
import FooterPage from "../../footer";
import HeaderPage from "../../header";

const { Content } = Layout;
const { Meta } = Card;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [contactForm] = Form.useForm();

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
            <p>From the Central Highlands to your cup.</p>
          </div>
        </section>

        {/* BEST SELLERS */}
        <section className='homepage__services'>
          <h2 className='section-title'>Best Sellers</h2>
          <p className='section-subtitle'>
            Signature coffees carefully roasted by Phan Coffee.
          </p>

          <div className='homepage__services-grid'>
            {[1, 2, 3].map((item) => (
              <Card
                key={item}
                hoverable
                className='product-card'
                cover={
                  <Carousel autoplay>
                    <img
                      className='img-banner'
                      alt='robusta'
                      src={bannerrobusta}
                    />
                    <img
                      className='img-banner'
                      alt='arabica'
                      src={bannerarabica}
                    />
                    <img className='img-banner' alt='honey' src={bannerhoney} />
                  </Carousel>
                }>
                <Meta
                  title='MANG DEN BLEND'
                  description='A balanced blend from the Central Highlands.'
                />
                <div className='product-card__footer'>
                  <span className='product-card__price'>₫180,000</span>
                  <Button
                    type='primary'
                    size='small'
                    onClick={() => navigate("/products")}>
                    Add to cart
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* ABOUT */}
        <section className='about-us'>
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
        <section className='homepage__contact-section' id='contact'>
          <div className='homepage__contact-container'>
            {/* FORM CARD */}
            <div className='contact-card contact-card--form'>
              <div className='contact-form-inner'>
                <h3 className='contact-title'>Contact Phan Coffee</h3>
                <p className='contact-subtitle'>
                  Leave your information and we will get back to you as soon as
                  possible.
                </p>

                <Form
                  id='contact-form'
                  layout='vertical'
                  form={contactForm}
                  className='contact-form'
                  onFinish={handleContactSubmit}>
                  <Form.Item
                    label='Name'
                    name='name'
                    rules={[
                      { required: true, message: "Please enter your name" },
                    ]}>
                    <Input placeholder='Enter your name' />
                  </Form.Item>

                  <Form.Item
                    label='Email'
                    name='email'
                    rules={[
                      { required: true, message: "Please enter your email" },
                      { type: "email", message: "Invalid email address" },
                    ]}>
                    <Input
                      prefix={<MailOutlined />}
                      placeholder='you@example.com'
                    />
                  </Form.Item>

                  <Form.Item label='Phone Number' name='phone'>
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder='(+84) 123 456 789'
                    />
                  </Form.Item>

                  <Form.Item label='Message' name='message'>
                    <Input.TextArea placeholder='Your message...' rows={4} />
                  </Form.Item>
                </Form>

                <div className='contact-actions'>
                  <Button
                    type='primary'
                    htmlType='submit'
                    form='contact-form'
                    className='contact-btn contact-btn--primary'>
                    Send
                  </Button>

                  <a
                    className='contact-btn contact-btn--outline'
                    href='https://maps.app.goo.gl/GTY4E8aFStkpMK81A'
                    target='_blank'
                    rel='noopener noreferrer'>
                    Get directions
                  </a>
                </div>
              </div>
            </div>

            {/* MAP CARD */}
            <div className='contact-card contact-card--map'>
              <h3 className='contact-map-title'>Phan Coffee Roasters</h3>

              <div className='contact-map-address'>
                <EnvironmentOutlined />
                <span>86 Lam Tung, Ia Chim, Kon Tum City, Kon Tum</span>
              </div>

              <div className='contact-map-wrapper'>
                <iframe
                  title='Phan Coffee Roasters Map'
                  src='https://www.google.com/maps?q=86%20L%C3%A2m%20T%C3%B9ng%2C%20Ia%20Chim%2C%20Kon%20Tum&output=embed'
                  loading='lazy'
                />
              </div>

              <p className='contact-map-note'>
                Open Google Maps to view detailed directions, travel time, and
                suggested routes.
              </p>
            </div>
          </div>
        </section>
      </Content>

      <FooterPage />
    </Layout>
  );
};

export default HomePage;
