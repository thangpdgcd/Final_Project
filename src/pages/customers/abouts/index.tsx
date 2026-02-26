import React from "react";
import { Layout } from "antd";

import mainAboutImage from "../../../assets/img/rangxay.jpg";
import secondaryAboutImage from "../../../assets/img/coffee_arabica_vn.png";

import "./index.scss";
import Chatbox from "../../../components/chatbox";
import HeaderPage from "../../../components/header";
import FooterPage from "../../../components/footer";

const { Content } = Layout;

const About: React.FC = () => {
  return (
    <Layout className='about-page'>
      <HeaderPage />

      <Content className='about-page__content'>
        <section className='about-section'>
          <h2 className='about-section__label'>Về chúng tôi</h2>

          <div className='about-section__body'>
            <div className='about-section__images'>
              <div className='about-section__image about-section__image--main'>
                <img src={mainAboutImage} alt='Roasting coffee beans' />
              </div>

              <div className='about-section__image about-section__image--secondary'>
                <img src={secondaryAboutImage} alt='Phan Coffee sản phẩm' />
              </div>
            </div>

            <div className='about-section__content'>
              <h3 className='about-section__title'>
                Hương vị thuần khiết từ Tây Nguyên
              </h3>
              <p className='about-section__description'>
                Phan Coffee Roaster tự tin mang đến cho bạn một thương hiệu cà phê sạch
                nguyên chất mang đậm hương vị Tây Nguyên với các dòng sản phẩm chính
                thức đang phân phối:
              </p>
              <ul className='about-section__list'>
                <li>Robusta sơ chế Natural</li>
                <li>Robusta sơ chế Honey</li>
                <li>Arabica, Culi Robusta sơ chế Wash</li>
              </ul>
            </div>
          </div>
        </section>

        <section className='processing-methods'>
          <div className='processing-methods__header'>
            <h2 className='processing-methods__title'>
              Quy trình chế biến &amp; chất lượng
            </h2>
            <h3 className='processing-methods__heading'>
              Từ hạt cà phê đến tách cà phê hoàn hảo
            </h3>
          </div>

          <div className='processing-methods__grid'>
            <article className='processing-methods__card'>
              <div className='processing-methods__image-wrapper'>
                <img src={mainAboutImage} alt='Quy trình chế biến Natural' />
              </div>
              <h4 className='processing-methods__title'>Quy trình chế biến Natural</h4>
              <p className='processing-methods__description'>
                Hạt cà phê được tuyển chọn kỹ lưỡng với tỉ lệ trái chín &gt; 99%,
                được sơ chế trực tiếp tại xưởng để giữ trọn hương vị tự nhiên.
              </p>
            </article>

            <article className='processing-methods__card'>
              <div className='processing-methods__image-wrapper'>
                <img src={secondaryAboutImage} alt='Tươi mới mỗi ngày' />
              </div>
              <h4 className='processing-methods__title'>Tươi mới mỗi ngày</h4>
              <p className='processing-methods__description'>
                Cà phê ở Phan luôn được rang xay mới mỗi ngày, rang mộc không tẩm
                ướp và ủ kín 48h trước khi đóng gói để đảm bảo sự tươi mới của
                từng gói cà phê khi đến tay bạn.
              </p>
            </article>

            <article className='processing-methods__card'>
              <div className='processing-methods__image-wrapper'>
                <img src={mainAboutImage} alt='Uy tín và chất lượng' />
              </div>
              <h4 className='processing-methods__title'>Uy tín &amp; chất lượng</h4>
              <p className='processing-methods__description'>
                Cà phê tại Phan được cấp đầy đủ chứng nhận an toàn thực phẩm, công
                bố chất lượng, kiểm nghiệm sản phẩm và chứng nhận thương hiệu độc
                quyền, mang lại sự an tâm cho mỗi khách hàng.
              </p>
            </article>
          </div>
        </section>
      </Content>

      <FooterPage />
      <Chatbox />
    </Layout>
  );
};

export default About;
