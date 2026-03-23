import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { EnvironmentOutlined, PhoneOutlined, MailOutlined, ClockCircleOutlined } from '@ant-design/icons';

interface ContactForm {
  name: string;
  email: string;
  message: string;
}

const ContactPage: React.FC = () => {
  const [form] = Form.useForm<ContactForm>();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (_values: ContactForm) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    message.success('✅ Cảm ơn! Chúng tôi sẽ liên hệ bạn sớm nhất.');
    form.resetFields();
    setLoading(false);
  };

  const info = [
    { icon: <EnvironmentOutlined />, label: 'Địa chỉ', value: '86 Lâm Tùng, Ia Chim, TP. Kon Tum' },
    { icon: <PhoneOutlined />, label: 'Điện thoại', value: '+84 123 456 789' },
    { icon: <MailOutlined />, label: 'Email', value: 'hello@phancoffee.vn' },
    { icon: <ClockCircleOutlined />, label: 'Giờ làm việc', value: 'Thứ 2 - CN: 07:00 - 21:00' },
  ];

  return (
    <div>
      {/* Hero */}
      <div
        className="flex items-center justify-center py-20"
        style={{ background: 'linear-gradient(135deg, #4e3524, #6f4e37)' }}
      >
        <div className="text-center text-white">
          <p className="text-amber-300 text-xs font-semibold tracking-widest uppercase mb-2">Liên hệ</p>
          <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)' }}>Nói chuyện với chúng tôi</h1>
          <p className="text-amber-100 max-w-md mx-auto">Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-12">
        {/* Info */}
        <div>
          <h2 className="text-2xl font-bold text-[#4e3524] dark:text-amber-100 mb-6" style={{ fontFamily: 'var(--font-display)' }}>
            Thông tin liên hệ
          </h2>
          <div className="space-y-5">
            {info.map(item => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ background: '#6f4e37' }}>
                  {item.icon}
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">{item.label}</div>
                  <div className="font-medium text-[#4e3524] dark:text-gray-200">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-[#4e3524] dark:text-amber-100 mb-6">Gửi tin nhắn</h2>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item name="name" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
              <Input size="large" placeholder="Nguyễn Văn A" />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
              <Input size="large" placeholder="your@email.com" />
            </Form.Item>
            <Form.Item name="message" label="Tin nhắn" rules={[{ required: true, message: 'Vui lòng nhập tin nhắn' }]}>
              <Input.TextArea rows={4} placeholder="Nhập tin nhắn của bạn..." />
            </Form.Item>
            <Button
              htmlType="submit"
              type="primary"
              size="large"
              block
              loading={loading}
              style={{ background: '#6f4e37', borderColor: '#6f4e37' }}
            >
              Gửi tin nhắn
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
