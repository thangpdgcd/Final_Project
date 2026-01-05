import React, { useState } from "react";
import { Layout, Form, Input, Button, Checkbox, message, Divider } from "antd";
import {
  FacebookFilled,
  InstagramFilled,
  ChromeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { login, LoginPayload, LoginResponse } from "../../api/authApi";

import logo from "../../../src/assets/img/logo_PhanCoffee.jpg";
import "./index.scss";

const { Header, Content, Footer } = Layout;

interface LoginFormValues extends LoginPayload {
  remember: boolean;
}

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const payload: LoginPayload = {
        email: values.email,
        password: values.password,
      };

      const data: LoginResponse = await login(payload);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));

      const userId =
        (data as any)?.user_ID ??
        (data as any)?.data?.user_ID ??
        (data as any)?.user?.user_ID ??
        (data as any)?.user?.id ??
        (data as any)?.id;

      if (userId) {
        localStorage.setItem("user_ID", String(userId));
      } else {
        localStorage.removeItem("user_ID");
      }

      message.success("✅ Đăng nhập thành công!");
      navigate("/");
    } catch (err: any) {
      message.error("❌ Sai email hoặc mật khẩu!");
    } finally {
      setLoading(false);
    }
  };

  const onSocialLogin = (provider: "facebook" | "google" | "instagram") => {
    message.info(`🔒 Đăng nhập bằng ${provider.toUpperCase()} (UI demo)`);
  };

  return (
    <Layout className='login-layout'>
      <Header className='pc-header pc-header--clean'>
        <div className='pc-header__left' onClick={() => navigate("/")}>
          <img className='pc-header__logo' src={logo} alt='Phan Coffee' />
          <span className='pc-header__brand'>Phan Coffee</span>
        </div>

        <div className='pc-header__center' />

        <div className='pc-header__right' />
      </Header>

      <Content className='login-content'>
        <div className='login-hero'>
          <div className='login-card'>
            <div className='login-left'>
              <div className='brand-row'>
                <img src={logo} alt='Phan Coffee' className='brand-logo' />
                <div>
                  <div className='kicker'>WELCOME BACK</div>
                  <div className='brand'>PHAN COFFEE</div>
                </div>
              </div>

              <div className='headline'>
                <span className='accent'>SPECIAL</span>
                <span className='title'>COFFEE</span>
              </div>

              <p className='sub'>
                It is a good time for the great taste of coffee.
              </p>

              <div className='social-wrap'>
                <Button
                  className='social-btn'
                  onClick={() => onSocialLogin("facebook")}
                  icon={<FacebookFilled />}
                  block>
                  Continue with Facebook
                </Button>

                <Button
                  className='social-btn'
                  onClick={() => onSocialLogin("google")}
                  icon={<ChromeOutlined />}
                  block>
                  Continue with Google
                </Button>

                <Button
                  className='social-btn'
                  onClick={() => onSocialLogin("instagram")}
                  icon={<InstagramFilled />}
                  block>
                  Continue with Instagram
                </Button>
              </div>

              <Divider className='divider'>or sign in with email</Divider>

              <Form<LoginFormValues>
                layout='vertical'
                initialValues={{ remember: true }}
                onFinish={onFinish}
                className='login-form'>
                <Form.Item
                  label='Email'
                  name='email'
                  rules={[
                    { required: true, message: "Vui lòng nhập email" },
                    { type: "email", message: "Email không hợp lệ" },
                  ]}>
                  <Input placeholder='you@example.com' />
                </Form.Item>

                <Form.Item
                  label='Mật khẩu'
                  name='password'
                  rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu" },
                  ]}>
                  <Input.Password
                    className='pc-password'
                    placeholder='••••••••'
                  />
                </Form.Item>

                <div className='row'>
                  <Form.Item name='remember' valuePropName='checked' noStyle>
                    <Checkbox>Ghi nhớ</Checkbox>
                  </Form.Item>

                  <Button
                    type='link'
                    className='forgot'
                    onClick={() =>
                      message.info("Chưa làm chức năng quên mật khẩu")
                    }>
                    Quên mật khẩu?
                  </Button>
                </div>

                <Button
                  htmlType='submit'
                  type='primary'
                  loading={loading}
                  className='btn-login'
                  block>
                  Đăng nhập
                </Button>

                <Button
                  type='link'
                  className='btn-signup'
                  onClick={() => navigate("/register")}>
                  Chưa có tài khoản? Đăng ký
                </Button>

                <div className='badge'>
                  <span className='dot' />
                  Express Delivery • 1900 9999
                </div>
              </Form>
            </div>

            <div className='login-right' />
          </div>
        </div>
      </Content>

      <Footer className='login-footer'>
        <div className='login-footer__inner'>
          <span>© {new Date().getFullYear()} Phan Coffee</span>
          <span className='sep'>•</span>
          <span>All Rights Reserved</span>
        </div>
      </Footer>
    </Layout>
  );
};

export default LoginPage;
