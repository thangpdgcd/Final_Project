import React from "react";
import { Form, Input, Button } from "antd";
import "./index.scss";

const Contact: React.FC = () => {
  const onFinish = (values: any) => {
    console.log("Form values:", values);
  };

  const destination = "14.23842836596,107.94136047363";
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    destination
  )}`;

  return (
    <div className='contact-container'>
      {/* Form */}
      <div className='contact-form'>
        <Form layout='vertical' onFinish={onFinish}>
          <Form.Item
            name='name'
            rules={[{ required: true, message: "Please enter your name" }]}>
            <Input placeholder='Name' />
          </Form.Item>

          <Form.Item
            name='email'
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Invalid email format" },
            ]}>
            <Input placeholder='Email' />
          </Form.Item>

          <Form.Item
            name='phone'
            rules={[{ required: true, message: "Please enter your phone" }]}>
            <Input placeholder='Phone Number' />
          </Form.Item>

          <Form.Item
            name='message'
            rules={[{ required: true, message: "Please enter your message" }]}>
            <Input.TextArea placeholder='Message' rows={4} />
          </Form.Item>

          <Form.Item>
            <Button type='primary' htmlType='submit' className='send-btn'>
              SEND
            </Button>
            {/* Nút chỉ đường */}
            <a
              href={directionsUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='direction-link'>
              <Button type='default' style={{ marginLeft: 10 }}>
                Chỉ đường
              </Button>
            </a>
          </Form.Item>
        </Form>
      </div>

      {/* Google Map */}
      <div className='contact-map'>
        <iframe
          title='Google Map'
          src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3834427.3343484714!2d105.5!3d14.238428!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3171f7cfb2e9b1b7%3A0x5c15e9d6c441ad87!2zVGF5IE5ndXllbg!5e0!3m2!1svi!2s!4v1695723852211!5m2!1svi!2s'
          width='100%'
          height='100%'
          allowFullScreen={true}
          loading='lazy'></iframe>
      </div>
    </div>
  );
};

export default Contact;
