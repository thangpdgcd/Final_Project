import React from "react";
import { Layout, Row, Col, Typography } from "antd";
import {
  FacebookOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  TikTokOutlined,
  HomeOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

import "./index.scss";

const { Footer } = Layout;
const { Title, Text } = Typography;

const FooterPage: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <Footer className='app-footer'>
      <div className='app-footer__inner'>
        {/* 3 columns */}
        <Row gutter={[48, 32]}>
          {/* Column 1: About */}
          <Col xs={24} md={8} className='footer-column'>
            <Title level={4} className='footer-heading'>
              ABOUT PHAN COFFEE
            </Title>
            <p className='footer-text'>
              Phan Coffee is a place for people who love pure, freshly roasted
              coffee. Here, you can enjoy bold flavors in a warm, friendly space
              in the heart of Ho Chi Minh City.
            </p>
            <p className='footer-signature'>– Phan Coffee</p>
          </Col>

          {/* Column 2: Social */}
          <Col xs={24} md={8} className='footer-column'>
            <Title level={4} className='footer-heading'>
              CONNECT WITH US
            </Title>
            <ul className='footer-list footer-list--social'>
              <li>
                <span className='icon-circle icon-circle--facebook'>
                  <FacebookOutlined />
                </span>
                <a
                  href='https://web.facebook.com/phancoffee.vn'
                  target='_blank'
                  rel='noopener noreferrer'>
                  Like us on Facebook
                </a>
              </li>
              <li>
                <span className='icon-circle icon-circle--instagram'>
                  <InstagramOutlined />
                </span>
                <a
                  href='https://instagram.com'
                  target='_blank'
                  rel='noopener noreferrer'>
                  Follow us on Instagram
                </a>
              </li>
              <li>
                <span className='icon-circle icon-circle--youtube'>
                  <YoutubeOutlined />
                </span>
                <a
                  href='https://youtube.com'
                  target='_blank'
                  rel='noopener noreferrer'>
                  Subscribe on YouTube
                </a>
              </li>
              <li>
                <span className='icon-circle icon-circle--tiktok'>
                  <TikTokOutlined />
                </span>
                <a
                  href='https://tiktok.com'
                  target='_blank'
                  rel='noopener noreferrer'>
                  Follow us on TikTok
                </a>
              </li>
            </ul>
          </Col>

          {/* Column 3: Contact */}
          <Col xs={24} md={8} className='footer-column'>
            <Title level={4} className='footer-heading'>
              CONTACT INFORMATION
            </Title>
            <ul className='footer-list footer-list--contact'>
              <li>
                <HomeOutlined className='contact-icon' />
                <div>
                  <Text className='footer-contact-line'>
                    82–84 Bui Thi Xuan St., Ben Thanh Ward
                  </Text>
                  <br />
                  <Text className='footer-contact-line'>
                    District 1, Ho Chi Minh City, Vietnam
                  </Text>
                </div>
              </li>
              <li>
                <PhoneOutlined className='contact-icon' />
                <div>
                  <Text className='footer-contact-line'>
                    Hotline: 1900 6011
                  </Text>
                  <br />
                  <Text className='footer-contact-line'>
                    Tel: (+84 28) 3925 1852
                  </Text>
                </div>
              </li>
              <li>
                <MailOutlined className='contact-icon' />
                <div>
                  <Text className='footer-contact-line'>
                    contact@phancoffee.vn
                  </Text>
                </div>
              </li>
            </ul>
          </Col>
        </Row>
      </div>

      {/* Bottom bar */}
      <div className='app-footer__bottom'>
        <div className='footer-bottom-left'>
          © {year} Phan Coffee. All rights reserved.
        </div>
        <div className='footer-bottom-right'>
          <Link to='/about'>Company Information</Link>
          <span className='divider'>|</span>
          <Link to='/privacy'>Privacy Policy</Link>
          <span className='divider'>|</span>
          <Link to='/terms'>Terms &amp; Conditions</Link>
        </div>
      </div>
    </Footer>
  );
};

export default FooterPage;
