import React, { useState } from "react";
import {
  Layout,
  Form,
  Input,
  Button,
  Checkbox,
  message,
  Menu,
  Dropdown,
} from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { login, LoginPayload, LoginResponse } from "../../api/authApi"; // ✅ đổi apiLogin -> login

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

      const data: LoginResponse = await login(payload); // ✅ dùng login POST
      localStorage.setItem("token", data.token);

      message.success("✅ Đăng nhập thành công!");
      navigate("/");
    } catch (err: any) {
      console.error("Lỗi đăng nhập:", err.message);
      message.error("❌ Đăng nhập thất bại. Vui lòng kiểm tra email/mật khẩu!");
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Form submit failed:", errorInfo);
  };

  const menu = (
    <Menu
      items={[
        {
          key: "1",
          label: <span onClick={() => navigate("/login")}>Sign In</span>,
        },
        {
          key: "2",
          label: <span onClick={() => navigate("/register")}>Sign Up</span>,
        },
      ]}
    />
  );

  return (
    <Layout className='login-layout'>
      {/* HEADER */}
      <Header className='homepage__header'>
        <div className='header-left'>
          <div className='homepage__logo' onClick={() => navigate("/")}>
            <img src={logo} alt='Phan Coffee' />
            <span className='icon'>Phan Coffee</span>
          </div>

          <Menu
            mode='horizontal'
            overflowedIndicator={false}
            items={[{ key: "home", label: "Home" }]}
            onClick={(e) => e.key === "home" && navigate("/")}
          />
        </div>

        <Dropdown overlay={menu} trigger={["click"]}>
          <Button>
            User <DownOutlined />
          </Button>
        </Dropdown>
      </Header>

      {/* CONTENT */}
      <Content className='login-content'>
        <div className='login-form-container'>
          <h2 className='login-title'>Đăng nhập</h2>

          <Form<LoginFormValues>
            name='login'
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete='off'
            className='login-form'>
            <Form.Item
              label='Email'
              name='email'
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}>
              <Input />
            </Form.Item>

            <Form.Item
              label='Mật khẩu'
              name='password'
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}>
              <Input.Password />
            </Form.Item>

            <Form.Item
              name='remember'
              valuePropName='checked'
              wrapperCol={{ offset: 8, span: 16 }}>
              <Checkbox>Ghi nhớ đăng nhập</Checkbox>
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button type='primary' htmlType='submit' loading={loading}>
                Đăng nhập
              </Button>
              <Button
                type='link'
                onClick={() => navigate("/register")}
                style={{ marginLeft: 8 }}>
                Chưa có tài khoản? Đăng ký
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Content>

      {/* FOOTER */}
      <Footer className='login-footer'>
        © {new Date().getFullYear()} Phan Coffee. All Rights Reserved.
      </Footer>
    </Layout>
  );
};

export default LoginPage;
