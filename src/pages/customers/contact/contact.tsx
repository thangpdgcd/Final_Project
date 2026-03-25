import React from "react";
import { Layout, Row, Col, Form, Input, Button } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  SendOutlined,
} from "@ant-design/icons";
import Chatbox from "../../../components/chatbox";
import HeaderPage from "../../../components/layout/Header";
import FooterPage from "../../../components/layout/Footer";
import { useTranslation } from "react-i18next";

type ContactProps = {
  embedded?: boolean;
};

const { TextArea } = Input;
const { Content } = Layout;

const formFieldClass =
  "[&_.ant-form-item-label>label]:text-[13px] [&_.ant-form-item-label>label]:font-semibold [&_.ant-form-item-label>label]:text-gray-600 " +
  "[&_.ant-input]:rounded-full [&_.ant-input]:border [&_.ant-input]:border-gray-200 [&_.ant-input]:bg-white [&_.ant-input]:px-[18px] [&_.ant-input]:py-3 [&_.ant-input]:text-gray-900 " +
  "[&_.ant-input-affix-wrapper]:rounded-full [&_.ant-input-affix-wrapper]:border [&_.ant-input-affix-wrapper]:border-gray-200 [&_.ant-input-affix-wrapper]:bg-white [&_.ant-input-affix-wrapper]:px-[18px] [&_.ant-input-affix-wrapper]:py-3 " +
  "[&_.ant-input-affix-wrapper-focused]:border-[#a0645a] [&_.ant-input-affix-wrapper-focused]:shadow-[0_0_0_2px_rgba(160,100,90,0.18)] " +
  "[&_.ant-input-prefix]:text-[#a0645a] [&_.ant-input::placeholder]:text-gray-400 " +
  "[&_textarea.ant-input]:min-h-[150px] [&_textarea.ant-input]:resize-none [&_textarea.ant-input]:rounded-[20px] " +
  "[&_.ant-form-item-explain-error]:text-xs [&_.ant-form-item-explain-error]:text-red-500";

const Contact: React.FC<ContactProps> = ({ embedded = false }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const heroBg = `${import.meta.env.BASE_URL}assets/img/loginbackground.jpg`;

  const handleFinish = (values: Record<string, unknown>) => {
    console.log("Contact form:", values);
  };

  const section = (
    <section className="min-h-screen bg-[#f7f7f6]">
      <div
        className="relative h-[360px] overflow-hidden rounded-b-[40px] bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-b from-slate-900/25 to-slate-900/65 px-6 pb-16 pt-[72px]">
          <div className="w-full max-w-[960px] text-gray-50">
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-gray-100/90">
              Liên hệ với Phan Coffee
            </p>
            <h1 className="mb-3 text-[42px] font-bold leading-tight">
              Chúng tôi luôn sẵn sàng lắng nghe
            </h1>
            <p className="max-w-[520px] text-[15px] text-gray-200">
              Chia sẻ với chúng tôi những trải nghiệm, ý kiến hoặc nhu cầu của
              bạn để Phan Coffee có thể mang đến hương vị cà phê và dịch vụ tốt
              hơn mỗi ngày.
            </p>
          </div>
        </div>
      </div>

      <div className="relative mx-auto -mt-[90px] max-w-[1160px] px-6 pb-[72px]">
        <div className="rounded-[28px] border border-[#f3e7de] bg-gradient-to-br from-[#fbf5f2] via-white to-[#fbf5f2] p-10 shadow-[0_38px_80px_rgba(15,23,42,0.24)] max-md:px-6 max-md:py-8 max-sm:px-5">
          <Row gutter={[48, 32]} align="top">
            <Col xs={24} lg={14}>
              <div className="max-w-[560px]">
                <h2 className="mb-2 text-[28px] font-bold">
                  Gửi tin nhắn cho chúng tôi
                </h2>
                <p className="mb-6 text-sm text-gray-500">
                  Đội ngũ Phan Coffee sẽ phản hồi trong vòng 24 giờ làm việc.
                </p>

                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleFinish}
                  className={formFieldClass}
                >
                  <Row gutter={[16, 0]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Họ và tên"
                        name="name"
                        rules={[
                          { required: true, message: "Vui lòng nhập họ và tên" },
                        ]}
                      >
                        <Input
                          prefix={<UserOutlined />}
                          placeholder={t("contact.form.namePlaceholder")}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Số điện thoại"
                        name="phone"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập số điện thoại",
                          },
                        ]}
                      >
                        <Input
                          prefix={<PhoneOutlined />}
                          placeholder="+84 000 000 000"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[16, 0]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                          { required: true, message: "Vui lòng nhập email" },
                          { type: "email", message: "Email không hợp lệ" },
                        ]}
                      >
                        <Input
                          prefix={<MailOutlined />}
                          placeholder="example@gmail.com"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="Chủ đề" name="subject">
                        <Input
                          placeholder={t("contact.form.subjectPlaceholder")}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    label="Nội dung tin nhắn"
                    name="message"
                    rules={[
                      { required: true, message: "Vui lòng nhập nội dung" },
                    ]}
                  >
                    <TextArea
                      rows={5}
                      maxLength={500}
                      showCount
                      placeholder={t(
                        "contact.form.customerMessagePlaceholder",
                      )}
                    />
                  </Form.Item>

                  <div className="mt-8 flex flex-col gap-5 max-sm:items-stretch">
                    <Button
                      htmlType="submit"
                      icon={<SendOutlined />}
                      className="!h-12 !rounded-full !border-none !bg-[#a0645a] !px-8 !font-semibold !text-white !shadow-[0_14px_30px_rgba(160,100,90,0.35)] hover:!-translate-y-px hover:!shadow-[0_18px_40px_rgba(160,100,90,0.45)]"
                    >
                      Gửi ngay
                    </Button>
                  </div>
                </Form>
              </div>
            </Col>

            <Col xs={24} lg={10}>
              <div className="rounded-3xl border border-gray-100 bg-white p-7 shadow-[0_20px_45px_rgba(15,23,42,0.08)] max-md:p-6">
                <p className="mb-2.5 text-[11px] font-normal uppercase tracking-[0.14em] text-gray-400">
                  Thông tin liên hệ
                </p>
                <h3 className="mb-2 text-xl font-bold text-gray-900">
                  Hãy cho chúng tôi biết suy nghĩ của bạn
                </h3>
                <p className="mb-[18px] text-[13px] text-gray-500">
                  Đội ngũ Phan Coffee sẽ phản hồi bạn trong thời gian sớm nhất.
                </p>

                <div className="mb-[18px] flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-[#a0645a]">
                      <PhoneOutlined />
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-gray-400">
                        Điện thoại
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        +84 123 456 789
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-[#a0645a]">
                      <MailOutlined />
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-gray-400">
                        Email
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        hello@phancoffee.vn
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-[#a0645a]">
                      <EnvironmentOutlined />
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-gray-400">
                        Địa chỉ
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        86 Lâm Tùng, Ia Chim, Kon Tum
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-1 border-t border-dashed border-gray-200 pt-3">
                  <p className="mb-1 text-xs uppercase tracking-[0.12em] text-gray-400">
                    Giờ mở cửa
                  </p>
                  <p className="text-[13px] text-gray-600">
                    Thứ 2 - Chủ Nhật: 08:00 AM – 22:00 PM
                  </p>
                </div>

                <div className="mt-[18px] flex items-center justify-between text-xs text-gray-500">
                  <span>Kết nối với chúng tôi:</span>
                  <div className="inline-flex gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-gray-200" />
                    <span className="h-2 w-2 rounded-full bg-gray-200" />
                    <span className="h-2 w-2 rounded-full bg-gray-200" />
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      <div className="px-6 pb-[72px]">
        <div className="relative mx-auto max-w-[1160px] overflow-hidden rounded-[32px] bg-gray-200 shadow-[0_30px_70px_rgba(15,23,42,0.24)]">
          <div className="relative min-h-[360px] overflow-hidden bg-emerald-100 max-md:min-h-[320px]">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBR77qCZS4YLYJ7Yn3jRd9x0Bg8uOkjOBqFIAA_qdps59-DvKEhL9_u8fG4lL2BuHyewafycmJPx-lvbtRS9VALLZnZMixYTplTk6he-SzvWtk97BZvNqJw0DG2LqEDgGypbuyfGkdiT8SqFeAFCdSWNFPALTE-r4WPuATb9TJubPpex47BW2fQBuiWZbL_yfWWYV0PolUS_Z1t0b8f-Ey_tkj_HLx-3t9Ivb_l95BV0OL6ITDpJsrYjwKFa34AzBQYr-FhxAF2PZJP"
              alt="Bản đồ khu vực Kon Tum"
              className="block h-full w-full object-cover"
            />

            <div className="absolute left-1/2 top-1/2 inline-flex -translate-x-1/2 -translate-y-[70%] items-center gap-2 rounded-full bg-white px-3.5 py-2.5 text-[13px] text-[#a0645a] shadow-[0_18px_40px_rgba(15,23,42,0.35)]">
              <EnvironmentOutlined className="!text-base" />
              <span>Phan Coffee</span>
            </div>
          </div>

          <div className="relative z-[2] flex flex-wrap items-center justify-between gap-6 bg-gradient-to-b from-slate-900/[0.02] to-slate-900/[0.06] px-6 py-5 max-md:flex-col max-md:items-stretch">
            <div className="max-w-[420px]">
              <h4 className="mb-1 text-sm font-bold text-gray-900">
                Vị trí trung tâm
              </h4>
              <p className="text-[13px] text-gray-600">
                Tọa lạc tại trung tâm thành phố Kon Tum, dễ dàng tìm thấy và
                thuận tiện di chuyển.
              </p>
            </div>
            <Button
              type="default"
              icon={<EnvironmentOutlined />}
              className="!h-10 !rounded-full !border-[#a0645a] !px-5 !text-[#a0645a]"
            >
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
    <Layout className="min-h-screen bg-[#f7f7f6]">
      <HeaderPage />
      <Content className="bg-transparent py-8 pb-10 pt-8">{section}</Content>
      <FooterPage />
      <Chatbox />
    </Layout>
  );
};

export default Contact;
