import React from "react";
import { Layout, Row, Col, Typography } from "antd";
import { Link } from "react-router-dom";
import "./index.scss";
import { useTranslation } from "react-i18next";

const logo = `${process.env.PUBLIC_URL || ""}/logo_Web_Phan_Coffeess.png`;

const { Footer } = Layout;
const { Title } = Typography;

const FooterPage: React.FC = () => {
  const year = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <Footer className='app-footer'>
      <div className='app-footer__inner'>
        <Row gutter={[48, 32]} className='footer-top'>
          {/* Brand */}
          <Col xs={24} md={10} className='footer-column footer-brand'>
            <div className='footer-brand__head'>
              <div className='footer-mark'><img src={logo} alt="" /></div>
              <div className='footer-brand__name'>{t("common.brandName")}</div>
            </div>
            <p className='footer-text'>
              {t("footer.brandDescription")}
            </p>
          </Col>

          {/* SHOP */}
          <Col xs={24} sm={12} md={7} className='footer-column'>
            <Title level={5} className='footer-heading'>
              {t("footer.shopTitle")}
            </Title>
            <ul className='footer-list'>
              <li>
                <Link to='/products'>{t("footer.shopAllCoffee")}</Link>
              </li>
              <li>
                <Link to='/products/brewing-gear'>{t("footer.shopBrewingGear")}</Link>
              </li>
              <li>
                <Link to='/products/merchandise'>{t("footer.shopMerchandise")}</Link>
              </li>
              <li>
                <Link to='/products/subscription'>{t("footer.shopSubscription")}</Link>
              </li>
            </ul>
          </Col>

          {/* SUPPORT */}
          <Col xs={24} sm={12} md={7} className='footer-column'>
            <Title level={5} className='footer-heading'>
              {t("footer.supportTitle")}
            </Title>
            <ul className='footer-list'>
              <li>
                <Link to='/shipping'>{t("footer.supportShipping")}</Link>
              </li>
              <li>
                <Link to='/wholesale'>{t("footer.supportWholesale")}</Link>
              </li>
              <li>
                <Link to='/returns'>{t("footer.supportReturns")}</Link>
              </li>
              <li>
                <Link to='/privacy'>{t("footer.supportPrivacy")}</Link>
              </li>
            </ul>
          </Col>
        </Row>
      </div>

      {/* Bottom bar */}
      <div className='app-footer__bottom'>
        <div className='footer-bottom-left'>
          {t("footer.copyright", { year })}
        </div>
        <div className='footer-bottom-right'>
          <a
            href='https://web.facebook.com/phancoffee.vn'
            target='_blank'
            rel='noopener noreferrer'>
            {t("footer.facebook")}
          </a>
          <a
            href='https://instagram.com'
            target='_blank'
            rel='noopener noreferrer'>
            {t("footer.instagram")}
          </a>
        </div>
      </div>
    </Footer>
  );
};

export default FooterPage;
