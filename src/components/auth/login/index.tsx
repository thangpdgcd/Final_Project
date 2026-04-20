import React, { useState } from 'react';
import { Layout, Form, Input, Button, Checkbox, App, Divider } from 'antd';
import { FacebookFilled, InstagramFilled, ChromeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { login, LoginPayload, LoginResponse } from '../../../api/authApi';
import { useTranslation } from 'react-i18next';

import './index.scss';

import HeaderPage from '../../../components/layout/Header';
import FooterPage from '../../../components/layout/Footer';

const { Content } = Layout;

interface LoginFormValues extends LoginPayload {
  remember: boolean;
}

const LoginPage: React.FC = () => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const payload: LoginPayload = {
        email: values.email,
        password: values.password,
      };

      const data: LoginResponse = await login(payload);

      // Lưu token & user để header, guard, cart... nhận biết đăng nhập
      if (data?.token) {
        localStorage.setItem('token', data.token);
      }

      if ((data as any)?.user) {
        const user: any = (data as any).user;
        // Only allow roleID=1 to sign in to this user-facing app.
        const roleIdRaw = String(user?.roleID ?? user?.roleId ?? user?.role ?? '').trim();
        if (roleIdRaw !== '1') {
          localStorage.removeItem('token');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          localStorage.removeItem('user_ID');
          message.error(t('auth.roleNotAllowed'));
          return;
        }
        localStorage.setItem('user', JSON.stringify(user));

        const userId =
          user?.user_ID ?? user?.id ?? user?.userId ?? user?.data?.user_ID ?? user?.user?.user_ID;

        if (userId) {
          localStorage.setItem('user_ID', String(userId));
        }
      }

      message.success(`✅ ${t('auth.loginSuccess')}`);

      navigate('/', { replace: true });

      return (data as any).user;
    } catch {
      message.error(`❌ ${t('auth.loginError')}`);
    } finally {
      setLoading(false);
    }
  };

  const onSocialLogin = (provider: string) => {
    message.info(
      `🔒 ${t('auth.loginSocialInfo', {
        provider,
      })}`,
    );
  };

  return (
    <Layout className="login-layout">
      <HeaderPage />

      <Content className="login-content">
        <div className="login-hero">
          <div className="login-card">
            {/* LEFT */}
            <div className="login-left">
              <div className="brand-row">
                <img
                  src={`${process.env.PUBLIC_URL || ''}/logo_Web_Phan_Coffeess.png`}
                  alt="Phan Coffee"
                  className="brand-logo"
                />
                <div>
                  <div className="kicker">{t('auth.loginWelcome')}</div>
                  <div className="brand">{t('common.brandName')}</div>
                </div>
              </div>

              <div className="social-wrap">
                <Button
                  className="social-btn"
                  icon={<FacebookFilled />}
                  block
                  onClick={() => onSocialLogin('Facebook')}
                >
                  {t('auth.loginSocialFacebook')}
                </Button>

                <Button
                  className="social-btn"
                  icon={<ChromeOutlined />}
                  block
                  onClick={() => onSocialLogin('Google')}
                >
                  {t('auth.loginSocialGoogle')}
                </Button>

                <Button
                  className="social-btn"
                  icon={<InstagramFilled />}
                  block
                  onClick={() => onSocialLogin('Instagram')}
                >
                  {t('auth.loginSocialInstagram')}
                </Button>
              </div>

              <Divider className="divider">{t('auth.loginDivider')}</Divider>

              <Form<LoginFormValues>
                layout="vertical"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                className="login-form"
              >
                <Form.Item
                  label={t('auth.loginEmailLabel')}
                  name="email"
                  rules={[
                    { required: true, message: t('auth.loginEmailRequired') },
                    { type: 'email', message: t('auth.loginEmailInvalid') },
                  ]}
                >
                  <Input placeholder={t('auth.loginEmailPlaceholder')} />
                </Form.Item>

                <Form.Item
                  label={t('auth.loginPasswordLabel')}
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: t('auth.loginPasswordRequired'),
                    },
                  ]}
                >
                  <Input.Password
                    className="pc-password"
                    placeholder={t('auth.loginPasswordPlaceholder')}
                  />
                </Form.Item>

                <div className="row">
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>{t('auth.loginRememberMe')}</Checkbox>
                  </Form.Item>

                  <Button type="link" className="forgot">
                    {t('auth.loginForgotPassword')}
                  </Button>
                </div>

                <Button htmlType="submit" loading={loading} className="btn-login" block>
                  {t('auth.loginSubmit')}
                </Button>

                <Button type="link" className="btn-signup">
                  {t('auth.loginNoAccount')}
                </Button>
                <Button type="link" className="btn-register" onClick={() => navigate('/register')}>
                  {t('auth.loginRegister')}
                </Button>
              </Form>
            </div>

            {/* RIGHT */}
            <div className="login-right" />
          </div>
        </div>
      </Content>

      <FooterPage />
    </Layout>
  );
};

export default LoginPage;
