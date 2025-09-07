import React, { useState } from "react";
import { Layout, Form, Input, Button, Checkbox, message } from "antd";
import { login, LoginPayload, LoginResponse } from "../../api/authApi";
import { useNavigate } from "react-router-dom"; // ✅ import thêm

const { Header, Content, Footer } = Layout;

interface LoginFormValues extends LoginPayload {
  remember: boolean;
}

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate(); // ✅ khai báo hook navigate

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const payload: LoginPayload = {
        email: values.email,
        password: values.password,
      };

      const data: LoginResponse = await login(payload);
      localStorage.setItem("token", data.token);

      message.success("✅ Đăng nhập thành công!");
      // Ví dụ sau khi login thành công thì chuyển về home:
      navigate("/");
    } catch (err: any) {
      console.error("Lỗi đăng nhập:", err.message);
      message.error(`❌ Đăng nhập thất bại: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Layout className='login-layout'>
      <Header className='login-header'>
        <div
          onClick={() => navigate("/")} // ✅ click logo -> về home
          style={{
            color: "white",
            fontSize: 20,
            fontWeight: "bold",
            cursor: "pointer",
          }}>
          MyApp
        </div>
      </Header>

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
              rules={[{ required: true, message: "Vui lòng nhập email!" }]}>
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
            </Form.Item>
          </Form>
        </div>
      </Content>

      <Footer className='login-footer'>© 2025 My App</Footer>
    </Layout>
  );
};

export default LoginPage;
