import React from "react";

import "./index.scss";

const ArtisticRoastingSection: React.FC = () => {
  return (
    <section className='artistic-roasting'>
      <div className='artistic-roasting__bg' aria-hidden='true'>
        <img
          src='https://lh3.googleusercontent.com/aida-public/AB6AXuBht9BrztcHyZynCJPKwFFWILvli3dEGVJUY6_GL6eTJAUXlfsFIioogh91wjxKrcZYds9ZPGNi614TSbgC9Cp7KXkHnt-MIC1qIJP0-fuwKD1v1fFNz5lwbpX4B_dxGKGdvmeBYZsHnwz88D_-UZoapIcblayYz0PEn41bcEr8hHl7cpHaxaLyUoPav1Pva9-a89jH7zTz9ZHMfkDXCavQwS3V61E8KeeuX8SzgWkWMqYX2iPKXFLdofHHkk2qb6Fuj7r8aqWw-R45'
          alt=''
          loading='lazy'
        />
      </div>
      <div className='artistic-roasting__container'>
        <div className='artistic-roasting__content'>
          <h2 className='artistic-roasting__title'>Nghệ thuật rang xay</h2>
          <p className='artistic-roasting__desc'>
            Tại Phan Coffee, rang xay không chỉ là một công đoạn kỹ thuật, đó là một môn nghệ
            thuật. Chúng tôi lắng nghe tiếng “nổ” của từng hạt cà phê, cảm nhận sự biến chuyển
            của màu sắc và hương thơm để dừng đúng thời điểm vàng, giữ trọn vẹn tinh túy nhất.
          </p>

          <div className='artistic-roasting__grid'>
            <div className='artistic-roasting__card'>
              <div className='artistic-roasting__icon' aria-hidden='true'>
                🔥
              </div>
              <div className='artistic-roasting__card-title'>Nhiệt độ tối ưu</div>
              <div className='artistic-roasting__card-desc'>
                Kiểm soát nhiệt độ chính xác để đánh thức hương vị tiềm ẩn.
              </div>
            </div>

            <div className='artistic-roasting__card'>
              <div className='artistic-roasting__icon' aria-hidden='true'>
                ⏱️
              </div>
              <div className='artistic-roasting__card-title'>Rang chậm (Slow Roast)</div>
              <div className='artistic-roasting__card-desc'>
                Quy trình rang kéo dài giúp hạt chín đều từ trong ra ngoài.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArtisticRoastingSection;

