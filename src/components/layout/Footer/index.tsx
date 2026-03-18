import React from "react";
import { Layout, Row, Col, Typography } from "antd";
import { Link } from "react-router-dom";
import {
  FacebookFilled,
  InstagramOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import "./index.scss";

const { Footer } = Layout;
const { Title } = Typography;

const FooterPage: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <Footer className='app-footer'>
      <div className='app-footer__inner'>
        <Row gutter={[48, 32]} className='footer-top'>
          {/* Brand + description */}
          <Col xs={24} md={12} lg={7} className='footer-column footer-brand'>
            <div className='footer-brand__head'>
              <div className='footer-mark'>
                <img
                  src='https://res.cloudinary.com/dfjecxrnl/image/upload/v1773308731/199bea82-b758-411d-863a-1b7be6ecc8b4.png'
                  alt='Phan Coffee logo'
                />
              </div>
              <div className='footer-brand__name'>Phan Coffee</div>
            </div>
            <p className='footer-text'>
              Cung cấp giải pháp cà phê rang mộc nguyên chất cho gia đình và doanh
              nghiệp. Tận tâm trong từng hạt cà phê từ mảnh đất Kon Tum.
            </p>
            <div className='footer-social'>
              <a
                href='https://web.facebook.com/phancoffee.vn'
                target='_blank'
                rel='noopener noreferrer'
                className='footer-social__icon'
              >
                <FacebookFilled />
              </a>
              <a
                href='https://instagram.com'
                target='_blank'
                rel='noopener noreferrer'
                className='footer-social__icon'
              >
                <InstagramOutlined />
              </a>
            </div>
          </Col>

          {/* Products */}
          <Col xs={12} md={6} lg={5} className='footer-column'>
            <Title level={5} className='footer-heading'>
              Sản phẩm
            </Title>
            <ul className='footer-list'>
              <li>
                <Link to='/products?category=robusta'>Cà phê Robusta</Link>
              </li>
              <li>
                <Link to='/products?category=arabica'>Cà phê Arabica</Link>
              </li>
              <li>
                <Link to='/products?category=mang-den-blend'>Măng Đen Blend</Link>
              </li>
              <li>
                <Link to='/products?category=filter-bag'>Cà phê túi lọc</Link>
              </li>
            </ul>
          </Col>

          {/* Info */}
          <Col xs={12} md={6} lg={5} className='footer-column'>
            <Title level={5} className='footer-heading'>
              Thông tin
            </Title>
            <ul className='footer-list'>
              <li>
                <Link to='/abouts'>Về chúng tôi</Link>
              </li>
              <li>
                <Link to='/shipping-policy'>Chính sách giao hàng</Link>
              </li>
              <li>
                <Link to='/brewing-guide'>Hướng dẫn pha chế</Link>
              </li>
              <li>
                <Link to='/wholesale'>Liên hệ sỉ/đại lý</Link>
              </li>
            </ul>
          </Col>

          {/* Contact */}
          <Col xs={24} md={12} lg={7} className='footer-column footer-contact'>
            <Title level={5} className='footer-heading'>
              Liên hệ
            </Title>
            <div className='footer-contact__item'>
              <EnvironmentOutlined className='footer-contact__icon' />
              <span>86 Lâm Tùng, Ia Chim, TP. Kon Tum</span>
            </div>
            <div className='footer-contact__item'>
              <PhoneOutlined className='footer-contact__icon' />
              <a href='tel:+84123456789'>+84 123 456 789</a>
            </div>
            <div className='footer-contact__item'>
              <MailOutlined className='footer-contact__icon' />
              <a href='mailto:hello@phancoffee.vn'>hello@phancoffee.vn</a>
            </div>
            <div className='footer-contact__item'>
              <ClockCircleOutlined className='footer-contact__icon' />
              <span>Thứ 2 - CN: 07:00 - 21:00</span>
            </div>
          </Col>
        </Row>
      </div>

      {/* Bottom bar */}
      <div className='app-footer__bottom'>
        <div className='footer-bottom-left'>
          © {year} Phan Coffee - Cà phê rang mộc. All rights reserved.
        </div>
        <div className='footer-bottom-right'>
          <Link to='/terms-of-service'>Điều khoản dịch vụ</Link>
          <Link to='/privacy'>Chính sách bảo mật</Link>
        </div>
      </div>
    </Footer>
  );
};

export default FooterPage;
