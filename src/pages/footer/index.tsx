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
        {/* 3 cột giống hình mẫu */}
        <Row gutter={[48, 32]}>
          {/* Cột 1: More About Company */}
          <Col xs={24} md={8} className='footer-column'>
            <Title level={4} className='footer-heading'>
              VỀ PHAN COFFEE
            </Title>
            <p className='footer-text'>
              Phan Coffee là không gian dành cho những người yêu cà phê rang xay
              nguyên chất, nơi bạn có thể tận hưởng hương vị đậm đà trong một
              không gian ấm cúng và gần gũi giữa lòng Sài Gòn.
            </p>
            <p className='footer-signature'>– Phan Coffee</p>
          </Col>

          {/* Cột 2: Keep Connected */}
          <Col xs={24} md={8} className='footer-column'>
            <Title level={4} className='footer-heading'>
              KẾT NỐI VỚI CHÚNG TÔI
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

          {/* Cột 3: Contact Information */}
          <Col xs={24} md={8} className='footer-column'>
            <Title level={4} className='footer-heading'>
              THÔNG TIN LIÊN HỆ
            </Title>
            <ul className='footer-list footer-list--contact'>
              <li>
                <HomeOutlined className='contact-icon' />
                <div>
                  <Text className='footer-contact-line'>
                    82-84 Bùi Thị Xuân, P. Bến Thành
                  </Text>
                  <br />
                  <Text className='footer-contact-line'>
                    Q.1, TP. Hồ Chí Minh
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
                    Tel: (84.28) 3925 1852
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

      {/* Dải bar dưới giống hình */}
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
