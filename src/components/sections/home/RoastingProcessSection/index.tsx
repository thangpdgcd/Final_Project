import React from "react";

import "./index.scss";

const RoastingProcessSection: React.FC = () => {
  return (
    <section className='roasting-process'>
      <div className='roasting-process__inner'>
        <div>
          <div className='roasting-process__eyebrow'>NGHỆ THUẬT RANG XAY</div>
          <h2 className='roasting-process__title'>Quy trình rang xay nghệ thuật</h2>
          <p className='roasting-process__description'>
            Tại Phan Coffee, mỗi mẻ rang là một bản giao hưởng của nhiệt độ và thời gian.
            Chúng tôi không chỉ rang cà phê, chúng tôi đánh thức những tầng hương vị sâu
            thẳm nhất trong từng hạt mộc.
          </p>

          <div className='roasting-process__highlights'>
            <div className='roasting-process__item'>
              <div className='roasting-process__icon' aria-hidden='true'>
                <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M12 21s-7-4.35-7-10.2C5 7.7 7.55 5 12 5s7 2.7 7 5.8C19 16.65 12 21 12 21Z'
                    stroke='currentColor'
                    strokeWidth='1.8'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M9.25 11.7c1.05-1.2 2.6-2.05 4.75-2.35'
                    stroke='currentColor'
                    strokeWidth='1.8'
                    strokeLinecap='round'
                  />
                </svg>
              </div>
              <div>
                <div className='roasting-process__item-title'>Chọn lọc thủ công</div>
                <div className='roasting-process__item-desc'>
                  Chỉ những quả chín mọng và đạt chuẩn kích thước mới được đưa vào quy trình.
                </div>
              </div>
            </div>

            <div className='roasting-process__item'>
              <div className='roasting-process__icon' aria-hidden='true'>
                <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M12 2.5c2.9 2.7 4.5 5.2 4.5 7.6 0 2.9-2 5.2-4.5 5.2s-4.5-2.3-4.5-5.2c0-2.4 1.6-4.9 4.5-7.6Z'
                    stroke='currentColor'
                    strokeWidth='1.8'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M5 21h14'
                    stroke='currentColor'
                    strokeWidth='1.8'
                    strokeLinecap='round'
                  />
                  <path
                    d='M8.5 18.2c1.1.8 2.4 1.3 3.5 1.3s2.4-.5 3.5-1.3'
                    stroke='currentColor'
                    strokeWidth='1.8'
                    strokeLinecap='round'
                  />
                </svg>
              </div>
              <div>
                <div className='roasting-process__item-title'>Rang mộc 100%</div>
                <div className='roasting-process__item-desc'>
                  Cam kết không tẩm ướp phụ gia, giữ nguyên vị đắng thanh và hậu ngọt nguyên bản.
                </div>
              </div>
            </div>

            <div className='roasting-process__item'>
              <div className='roasting-process__icon' aria-hidden='true'>
                <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M7 7.5h10v12H7v-12Z'
                    stroke='currentColor'
                    strokeWidth='1.8'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M9 7.5V5.8C9 4.25 10.35 3 12 3s3 1.25 3 2.8v1.7'
                    stroke='currentColor'
                    strokeWidth='1.8'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M9.5 12h5'
                    stroke='currentColor'
                    strokeWidth='1.8'
                    strokeLinecap='round'
                  />
                  <path
                    d='M9.5 15h5'
                    stroke='currentColor'
                    strokeWidth='1.8'
                    strokeLinecap='round'
                  />
                </svg>
              </div>
              <div>
                <div className='roasting-process__item-title'>Đóng gói chuẩn SCA</div>
                <div className='roasting-process__item-desc'>
                  Bảo quản trong túi van 1 chiều giúp cà phê luôn tươi mới như vừa ra lò.
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className='roasting-process__media'>
          <img
            className='roasting-process__image'
            src='https://res.cloudinary.com/dfjecxrnl/image/upload/v1773308043/a_close_up_high_quality_photograph_of_a_person_s_hands_holding_a_handful_of_roasted_coffee_beans_over_a_large_bowl_of_coffee_beans._the_person_is_wearing_a_teal_colored_button_up_shirt._the_lighting_is_warm_and_art_apfefk.png'
            alt='Quy trình rang xay Phan Coffee'
            loading='lazy'
          />
          <div className='roasting-process__badge'>
            <div className='roasting-process__badge-number'>12+</div>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default RoastingProcessSection;

