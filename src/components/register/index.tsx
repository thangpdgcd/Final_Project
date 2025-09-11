import React, { useState } from "react";
import { Layout, Form, Input, Button, Checkbox, message } from "antd";
import { register, RegisterPayload, RegisterResponse } from "../../api/authApi";
import { useNavigate } from "react-router-dom";

const { Header, Content, Footer } = Layout;

interface RegisterFormValues extends RegisterPayload {
  confirmPassword: string;
  agree: boolean;
}

const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
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
        roleID: "1",
      };

      const data: RegisterResponse = await register(payload);
      console.log("checkdata------", data);
      message.success("✅ login successfully! Please, Can You Login.");
      navigate("/login");
    } catch (err: any) {
      console.error("❌ Error Sign Up:", err.message);
      message.error(`❌ Sign Up Fail: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className='register-layout'>
      <Header className='register-header'>
        <div
          onClick={() => navigate("/")}
          style={{
            color: "white",
            fontSize: 20,
            fontWeight: "bold",
            cursor: "pointer",
          }}>
          MyApp
        </div>
      </Header>

      <Content className='register-content'>
        <div className='register-form-container'>
          <h2 className='register-title'>Đăng ký tài khoản</h2>
          <Form<RegisterFormValues>
            name='register'
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            initialValues={{ agree: true }}
            onFinish={onFinish}
            autoComplete='off'
            className='register-form'>
            <Form.Item
              label='Họ tên'
              name='name'
              rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}>
              <Input />
            </Form.Item>

            <Form.Item
              label='Email'
              name='email'
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}>
              <Input />
            </Form.Item>

            <Form.Item label='Địa chỉ' name='address'>
              <Input />
            </Form.Item>

            <Form.Item label='Số điện thoại' name='phoneNumber'>
              <Input />
            </Form.Item>

            <Form.Item
              label='Mật khẩu'
              name='password'
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
              hasFeedback>
              <Input.Password />
            </Form.Item>

            <Form.Item
              label='Xác nhận'
              name='confirmPassword'
              dependencies={["password"]}
              hasFeedback
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu xác nhận không khớp!")
                    );
                  },
                }),
              ]}>
              <Input.Password />
            </Form.Item>

            <Form.Item
              name='agree'
              valuePropName='checked'
              wrapperCol={{ offset: 8, span: 16 }}
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(new Error("Bạn phải đồng ý điều khoản")),
                },
              ]}>
              <Checkbox>Tôi đồng ý với điều khoản sử dụng</Checkbox>
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button type='primary' htmlType='submit' loading={loading}>
                Đăng ký
              </Button>
              <Button
                type='link'
                onClick={() => navigate("/login")}
                style={{ marginLeft: 8 }}>
                Đã có tài khoản? Đăng nhập
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Content>

      <Footer className='register-footer'>© 2025 My App</Footer>
    </Layout>
  );
};

export default RegisterPage;
