import React from "react";
import { Row, Col, Form, Input, Button } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  SendOutlined,
} from "@ant-design/icons";
import "./index.scss";
import Chatbox from "../../../components/chatbox";

const { TextArea } = Input;

const BG_IMAGE =
  "https://res.cloudinary.com/dfjecxrnl/image/upload/v1769110199/ChatGPT_Image_02_27_53_23_thg_1_2026_gj9nxi.png";

const Contact: React.FC = () => {
  const [form] = Form.useForm();

  const handleFinish = (values: any) => {
    console.log("Contact form:", values);
  };

  return (
    <section
      className='contact'
      style={{
        backgroundImage: `url(${BG_IMAGE})`,
      }}>
      <div className='contact__overlay' />

      <Row gutter={[32, 32]} justify='center' className='contact__content'>
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
                  <Input prefix={<UserOutlined />} placeholder='Your name' />
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
                    Send
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
                    Directions
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </Col>

        {/* MAP */}
        <Col xs={24} lg={12}>
          <div className='contact__card contact__card--map'>
            <h3 className='contact__map-title'>Phan Coffee Roasters</h3>
            <p className='contact__map-address'>
              <EnvironmentOutlined /> 86 Lam Tung, Ia Chim, Kon Tum
            </p>

            <div className='contact__map-wrapper'>
              <iframe
                title='Phan Coffee Map'
                src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3866.0051352833216!2d107.92426178451606!3d14.311134348382254!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x316c07005090c739%3A0xa89c75670a39361d!2sC%C3%94NG%20TY%20TNHH%20PHAN%20COFFEE!5e0!3m2!1svi!2s!4v1769112965332!5m2!1svi!2s" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade'
                loading='lazy'
                allowFullScreen
              />
            </div>

            <div className='contact__map-note'>
              Open Google Maps to view directions, travel time and route
              suggestions.
            </div>
          </div>
        </Col>
      </Row>
      <Chatbox />
    </section>
  );
};

export default Contact;
