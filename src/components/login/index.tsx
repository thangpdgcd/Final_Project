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

import HeaderPage from "../header";
import FooterPage from "../footer";

const { Content } = Layout;

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

      message.success("✅ Logged in successfully!");
      navigate("/");
    } catch {
      message.error("❌ Incorrect email or password!");
    } finally {
      setLoading(false);
    }
  };

  const onSocialLogin = (provider: string) => {
    message.info(`🔒 Continue with ${provider} (UI demo)`);
  };

  return (
    <Layout className='login-layout'>
      <HeaderPage />

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
                  icon={<FacebookFilled />}
                  block
                  onClick={() => onSocialLogin("Facebook")}>
                  Continue with Facebook
                </Button>

                <Button
                  className='social-btn'
                  icon={<ChromeOutlined />}
                  block
                  onClick={() => onSocialLogin("Google")}>
                  Continue with Google
                </Button>

                <Button
                  className='social-btn'
                  icon={<InstagramFilled />}
                  block
                  onClick={() => onSocialLogin("Instagram")}>
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
                    { type: "email", message: "Invalid email format." },
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

                  <Button type='link' className='forgot'>
                    Forgot password?
                  </Button>
                </div>

                <Button
                  htmlType='submit'
                  loading={loading}
                  className='btn-login'
                  block>
                  Log in
                </Button>

                <Button type='link' className='btn-signup'>
                  No account yet?
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

      <FooterPage />
    </Layout>
  );
};

export default LoginPage;
