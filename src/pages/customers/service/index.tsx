import React from "react";
import { Row, Col, Card, Button } from "antd";
import { CoffeeOutlined } from "@ant-design/icons";
import "./index.scss";

const ServicesSection: React.FC = () => {
  const services = [
    {
      title: "Original Coffee",
      desc: "Exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea",
      type: "brown",
    },
    {
      title: "20 Coffee Flavors",
      desc: "Exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea",
      type: "dark",
    },
    {
      title: "Pleasant Abient",
      desc: "Exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea",
      type: "brown",
    },
  ];

  return (
    <div className='services-section'>
      <h1 className='title'>Services Phan Coffee</h1>
      <p className='subtitle'>
        The people in the Phan Coffee of Kon Tum, especially my village of Dak
        Ha Commune, are the ones that grow the coffee trees for the Phan Coffee
        brand. After roughly five years of cultivation, the coffee is often
        picked by the public. The Phan Coffee plant then processes the coffee to
        create the greatest goods for consumers. of Phan Coffee{" "}
      </p>

      <Row gutter={[24, 24]} justify='center'>
        {services.map((service, index) => (
          <Col xs={24} sm={12} md={8} key={index}>
            <Card
              className={`service-card ${service.type}`}
              cover={<CoffeeOutlined className='icon' />}>
              <h3>{service.title}</h3>
              <p>{service.desc}</p>
              <Button className='btn'>READ MORE</Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ServicesSection;
