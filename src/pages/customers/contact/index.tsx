import React from "react";
import { Row, Col, Form, Input, Button } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  SendOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import "./index.scss";
import Chatbox from "../../../components/chatbox";
import HeaderPage from "../../../components/header";
import FooterPage from "../../../components/footer";

type ContactProps = {
  embedded?: boolean;
};

const { TextArea } = Input;

const Contact: React.FC<ContactProps> = ({ embedded = false }) => {
  const [form] = Form.useForm();

  const handleFinish = (values: any) => {
    console.log("Contact form:", values);
  };

  return (
    <>
      {!embedded && <HeaderPage />}
      <section className='contact'>
        <div className='contact__overlay' />

        <div className='contact__inner'>
          {/* INTRO SECTION */}
          <div className='contact__intro'>
            <div className='contact__eyebrow'>CONNECT WITH US</div>
            <h1 className='contact__headline'>
              Let&apos;s brew something
              <br />
              amazing together.
            </h1>
            <p className='contact__description'>
              Join the Phan Coffee community. We&apos;re always ready to hear your
              feedback, wholesale inquiries, or just chat about the perfect roast.
            </p>
          </div>

          {/* TOP INFO CARDS */}
          <Row gutter={[24, 24]} className='contact__info-row'>
            <Col xs={24} md={8}>
              <div className='contact__info-card'>
                <div className='contact__info-icon'>
                  <PhoneOutlined />
                </div>
                <div className='contact__info-label'>CALL US</div>
                <div className='contact__info-value'>(+84) 123 456 789</div>
                <div className='contact__info-meta'>Mon – Fri, 8:00–18:00</div>
              </div>
            </Col>

            <Col xs={24} md={8}>
              <div className='contact__info-card'>
                <div className='contact__info-icon'>
                  <MailOutlined />
                </div>
                <div className='contact__info-label'>EMAIL US</div>
                <div className='contact__info-value'>hello@phancoffee.vn</div>
                <div className='contact__info-meta'>Online support 24/7</div>
              </div>
            </Col>

            <Col xs={24} md={8}>
              <div className='contact__info-card'>
                <div className='contact__info-icon'>
                  <EnvironmentOutlined />
                </div>
                <div className='contact__info-label'>VISIT US</div>
                <div className='contact__info-value'>
                  86 Lam Tung
                  <br />
                  Ia Chim, Kon Tum
                </div>
                <div className='contact__info-meta'>8am–10pm, 7 days a week</div>
              </div>
            </Col>
          </Row>

          {/* MAIN GRID: FORM + MAP */}
          <Row
            gutter={[32, 32]}
            justify='center'
            className='contact__content contact__main-row'>
            {/* FORM */}
            <Col xs={24} lg={12}>
              <div className='contact__card contact__card--form'>
                <div className='contact__form-inner'>
                  <h2 className='contact__title'>Contact Phan Coffee</h2>
                  <p className='contact__subtitle'>
                    Leave your information and we will get back to you as soon as
                    possible.
                  </p>

                  <Form
                    form={form}
                    layout='vertical'
                    onFinish={handleFinish}
                    className='contact__form'>
                    <Form.Item
                      label='Name'
                      name='name'
                      rules={[
                        { required: true, message: "Please enter your name" },
                      ]}>
                      <Input
                        prefix={<UserOutlined />}
                        placeholder='Your name'
                      />
                    </Form.Item>

                    <Form.Item
                      label='Email'
                      name='email'
                      rules={[
                        { required: true, message: "Please enter your email" },
                        { type: "email", message: "Invalid email format" },
                      ]}>
                      <Input
                        prefix={<MailOutlined />}
                        placeholder='you@example.com'
                      />
                    </Form.Item>

                    <Form.Item
                      label='Phone Number'
                      name='phone'
                      rules={[
                        {
                          required: true,
                          message: "Please enter your phone number",
                        },
                      ]}>
                      <Input
                        prefix={<PhoneOutlined />}
                        placeholder='(+84) 123 456 789'
                      />
                    </Form.Item>

                    <Form.Item label='Message' name='message'>
                      <TextArea
                        rows={4}
                        maxLength={500}
                        showCount
                        placeholder='Your message...'
                      />
                    </Form.Item>

                    <div className='contact__actions'>
                      <Button
                        htmlType='submit'
                        icon={<SendOutlined />}
                        className='contact__btn contact__btn--primary'>
                        Send message
                      </Button>

                      <Button
                        className='contact__btn contact__btn--outline'
                        icon={<EnvironmentOutlined />}
                        onClick={() =>
                          window.open(
                            "https://www.google.com/maps?q=86+Lâm+Tùng,+Ia+Chim,+Kon+Tum",
                            "_blank",
                          )
                        }>
                        Get directions
                      </Button>
                    </div>
                  </Form>
                </div>
              </div>
            </Col>

            {/* MAP + OPENING HOURS */}
            <Col xs={24} lg={12}>
              <div className='contact__card contact__card--map'>
                <div className='contact__map-header'>
                  <div>
                    <h3 className='contact__map-title'>Phan Coffee Roasters</h3>
                    <p className='contact__map-address'>
                      <EnvironmentOutlined /> 86 Lam Tung, Ia Chim, Kon Tum
                    </p>
                  </div>
                </div>

                <div className='contact__map-wrapper'>
                  <iframe
                    title='Phan Coffee Map'
                    src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3866.0051352833216!2d107.92426178451606!3d14.311134348382254!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x316c07005090c739%3A0xa89c75670a39361d!2sC%C3%94NG%20TY%20TNHH%20PHAN%20COFFEE!5e0!3m2!1svi!2s!4v1769112965332!5m2!1svi!2s'
                    loading='lazy'
                    referrerPolicy='no-referrer-when-downgrade'
                    allowFullScreen
                  />
                </div>

                <div className='contact__hours'>
                  <div className='contact__hours-header'>
                    <div className='contact__hours-icon'>
                      <ClockCircleOutlined />
                    </div>
                    <div>
                      <div className='contact__hours-label'>OPENING HOURS</div>
                      <div className='contact__hours-sub'>
                        *Times may vary on select holidays.
                      </div>
                    </div>
                  </div>

                  <div className='contact__hours-row'>
                    <span className='contact__hours-day'>Mon – Fri</span>
                    <span className='contact__hours-time'>07:30 – 22:00</span>
                  </div>
                  <div className='contact__hours-row'>
                    <span className='contact__hours-day'>Sat – Sun</span>
                    <span className='contact__hours-time'>08:00 – 22:00</span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {!embedded && <Chatbox />}
      </section>
      {!embedded && <FooterPage />}
    </>
  );
};

export default Contact;


