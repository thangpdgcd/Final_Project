import React from "react";

import "./index.scss";

const ClubCtaSection: React.FC = () => {
  return (
    <section className='club-cta'>
      <div className='club-cta__container'>
        <h2 className='club-cta__title'>Gia nhập Phan Coffee Club</h2>
        <p className='club-cta__subtitle'>
          Nhận thông báo về các mẻ rang mới nhất, ưu đãi đặc biệt và kiến thức về cà phê mỗi
          tuần.
        </p>

        <form
          className='club-cta__form'
          onSubmit={(e) => {
            e.preventDefault();
          }}>
          <input className='club-cta__input' placeholder='Email của bạn...' type='email' />
          <button className='club-cta__btn' type='submit'>
            Đăng ký
          </button>
        </form>
      </div>
    </section>
  );
};

export default ClubCtaSection;

