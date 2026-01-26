import React from "react";
import { Card, Carousel, Button } from "antd";
import { useNavigate } from "react-router-dom";

import bannerrobusta from "../../../../src/assets/img/robustaphancoffee.png";
import bannerarabica from "../../../../src/assets/img/robustaphancoffee.png";
import bannerhoney from "../../../../src/assets/img/robustaphancoffee.png";

import "./index.scss";

const { Meta } = Card;

const ContentBanner: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className='best-sellers'>
      <h2 className='section-title'>Best Sellers</h2>
      <p className='section-subtitle'>
        Signature coffees carefully roasted by Phan Coffee.
      </p>

      <div className='best-sellers__grid'>
        {[1, 2, 3].map((item) => (
          <Card
            key={item}
            hoverable
            className='product-card'
            cover={
              <Carousel autoplay>
                <img className='img-banner' src={bannerrobusta} alt='robusta' />
                <img className='img-banner' src={bannerarabica} alt='arabica' />
                <img className='img-banner' src={bannerhoney} alt='honey' />
              </Carousel>
            }>
            <Meta
              title='MANG DEN BLEND'
              description='A balanced blend from the Phan Coffee.'
            />

            <div className='product-card__footer'>
              <span className='product-card__price'>₫180,000</span>
              <Button
                type='primary'
                size='small'
                onClick={() => navigate("/products")}>
                Add to cart
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default ContentBanner;
