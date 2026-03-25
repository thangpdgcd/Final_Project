import React from 'react';
import { App, Form, Input, Button } from 'antd';
import { EnvironmentOutlined, PhoneOutlined, MailOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface ContactForm {
  name: string;
  email: string;
  message: string;
}

const ContactPage: React.FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm<ContactForm>();
  const [loading, setLoading] = React.useState(false);
  const { t } = useTranslation();

  const onFinish = async (_values: ContactForm) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    message.success(t('contact.success'));
    form.resetFields();
    setLoading(false);
  };

  const info = [
    {
      icon: <EnvironmentOutlined />,
      label: t('contact.addressLabel'),
      value: t('footer.contact.address'),
    },
    {
      icon: <PhoneOutlined />,
      label: t('contact.phoneLabel'),
      value: t('footer.contact.phone'),
    },
    {
      icon: <MailOutlined />,
      label: t('contact.emailLabel'),
      value: t('footer.contact.email'),
    },
    {
      icon: <ClockCircleOutlined />,
      label: t('contact.hoursLabel'),
      value: t('footer.contact.hours'),
    },
  ];

  return (
    <div>
      {/* Hero */}
      <div
        className="flex items-center justify-center py-20"
        style={{ background: 'linear-gradient(135deg, #4e3524, #6f4e37)' }}
      >
        <div className="text-center text-white">
          <p className="text-amber-300 text-xs font-semibold tracking-widest uppercase mb-2">
            {t('contact.heroLabel')}
          </p>
          <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)' }}>
            {t('contact.heroTitle')}
          </h1>
          <p className="text-amber-100 max-w-md mx-auto">{t('contact.heroSubtitle')}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-12">
        {/* Info */}
        <div>
          <h2 className="text-2xl font-bold text-[#4e3524] dark:text-amber-100 mb-6" style={{ fontFamily: 'var(--font-display)' }}>
            {t('contact.form.infoTitle')}
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
          <h2 className="text-xl font-bold text-[#4e3524] dark:text-amber-100 mb-6">
            {t('contact.form.title')}
          </h2>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="name"
              label={t('contact.form.nameLabel')}
              rules={[
                { required: true, message: t('contact.form.nameRequired') },
              ]}
            >
              <Input size="large" placeholder={t('contact.form.namePlaceholder')} />
            </Form.Item>
            <Form.Item
              name="email"
              label={t('contact.form.emailLabel')}
              rules={[
                { required: true, type: 'email', message: t('contact.form.emailInvalid') },
              ]}
            >
              <Input size="large" placeholder={t('contact.form.emailPlaceholder')} />
            </Form.Item>
            <Form.Item
              name="message"
              label={t('contact.form.messageLabel')}
              rules={[
                { required: true, message: t('contact.form.messageRequired') },
              ]}
            >
              <Input.TextArea rows={4} placeholder={t('contact.form.messagePlaceholder')} />
            </Form.Item>
            <Button
              htmlType="submit"
              type="primary"
              size="large"
              block
              loading={loading}
              style={{ background: '#6f4e37', borderColor: '#6f4e37' }}
            >
              {t('contact.form.submit')}
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
