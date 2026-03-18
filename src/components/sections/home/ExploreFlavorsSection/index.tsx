import React from "react";
import { useNavigate } from "react-router-dom";

import "./index.scss";

const ExploreFlavorsSection: React.FC = () => {
  const navigate = useNavigate();

  const items = [
    {
      title: "Single Origin",
      desc: "Hương vị nguyên bản từ những vùng nguyên liệu đặc trưng.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAHDU8BePH8GrdSTKBP2Q4x_u4z3KQe3hy6P_BLnGKfUHJHA6ka4-tdM94YS_93I3HRtLXUJxk8vuP9LmJZaFXVU0pnbfUG7IVlubS7Ghe_EO-UvDiUQT17hDkjB5CyHH0GeEifYjBfnuCz1lVhD5_KF6xnHCR_DRLuR3bMrXoIhgks8Hmw4fWpikcrKrhhaQ9l2uCVtF88PCUBsXKqDGn1klj_oTbb0s1HSwO7zBH67dz6D0SQKQPGBg_nPa9aLJH__wzXiU0qWqg7",
      onClick: () => navigate("/products?category=single-origin"),
    },
    {
      title: "House Blends",
      desc: "Sự kết hợp hoàn hảo tạo nên phong vị độc bản của Phan Coffee.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDIGbVFPZxMicSHoOtkHrkP-oeAqes7Jyt-Ej4vqJA0NFNSNdfKcthG9vUPFN7wzAotxpTG4sKt9nPoyTRPTLiz4-ac_iSRBuBvWkfDxujyW4nQ47_mIEqHrWCJv7OUwW3XaV_hlcHKCslfV8lljnsafA-U7Og6oM6ZpJ0QjpddLLUnGNYMQ6cmk_6360gfAELj6VX971CuTuJfPqPGneZQc8AzjnvMEoPigZ_UDlmLYilo-R-Cfv-patAgxpp2ArpbK-GhDGbY8ZGs",
      onClick: () => navigate("/products?category=blend"),
    },
    {
      title: "Dụng cụ pha",
      desc: "Nâng tầm trải nghiệm thưởng thức cà phê tại gia.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB33wgLsp2LUL3sDxnraqOc2Sg4JpxGfqH1gpd3JKw0qTymx1gx7H3uxbN99rjlEpAedc1NalnUbvsJmoG2-3uJWQdevwtCoMI1IhtnO_od9sefdTbcQ6pO-GBPnqU9gyhMh7R1ejDLYeuTV2srKfVePBon7xjO_Sb_d2N81lTPXwLAE7uToTNr8L8tAqy9VLfdy4G10dLXk-jIBFOCvyq6yyqJSO3Ois2vfepdOxB3zWDtEO0tBOcPqvzPDnlCI_KaUFnRB4qNuYVJ",
      onClick: () => navigate("/products?category=tools"),
    },
  ];

  return (
    <section className='explore-flavors'>
      <div className='explore-flavors__container'>
        <div className='explore-flavors__header'>
          <h2 className='explore-flavors__title'>Khám phá hương vị</h2>
          <div className='explore-flavors__divider' />
        </div>

        <div className='explore-flavors__grid'>
          {items.map((it) => (
            <button
              key={it.title}
              type='button'
              className='explore-flavors__item'
              onClick={it.onClick}>
              <div className='explore-flavors__avatar'>
                <img src={it.img} alt={it.title} loading='lazy' />
                <div className='explore-flavors__avatar-overlay' aria-hidden='true' />
              </div>
              <h3 className='explore-flavors__item-title'>{it.title}</h3>
              <p className='explore-flavors__item-desc'>{it.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExploreFlavorsSection;

