// src/pages/login/index.tsx
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

// ✅ import FooterPage (giống HomePage)
import FooterPage from "../footer/index";

const { Header, Content } = Layout;

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

      if (userId) localStorage.setItem("user_ID", String(userId));
      else localStorage.removeItem("user_ID");

      message.success("✅ Logged in successfully!");
      navigate("/");
    } catch (err: any) {
      message.error("❌ Incorrect email or password!");
    } finally {
      setLoading(false);
    }
  };

  const onSocialLogin = (provider: "facebook" | "google" | "instagram") => {
    message.info(`🔒 Continue with ${provider.toUpperCase()} (UI demo)`);
  };

  return (
    <Layout className='login-layout'>
      {/* ===== HEADER (match Home) ===== */}
      <Header className='pc-header pc-header--clean'>
        <div className='pc-header__left' onClick={() => navigate("/")}>
          <img className='pc-header__logo' src={logo} alt='Phan Coffee' />
          <span className='pc-header__brand'>Phan Coffee</span>
        </div>

        <div className='pc-header__center' />
        <div className='pc-header__right' />
      </Header>

      {/* ===== CONTENT ===== */}
      <Content className='login-content'>
        <div className='login-hero'>
          <div className='login-card'>
            {/* LEFT */}
            <div className='login-left'>
              <div className='brand-row'>
                <img src={logo} alt='Phan Coffee' className='brand-logo' />
                <div>
                  <div className='kicker'>WELCOME BACK</div>
                  <div className='brand'>PHAN COFFEE</div>
                </div>
              </div>

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
                    { required: true, message: "Please enter your email." },
                    {
                      type: "email",
                      message: "Please enter a valid email address.",
                    },
                  ]}>
                  <Input placeholder='you@example.com' />
                </Form.Item>

                <Form.Item
                  label='Password'
                  name='password'
                  rules={[
                    { required: true, message: "Please enter your password." },
                  ]}>
                  <Input.Password
                    className='pc-password'
                    placeholder='••••••••'
                  />
                </Form.Item>

                <div className='row'>
                  <Form.Item name='remember' valuePropName='checked' noStyle>
                    <Checkbox>Remember me</Checkbox>
                  </Form.Item>

                  <Button
                    type='link'
                    className='forgot'
                    onClick={() =>
                      message.info("Forgot password is not implemented yet.")
                    }>
                    Forgot password?
                  </Button>
                </div>

                <Button
                  htmlType='submit'
                  type='primary'
                  loading={loading}
                  className='btn-login'
                  block>
                  Log in
                </Button>

                <Button type='link' className='btn-signup'>
                  No account yet?{" "}
                </Button>
                <Button
                  type='link'
                  className='btn-register'
                  onClick={() => navigate("/register")}>
                  Register
                </Button>
              </Form>
            </div>

            {/* RIGHT */}
            <div className='login-right' />
          </div>
        </div>
      </Content>

      {/* ✅ FOOTER PAGE (same as Home) */}
      <FooterPage />
    </Layout>
  );
};

export default LoginPage;
