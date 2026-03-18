import React from "react";
import { useNavigate } from "react-router-dom";

import "./index.scss";

const FeaturedProductSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className='featured-product'>
      <div className='featured-product__container'>
        <div className='featured-product__grid'>
          <div className='featured-product__media'>
            <div className='featured-product__media-inner'>
              <img
                src='https://res.cloudinary.com/dfjecxrnl/image/upload/v1768211093/arabicamangden4_ymrrpn.jpg'
                alt='Măng Đen Blend'
                loading='lazy'
              />
              <div className='featured-product__badge'>Best Seller</div>
            </div>
          </div>

          <div className='featured-product__content'>
            <p className='featured-product__eyebrow'>Sản phẩm nổi bật</p>
            <h2 className='featured-product__title'>Măng Đen Blend</h2>
            <p className='featured-product__quote'>
              “Sự hòa quyện tuyệt vời giữa vị đắng thanh thoát và hương thơm nồng nàn từ đại
              ngàn Tây Nguyên. Một hành trình cảm xúc trong từng ngụm cà phê.”
            </p>

            <ul className='featured-product__bullets'>
              <li>
                <span className='featured-product__dot' aria-hidden='true' />
                100% Cà phê rang mộc tự nhiên
              </li>
              <li>
                <span className='featured-product__dot' aria-hidden='true' />
                Nguồn gốc: Vùng núi Măng Đen, Kon Tum
              </li>
              <li>
                <span className='featured-product__dot' aria-hidden='true' />
                Hương vị: Socola, Caramel, Thảo mộc
              </li>
            </ul>

            <div className='featured-product__bottom'>
              <div className='featured-product__price'>285.000đ</div>
              <button className='featured-product__cta' onClick={() => navigate("/products")}>
                Thêm vào giỏ hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductSection;

