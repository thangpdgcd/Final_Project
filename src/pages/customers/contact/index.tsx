import React from "react";
import { Layout, Row, Col, Form, Input, Button } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  SendOutlined,
} from "@ant-design/icons";
import "./index.scss";
import Chatbox from "../../../components/chatbox";
import HeaderPage from "../../../components/layout/Header";
import FooterPage from "../../../components/layout/Footer";

type ContactProps = {
  embedded?: boolean;
};

const { TextArea } = Input;
const { Content } = Layout;

const Contact: React.FC<ContactProps> = ({ embedded = false }) => {
  const [form] = Form.useForm();
  const heroBg = `${process.env.PUBLIC_URL ?? ""}/assets/img/loginbackground.jpg`;

  const handleFinish = (values: any) => {
    console.log("Contact form:", values);
  };

  const section = (
    <section className='contact'>
      {/* HERO – Ảnh nền + tiêu đề lớn */}
      <div className='contact__hero' style={{ backgroundImage: `url(${heroBg})` }}>
        <div className='contact__hero-overlay'>
          <div className='contact__hero-content'>
            <p className='contact__hero-kicker'>Liên hệ với Phan Coffee</p>
            <h1 className='contact__hero-title'>Chúng tôi luôn sẵn sàng lắng nghe</h1>
            <p className='contact__hero-subtitle'>
              Chia sẻ với chúng tôi những trải nghiệm, ý kiến hoặc nhu cầu của bạn để
              Phan Coffee có thể mang đến hương vị cà phê và dịch vụ tốt hơn mỗi ngày.
            </p>
          </div>
        </div>
      </div>

      {/* THÂN TRANG – THẺ LỚN GỒM FORM + THÔNG TIN LIÊN HỆ */}
      <div className='contact__inner'>
        <div className='contact__card contact__card--main'>
          <Row gutter={[48, 32]} align='top'>
            {/* FORM */}
            <Col xs={24} lg={14}>
              <div className='contact__form-wrapper'>
                <h2 className='contact__title'>Gửi tin nhắn cho chúng tôi</h2>
                <p className='contact__form-text'>
                  Đội ngũ Phan Coffee sẽ phản hồi trong vòng 24 giờ làm việc.
                </p>

                <Form
                  form={form}
                  layout='vertical'
                  onFinish={handleFinish}
                  className='contact__form'>
                  <Row gutter={[16, 0]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label='Họ và tên'
                        name='name'
                        rules={[
                          { required: true, message: "Vui lòng nhập họ và tên" },
                        ]}>
                        <Input
                          prefix={<UserOutlined />}
                          placeholder='Nguyễn Văn A'
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label='Số điện thoại'
                        name='phone'
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập số điện thoại",
                          },
                        ]}>
                        <Input
                          prefix={<PhoneOutlined />}
                          placeholder='+84 000 000 000'
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[16, 0]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label='Email'
                        name='email'
                        rules={[
                          { required: true, message: "Vui lòng nhập email" },
                          { type: "email", message: "Email không hợp lệ" },
                        ]}>
                        <Input
                          prefix={<MailOutlined />}
                          placeholder='example@gmail.com'
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label='Chủ đề' name='subject'>
                        <Input placeholder='Ví dụ: Góp ý về sản phẩm' />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    label='Nội dung tin nhắn'
                    name='message'
                    rules={[
                      { required: true, message: "Vui lòng nhập nội dung" },
                    ]}>
                    <TextArea
                      rows={5}
                      maxLength={500}
                      showCount
                      placeholder='Chia sẻ câu chuyện hoặc thắc mắc của bạn...'
                    />
                  </Form.Item>

                  <div className='contact__actions'>
                    <Button
                      htmlType='submit'
                      icon={<SendOutlined />}
                      className='contact__btn contact__btn--primary'>
                      Gửi ngay
                    </Button>
                  </div>
                </Form>
              </div>
            </Col>

            {/* THÔNG TIN LIÊN HỆ */}
            <Col xs={24} lg={10}>
              <div className='contact__info-panel'>
                <p className='contact__info-kicker'>Thông tin liên hệ</p>
                <h3 className='contact__info-title'>
                  Hãy cho chúng tôi biết suy nghĩ của bạn
                </h3>
                <p className='contact__info-subtitle'>
                  Đội ngũ Phan Coffee sẽ phản hồi bạn trong thời gian sớm nhất.
                </p>

                <div className='contact__info-list'>
                  <div className='contact__info-item'>
                    <div className='contact__info-icon'>
                      <PhoneOutlined />
                    </div>
                    <div>
                      <div className='contact__info-label'>Điện thoại</div>
                      <div className='contact__info-value'>+84 123 456 789</div>
                    </div>
                  </div>

                  <div className='contact__info-item'>
                    <div className='contact__info-icon'>
                      <MailOutlined />
                    </div>
                    <div>
                      <div className='contact__info-label'>Email</div>
                      <div className='contact__info-value'>
                        hello@phancoffee.vn
                      </div>
                    </div>
                  </div>

                  <div className='contact__info-item'>
                    <div className='contact__info-icon'>
                      <EnvironmentOutlined />
                    </div>
                    <div>
                      <div className='contact__info-label'>Địa chỉ</div>
                      <div className='contact__info-value'>
                        86 Lâm Tùng, Ia Chim, Kon Tum
                      </div>
                    </div>
                  </div>
                </div>

                <div className='contact__info-schedule'>
                  <p className='contact__info-schedule-title'>Giờ mở cửa</p>
                  <p className='contact__info-schedule-text'>
                    Thứ 2 - Chủ Nhật: 08:00 AM – 22:00 PM
                  </p>
                </div>

                <div className='contact__info-social'>
                  <span>Kết nối với chúng tôi:</span>
                  <div className='contact__info-social-dots'>
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* PHẦN BẢN ĐỒ Ở CUỐI TRANG */}
      <div className='contact__map-section'>
        <div className='contact__map-inner'>
          <div className='contact__map-visual'>
            <img
              src='https://lh3.googleusercontent.com/aida-public/AB6AXuBR77qCZS4YLYJ7Yn3jRd9x0Bg8uOkjOBqFIAA_qdps59-DvKEhL9_u8fG4lL2BuHyewafycmJPx-lvbtRS9VALLZnZMixYTplTk6he-SzvWtk97BZvNqJw0DG2LqEDgGypbuyfGkdiT8SqFeAFCdSWNFPALTE-r4WPuATb9TJubPpex47BW2fQBuiWZbL_yfWWYV0PolUS_Z1t0b8f-Ey_tkj_HLx-3t9Ivb_l95BV0OL6ITDpJsrYjwKFa34AzBQYr-FhxAF2PZJP'
              alt='Bản đồ khu vực Kon Tum'
            />

            <div className='contact__map-marker'>
              <EnvironmentOutlined />
              <span>Phan Coffee</span>
            </div>
          </div>

          <div className='contact__map-bottom'>
            <div className='contact__map-location'>
              <h4>Vị trí trung tâm</h4>
              <p>
                Tọa lạc tại trung tâm thành phố Kon Tum, dễ dàng tìm thấy và thuận
                tiện di chuyển.
              </p>
            </div>
            <Button
              type='default'
              className='contact__map-button'
              icon={<EnvironmentOutlined />}>
              Mở trên Google Maps
            </Button>
          </div>
        </div>
      </div>
    </section>
  );

  if (embedded) {
    return section;
  }

  return (
    <Layout className='contact-page'>
      <HeaderPage />
      <Content className='contact-page__content'>
        {section}
        <Chatbox />
      </Content>
      <FooterPage />
    </Layout>
  );
};

export default Contact;


