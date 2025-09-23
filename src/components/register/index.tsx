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
import { register, RegisterPayload, RegisterResponse } from "../../api/authApi";
import { useNavigate } from "react-router-dom";
import { DownOutlined } from "@ant-design/icons";
import logo from "../../../src/assets/img/logo_PhanCoffee.jpg";
import "./index.scss";

const { Header, Content, Footer } = Layout;

interface RegisterFormValues extends RegisterPayload {
  confirmPassword: string;
  agree: boolean;
}

const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  // 🔹 Xử lý submit form
  const onFinish = async (values: RegisterFormValues) => {
    setLoading(true);
    try {
      const payload: RegisterPayload = {
        name: values.name,
        email: values.email,
        address: values.address,
        phoneNumber: values.phoneNumber,
        password: values.password,
        roleID: "1", // giả sử mặc định role là user
      };

      const data: RegisterResponse = await register(payload);
      console.log("✅ Register success:", data);

      message.success("✅ Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (err: any) {
      console.error("❌ Error Sign Up:", err.message);
      message.error("❌ Đăng ký thất bại. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Dropdown menu
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
    <Layout className='register-layout'>
      {/* HEADER */}
      <Header className='homepage__header'>
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

        <Dropdown overlay={menu} trigger={["click"]}>
          <Button>
            User <DownOutlined />
          </Button>
        </Dropdown>
      </Header>

      {/* CONTENT */}
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

      {/* FOOTER */}
      <Footer className='register-footer'>
        © {new Date().getFullYear()} Phan Coffee. All Rights Reserved.
      </Footer>
    </Layout>
  );
};

export default RegisterPage;
