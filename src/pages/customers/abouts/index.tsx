import React from "react";
import { Layout, Menu, Button } from "antd";
import { useNavigate } from "react-router-dom";

import logo from "../../../assets/img/logo_PhanCoffee.jpg";
import bannerImage from "../../../assets/img/backgroud_PhanCoffee.png";
import aboutImage from "../../../assets/img/robustakontum.jpg";

import "./index.scss";

const { Header, Content, Footer } = Layout;

const About: React.FC = () => {
  const navigate = useNavigate();

  const menuRoutes: Record<string, string> = {
    home: "/",
    products: "/products",
    about: "/about",
    contact: "/contact",
    login: "/login",
  };

  const handleMenuClick = (e: { key: string }) => {
    const path = menuRoutes[e.key];
    if (path) navigate(path);
  };

  return (
    <Layout className='homepage'>
      {/* ===== HEADER ===== */}
      <Header className='homepage__header'>
        <div className='homepage__logo' onClick={() => navigate("/")}>
          <img src={logo} alt='Phan Coffee' />
          <span className='logo-phancoffee'>Phan Coffee</span>
        </div>

        <Menu
          mode='horizontal'
          onClick={handleMenuClick}
          overflowedIndicator={false}
          items={[
            { key: "home", label: "Home" },
            { key: "products", label: "Coffee" },
            { key: "contact", label: "Contact" },
            { key: "about", label: "About" },
            { key: "login", label: "Sign In" },
          ]}
        />
      </Header>

      {/* ===== CONTENT ===== */}
      <Content className='homepage__content'>
        {/* Banner */}
        <div
          className='homepage__hero'
          style={{ backgroundImage: `url(${bannerImage})` }}></div>

        {/* ===== ABOUT US SECTION ===== */}
        <section className='about-us'>
          <div className='about-container'>
            {/* Left text */}
            <div className='about-text'>
              <h2>ABOUT US</h2>
              <p>
                When you hold a cup of coffee from Phan Coffee, you not only
                receive a product - but also the passion that we have put into
                it. Thank you to our companions, those who have shared Please
                share and give us your real reviews. Each review is a member who
                builds trust, is the motivation for us to continue to develop.
                Have a nice day ❤️
              </p>
              <p>☕ PHAN COFFEE ROASTERS 📍 86 Lâm Tùng, xã Iachim, Kon Tum</p>
              <Button type='default' size='large' className='read-more'>
                Read More
              </Button>
            </div>

            {/* Right image */}
            <div className='about-image'>
              <img src={aboutImage} alt='About Coffee' />
            </div>
          </div>
        </section>
      </Content>

      {/* ===== FOOTER ===== */}
      <Footer className='homepage__footer'>
        © {new Date().getFullYear()} Phan Coffee. All Rights Reserved.
      </Footer>
    </Layout>
  );
};

export default About;
