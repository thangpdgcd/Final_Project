// src/pages/register/index.tsx
import React, { useState } from "react";
import { Layout, Form, Input, Button, Checkbox, App, Divider } from "antd";
import { useNavigate } from "react-router-dom";
import {
  register,
  RegisterPayload,
  RegisterResponse,
} from "../../../api/authApi";
import "./index.scss";
import HeaderPage from "../../../components/layout/Header";
// ✅ Footer same as Home/Login
import FooterPage from "../../../components/layout/Footer";
import { useTranslation } from "react-i18next";

const logo = `${process.env.PUBLIC_URL || ""}/logo_Web_Phan_Coffeess.png`;

const { Content } = Layout;

interface RegisterFormValues extends RegisterPayload {
  confirmPassword: string;
  agree: boolean;
}

const RegisterPage: React.FC = () => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

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

      message.success(`✅ ${t("auth.registerSuccess")}`);
      navigate("/login");
    } catch (err: any) {
      console.error("❌ Register error:", err?.message || err);
      message.error(`❌ ${t("auth.registerError")}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className='register-layout'>
      {/* ===== HEADER (same as Login/Home) ===== */}

      <HeaderPage />

      {/* ===== CONTENT ===== */}
      <Content className='register-content'>
        <div className='register-hero'>
          <div className='register-card'>
            {/* LEFT */}
            <div className='register-left'>
              <div className='brand-row'>
                <img src={logo} alt='Phan Coffee' className='brand-logo' />
                <div>
                  <div className='kicker'>{t("auth.registerTitle")}</div>
                  <div className='brand'>{t("common.brandName")}</div>
                </div>
              </div>

              <Divider className='divider'>
                {t("auth.registerDivider")}
              </Divider>

              <Form<RegisterFormValues>
                layout='vertical'
                initialValues={{ agree: true }}
                onFinish={onFinish}
                className='register-form'
                autoComplete='off'>
                <Form.Item
                  label={t("auth.registerFullNameLabel")}
                  name='name'
                  rules={[
                    {
                      required: true,
                      message: t("auth.registerFullNameRequired"),
                    },
                  ]}>
                  <Input placeholder={t("auth.registerFullNamePlaceholder")} />
                </Form.Item>

                <Form.Item
                  label={t("auth.registerEmailLabel")}
                  name='email'
                  rules={[
                    {
                      required: true,
                      message: t("auth.registerEmailRequired"),
                    },
                    { type: "email", message: t("auth.registerEmailInvalid") },
                  ]}>
                  <Input placeholder='you@example.com' />
                </Form.Item>

                <div className='grid-2'>
                  <Form.Item
                    label={t("auth.registerPhoneLabel")}
                    name='phoneNumber'>
                    <Input placeholder='0xxxxxxxxx' />
                  </Form.Item>

                  <Form.Item label={t("auth.registerAddressLabel")} name='address'>
                    <Input placeholder={t("auth.registerAddressPlaceholder")} />
                  </Form.Item>
                </div>

                <Form.Item
                  label={t("auth.registerPasswordLabel")}
                  name='password'
                  rules={[
                    {
                      required: true,
                      message: t("auth.registerPasswordRequired"),
                    },
                  ]}
                  hasFeedback>
                  <Input.Password
                    className='pc-password'
                    placeholder='••••••••'
                  />
                </Form.Item>

                <Form.Item
                  label={t("auth.registerConfirmPasswordLabel")}
                  name='confirmPassword'
                  dependencies={["password"]}
                  hasFeedback
                  rules={[
                    {
                      required: true,
                      message: t("auth.registerConfirmPasswordRequired"),
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error(
                            t("auth.registerConfirmPasswordNotMatch"),
                          ),
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
                                t("auth.registerAgreeRequired"),
                              ),
                            ),
                      },
                    ]}
                    noStyle>
                    <Checkbox>{t("auth.registerAgreeLabel")}</Checkbox>
                  </Form.Item>

                  <Button
                    type='link'
                    className='to-login'
                    onClick={() => navigate("/login")}>
                    {t("auth.registerAlreadyHaveAccount")}
                  </Button>
                </div>

                <Button
                  htmlType='submit'
                  type='primary'
                  loading={loading}
                  className='btn-register-primary'
                  block>
                  {t("auth.registerSubmit")}
                </Button>

                <Button type='link' className='btn-signin'>
                  {t("auth.registerAlreadyHaveAccount")}
                </Button>
                <Button
                  type='link'
                  className='btn-login'
                  onClick={() => navigate("/login")}>
                  {t("auth.registerGotoLogin")}
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
