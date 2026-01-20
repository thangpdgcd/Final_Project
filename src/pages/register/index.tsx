// src/pages/register/index.tsx
import React, { useState } from "react";
import { Layout, Form, Input, Button, Checkbox, message, Divider } from "antd";
import { useNavigate } from "react-router-dom";
import { register, RegisterPayload, RegisterResponse } from "../../api/authApi";

import logo from "../../../src/assets/img/logo_PhanCoffee.jpg";
import "./index.scss";

// ✅ Footer same as Home/Login
import FooterPage from "../footer/index";

const { Header, Content } = Layout;

interface RegisterFormValues extends RegisterPayload {
  confirmPassword: string;
  agree: boolean;
}

const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: RegisterFormValues) => {
    setLoading(true);
    try {
      const payload: RegisterPayload = {
        name: values.name,
        email: values.email,
        address: values.address,
        phoneNumber: values.phoneNumber,
        password: values.password,
        roleID: "1", // default user role
      };

      const data: RegisterResponse = await register(payload);
      console.log("✅ Register success:", data);

      message.success("✅ Registration successful! Please log in.");
      navigate("/login");
    } catch (err: any) {
      console.error("❌ Register error:", err?.message || err);
      message.error("❌ Registration failed. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className='register-layout'>
      {/* ===== HEADER (same as Login/Home) ===== */}
      <Header className='pc-header pc-header--clean'>
        <div className='pc-header__left' onClick={() => navigate("/")}>
          <img className='pc-header__logo' src={logo} alt='Phan Coffee' />
          <span className='pc-header__brand'>Phan Coffee</span>
        </div>

        <div className='pc-header__center' />
        <div className='pc-header__right' />
      </Header>

      {/* ===== CONTENT ===== */}
      <Content className='register-content'>
        <div className='register-hero'>
          <div className='register-card'>
            {/* LEFT */}
            <div className='register-left'>
              <div className='brand-row'>
                <img src={logo} alt='Phan Coffee' className='brand-logo' />
                <div>
                  <div className='kicker'>CREATE ACCOUNT</div>
                  <div className='brand'>PHAN COFFEE</div>
                </div>
              </div>

              <Divider className='divider'>sign up with email</Divider>

              <Form<RegisterFormValues>
                layout='vertical'
                initialValues={{ agree: true }}
                onFinish={onFinish}
                className='register-form'
                autoComplete='off'>
                <Form.Item
                  label='Full Name'
                  name='name'
                  rules={[
                    { required: true, message: "Please enter your full name!" },
                  ]}>
                  <Input placeholder='John Doe' />
                </Form.Item>

                <Form.Item
                  label='Email'
                  name='email'
                  rules={[
                    { required: true, message: "Please enter your email!" },
                    { type: "email", message: "Invalid email address!" },
                  ]}>
                  <Input placeholder='you@example.com' />
                </Form.Item>

                <div className='grid-2'>
                  <Form.Item label='Phone Number' name='phoneNumber'>
                    <Input placeholder='0xxxxxxxxx' />
                  </Form.Item>

                  <Form.Item label='Address' name='address'>
                    <Input placeholder='e.g. 123 ABC Street, District 1' />
                  </Form.Item>
                </div>

                <Form.Item
                  label='Password'
                  name='password'
                  rules={[
                    { required: true, message: "Please enter your password!" },
                  ]}
                  hasFeedback>
                  <Input.Password
                    className='pc-password'
                    placeholder='••••••••'
                  />
                </Form.Item>

                <Form.Item
                  label='Confirm Password'
                  name='confirmPassword'
                  dependencies={["password"]}
                  hasFeedback
                  rules={[
                    {
                      required: true,
                      message: "Please confirm your password!",
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("Passwords do not match!"),
                        );
                      },
                    }),
                  ]}>
                  <Input.Password
                    className='pc-password'
                    placeholder='••••••••'
                  />
                </Form.Item>

                <div className='row'>
                  <Form.Item
                    name='agree'
                    valuePropName='checked'
                    rules={[
                      {
                        validator: (_, value) =>
                          value
                            ? Promise.resolve()
                            : Promise.reject(
                                new Error(
                                  "You must agree to the terms and conditions",
                                ),
                              ),
                      },
                    ]}
                    noStyle>
                    <Checkbox>I agree to the terms and conditions</Checkbox>
                  </Form.Item>

                  <Button
                    type='link'
                    className='to-login'
                    onClick={() => navigate("/login")}>
                    Already have an account?
                  </Button>
                </div>

                <Button
                  htmlType='submit'
                  type='primary'
                  loading={loading}
                  className='btn-register-primary'
                  block>
                  Sign Up
                </Button>

                <Button type='link' className='btn-signin'>
                  Already have an account?{" "}
                </Button>
                <Button
                  type='link'
                  className='btn-login'
                  onClick={() => navigate("/login")}>
                  Log In
                </Button>
              </Form>
            </div>

            {/* RIGHT */}
            <div className='register-right' />
          </div>
        </div>
      </Content>

      {/* ===== FOOTER ===== */}
      <FooterPage />
    </Layout>
  );
};

export default RegisterPage;
