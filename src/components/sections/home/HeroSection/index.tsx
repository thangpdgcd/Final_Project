import React from "react";
import { useNavigate } from "react-router-dom";

import "./index.scss";

type Props = {
  onScrollNext?: () => void;
};

const HeroSection: React.FC<Props> = ({ onScrollNext }) => {
  const navigate = useNavigate();

  return (
    <section className='hero'>
      <div className='hero__bg' aria-hidden='true'>
        <div className='hero__overlay' />
        <img
          className='hero__bg-image'
          src='https://lh3.googleusercontent.com/aida-public/AB6AXuBhJYQ5RfhX69hHm3r4dgF_EUyAX6-caHqVsfHEUPDuQ24LSeARgR5pSL_tiEmQx-JLf-gIDWDxDE8nOIQ2Wctq0YtjVyUaoWw59NAbLenNZuXpZHACzgbxZTTsA1gI11H7Pesj4nYu9a5_tg9RUgTsigZg7Uof0RZF56-cNGZ9RsXVIpb6kpuyvRi4UsBpYzX8wGyrmmbNZwiXhsHMkAtaBlOKzYOVJkZMNiIoHjaeYsH-1VFQN0YL7cOaVb5NyTO8pvmZPgqrvZD0'
          alt=''
          loading='eager'
        />
      </div>

      <div className='hero__container'>
        <div className='hero__content'>
          <span className='hero__badge'>TỪ ĐẠI NGÀN KON TUM</span>
          <h1 className='hero__title'>
            Cà phê <br />
            <span>rang mộc</span>
          </h1>
          <p className='hero__subtitle'>
            Thưởng thức tinh hoa từ đại ngàn qua từng hạt cà phê được chọn lọc thủ công và
            rang xay theo bí quyết truyền thống.
          </p>
          <div className='hero__actions'>
            <button className='hero__btn hero__btn--primary' onClick={() => navigate("/products")}>
              Khám phá ngay
            </button>
            <button className='hero__btn hero__btn--ghost' onClick={() => navigate("/abouts")}>
              Về chúng tôi
            </button>
          </div>
        </div>
      </div>

      <button type='button' className='hero__scroll' aria-label='Cuộn xuống nội dung' onClick={onScrollNext}>
        <span className='hero__scroll-dot' aria-hidden='true' />
      </button>
    </section>
  );
};

export default HeroSection;

