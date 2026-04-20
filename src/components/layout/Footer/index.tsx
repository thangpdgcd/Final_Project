import React from 'react';
import { Layout, Row, Col, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FacebookFilled,
  InstagramOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import './index.scss';

const { Footer } = Layout;
const { Title } = Typography;

const FooterPage: React.FC = () => {
  const year = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <Footer className="app-footer">
      <div className="app-footer__inner">
        <Row gutter={[48, 32]} className="footer-top">
          {/* Brand + description */}
          <Col xs={24} md={12} lg={7} className="footer-column footer-brand">
            <div className="footer-brand__head">
              <div className="footer-mark">
                <img
                  src="https://res.cloudinary.com/dfjecxrnl/image/upload/v1773308731/199bea82-b758-411d-863a-1b7be6ecc8b4.png"
                  alt="Phan Coffee logo"
                />
              </div>
              <div className="footer-brand__name">{t('common.brandName')}</div>
            </div>
            <p className="footer-text">{t('footer.brandDescription')}</p>
            <div className="footer-social">
              <a
                href="https://web.facebook.com/phancoffee.vn"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social__icon"
              >
                <FacebookFilled />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social__icon"
              >
                <InstagramOutlined />
              </a>
            </div>
          </Col>

          {/* Products */}
          <Col xs={12} md={6} lg={5} className="footer-column">
            <Title level={5} className="footer-heading">
              {t('footer.shop.title')}
            </Title>
            <ul className="footer-list">
              <li>
                <Link to="/products?category=robusta">{t('footer.shop.robusta')}</Link>
              </li>
              <li>
                <Link to="/products?category=arabica">{t('footer.shop.arabica')}</Link>
              </li>
              <li>
                <Link to="/products?category=mang-den-blend">{t('footer.shop.mangDenBlend')}</Link>
              </li>
              <li>
                <Link to="/products?category=filter-bag">{t('footer.shop.filterBag')}</Link>
              </li>
            </ul>
          </Col>

          {/* Info */}
          <Col xs={12} md={6} lg={5} className="footer-column">
            <Title level={5} className="footer-heading">
              {t('footer.info.title')}
            </Title>
            <ul className="footer-list">
              <li>
                <Link to="/abouts">{t('footer.info.about')}</Link>
              </li>
              <li>
                <Link to="/shipping-policy">{t('footer.info.shipping')}</Link>
              </li>
              <li>
                <Link to="/brewing-guide">{t('footer.info.brewingGuide')}</Link>
              </li>
              <li>
                <Link to="/wholesale">{t('footer.info.wholesale')}</Link>
              </li>
            </ul>
          </Col>

          {/* Contact */}
          <Col xs={24} md={12} lg={7} className="footer-column footer-contact">
            <Title level={5} className="footer-heading">
              {t('footer.contact.title')}
            </Title>
            <div className="footer-contact__item">
              <EnvironmentOutlined className="footer-contact__icon" />
              <span>{t('footer.contact.address')}</span>
            </div>
            <div className="footer-contact__item">
              <PhoneOutlined className="footer-contact__icon" />
              <a href="tel:+84123456789">{t('footer.contact.phone')}</a>
            </div>
            <div className="footer-contact__item">
              <MailOutlined className="footer-contact__icon" />
              <a href="mailto:hello@phancoffee.vn">{t('footer.contact.email')}</a>
            </div>
            <div className="footer-contact__item">
              <ClockCircleOutlined className="footer-contact__icon" />
              <span>{t('footer.contact.hours')}</span>
            </div>
          </Col>
        </Row>
      </div>

      {/* Bottom bar */}
      <div className="app-footer__bottom">
        <div className="footer-bottom-left">{t('footer.copyright', { year })}</div>
        <div className="footer-bottom-right">
          <Link to="/terms-of-service">{t('footer.termsOfService')}</Link>
          <Link to="/privacy">{t('footer.support.privacy')}</Link>
        </div>
      </div>
    </Footer>
  );
};

export default FooterPage;
