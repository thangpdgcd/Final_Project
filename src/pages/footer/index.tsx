import React from "react";
import { Layout, Row, Col, Typography } from "antd";
import {
  FacebookOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  TikTokOutlined,
} from "@ant-design/icons";
import "./index.scss";
import logofooter from "../../assets/img/logo_PhanCoffee.jpg";

const { Footer } = Layout;
const { Title } = Typography;

const FooterPage: React.FC = () => {
  return (
    <Footer className='app-footer'>
      <Row gutter={[32, 32]} justify='space-between'>
        {/* Cột 1: Logo + Info */}
        <Col xs={24} md={8}>
          <div className='footer-logo'>
            <img
              src={logofooter}
              alt='Phan Coffee'
              className='footer-logo-img'
            />

            <p>82-84 Bùi Thị Xuân, P. Bến Thành, Q.1, Tp Hồ Chí Minh</p>
            <p>Hotline: 1900 6011</p>
            <p>Tel: (84.28) 39251852</p>
            <p>Fax: (84.28) 39251848</p>
            <p>© {new Date().getFullYear()} PHAN COFFEE.</p>
          </div>
        </Col>

        {/* Cột 2: Liên kết nhanh */}
        <Col xs={24} md={8}>
          <Title level={4} className='footer-title'>
            LIÊN KẾT NHANH
          </Title>
          <ul className='footer-links'>
            <li>
              <a href='#'>Truyền Thông</a>
            </li>
            <li>
              <a href='#'>Cơ Hội Nghề Nghiệp</a>
            </li>
            <li>
              <a href='#'>Chính Sách Bảo Mật</a>
            </li>
            <li>
              <a href='#'>Thông Tin Liên Hệ</a>
            </li>
          </ul>
        </Col>

        {/* Cột 3: Social Media */}
        <Col xs={24} md={8}>
          <Title level={4} className='footer-title'>
            SOCIAL MEDIA
          </Title>
          <ul className='social-links'>
            <li>
              <a
                href='https://web.facebook.com/phancoffee.vn'
                target='_blank'
                rel='noopener noreferrer'>
                <FacebookOutlined /> Facebook
              </a>
            </li>
            <li>
              <a
                href='https://instagram.com'
                target='_blank'
                rel='noopener noreferrer'>
                <InstagramOutlined /> Instagram
              </a>
            </li>
            <li>
              <a
                href='https://youtube.com'
                target='_blank'
                rel='noopener noreferrer'>
                <YoutubeOutlined /> Youtube
              </a>
            </li>
            <li>
              <a
                href='https://tiktok.com'
                target='_blank'
                rel='noopener noreferrer'>
                <TikTokOutlined /> Tiktok
              </a>
            </li>
          </ul>
        </Col>
      </Row>
    </Footer>
  );
};

export default FooterPage;
