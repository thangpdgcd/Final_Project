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

const { TextArea } = Input;

const Contact: React.FC = () => {
  const [form] = Form.useForm();

  const handleFinish = (values: any) => {
    console.log("Contact form:", values);
    // TODO: call API / gửi email...
  };

  return (
    <section className='contact'>
      <Row gutter={[32, 32]} justify='center'>
        {/* FORM */}
        <Col xs={24} lg={14}>
          <div className='contact__card contact__card--form'>
            <div className='contact__form-inner'>
              <h2 className='contact__title'>Liên hệ Phan Coffee</h2>
              <p className='contact__subtitle'>
                Hãy để lại thông tin, chúng tôi sẽ liên hệ lại sớm nhất có thể.
              </p>

              <Form
                form={form}
                layout='vertical'
                onFinish={handleFinish}
                className='contact__form'>
                <Form.Item
                  label='Name'
                  name='name'
                  rules={[{ required: true, message: "Vui lòng nhập tên" }]}>
                  <Input
                    size='large'
                    prefix={<UserOutlined />}
                    placeholder='Nhập tên của bạn'
                  />
                </Form.Item>

                <Form.Item
                  label='Email'
                  name='email'
                  rules={[
                    { required: true, message: "Vui lòng nhập email" },
                    { type: "email", message: "Email không hợp lệ" },
                  ]}>
                  <Input
                    size='large'
                    prefix={<MailOutlined />}
                    placeholder='you@example.com'
                  />
                </Form.Item>

                <Form.Item
                  label='Phone Number'
                  name='phone'
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại" },
                  ]}>
                  <Input
                    size='large'
                    prefix={<PhoneOutlined />}
                    placeholder='(+84) 123 456 789'
                  />
                </Form.Item>

                <Form.Item label='Message' name='message'>
                  <TextArea
                    rows={4}
                    maxLength={500}
                    placeholder='Lời nhắn của bạn...'
                    showCount
                  />
                </Form.Item>

                <div className='contact__actions'>
                  <Button
                    type='primary'
                    htmlType='submit'
                    size='large'
                    icon={<SendOutlined />}
                    className='contact__btn contact__btn--primary'>
                    Gửi
                  </Button>

                  <Button
                    type='default'
                    size='large'
                    className='contact__btn contact__btn--outline'
                    icon={<EnvironmentOutlined />}
                    onClick={() =>
                      window.open(
                        "https://www.google.com/maps?q=Lâm+Tùng,+Ia+Chim,+Kon+Tum",
                        "_blank"
                      )
                    }>
                    Chỉ đường
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </Col>

        {/* MAP */}
        <Col xs={24} lg={10}>
          <div className='contact__card contact__card--map'>
            <h3 className='contact__map-title'>Phan Coffee Roasters</h3>
            <p className='contact__map-address'>
              <EnvironmentOutlined /> 86 Lâm Tùng, xã Ia Chim, Kon Tum
            </p>

            <div className='contact__map-wrapper'>
              <iframe
                title='Phan Coffee Map'
                src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d82073.09943964124!2d107.85568379170502!3d14.288538558851073!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x316c071545f23d2f%3A0x6984552c63ea458c!2zTMOibSBUw7luZywgSWEgQ2hpbSwgVHAuIEtvbiBUdW0sIEtvbiBUdW0sIFZp4buHdCBOYW0!5e0!3m2!1svi!2sus!4v1765157913835!5m2!1svi!2sus'
                loading='lazy'
                allowFullScreen
                referrerPolicy='no-referrer-when-downgrade'
              />
            </div>

            <div className='contact__map-note'>
              Mở Google Maps để xem đường đi chi tiết, thời gian di chuyển và
              gợi ý tuyến đường phù hợp.
            </div>
          </div>
        </Col>
      </Row>
    </section>
  );
};

export default Contact;
