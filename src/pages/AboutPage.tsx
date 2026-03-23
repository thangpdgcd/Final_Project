import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const steps = [
  { icon: '🌱', title: 'Tuyển chọn hạt', desc: 'Hạt cà phê được tuyển chọn kỹ lưỡng từ các vườn cà phê ở Kon Tum, đảm bảo chất lượng nguyên liệu đầu vào.' },
  { icon: '🔥', title: 'Rang thủ công', desc: 'Rang thẳng tay theo phong cách truyền thống, kiểm soát nhiệt độ và thời gian để tạo ra hương vị hoàn hảo nhất.' },
  { icon: '📦', title: 'Đóng gói tươi', desc: 'Đóng gói ngay sau khi rang để giữ nguyên hương thơm. Van thoát khí đặc biệt giữ cà phê tươi lâu hơn.' },
  { icon: '🚀', title: 'Giao hàng nhanh', desc: 'Giao hàng trong ngày tại Kon Tum và toàn quốc trong 2–3 ngày để đảm bảo bạn nhận được cà phê mới nhất.' },
];

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      {/* HERO */}
      <section
        className="relative min-h-[70vh] flex items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(150deg, #1a0a00 0%, #4e3524 50%, #6f4e37 100%)' }}
      >
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #c4963b, transparent)' }} />
          <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #c4963b, transparent)' }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center z-10 px-4"
        >
          <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-4">Câu chuyện của chúng tôi</p>
          <h1 className="text-white text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: 'var(--font-display)' }}>
            Phan Coffee
          </h1>
          <p className="text-amber-100 text-lg max-w-2xl mx-auto leading-relaxed">
            Khởi nguồn từ tình yêu với hạt cà phê Kon Tum, chúng tôi mang đến hương vị nguyên bản — không tẩm ướp, không chất phụ gia.
          </p>
          <button
            onClick={() => navigate('/products')}
            className="mt-8 px-8 py-3 rounded-full text-white font-semibold transition-all hover:scale-105"
            style={{ background: 'linear-gradient(90deg, #c4963b, #6f4e37)' }}
          >
            Khám phá sản phẩm →
          </button>
        </motion.div>
      </section>

      {/* ORIGIN STORY */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="text-amber-600 text-sm font-semibold tracking-widest uppercase mb-3">Nguồn gốc</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#4e3524] dark:text-amber-100 mb-6" style={{ fontFamily: 'var(--font-display)' }}>
              Từ đất Kon Tum<br />đến từng tách cà phê
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Phan Coffee ra đời tại mảnh đất cao nguyên Kon Tum, nơi có độ cao lý tưởng, khí hậu mát mẻ và đất đỏ bazan màu mỡ — những điều kiện thiên nhiên tạo nên những hạt cà phê đặc biệt.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Chúng tôi làm việc trực tiếp với các hộ nông dân địa phương, đảm bảo thu mua công bằng và quy trình canh tác bền vững. Mỗi mẻ rang đều được theo dõi kỹ lưỡng để mang đến hương vị nhất quán.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
            <div
              className="rounded-3xl overflow-hidden"
              style={{ height: 380, background: 'linear-gradient(135deg, #6f4e37, #c4963b)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <span className="text-9xl">☕</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(to right, #fdf6e3, #f5ead0)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-amber-600 text-sm font-semibold tracking-widest uppercase mb-3">Quy trình</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#4e3524]" style={{ fontFamily: 'var(--font-display)' }}>
              Từ vườn đến ly cà phê
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="font-bold text-[#4e3524] dark:text-amber-100 mb-2">{step.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <p className="text-amber-600 text-sm font-semibold tracking-widest uppercase mb-3">Cam kết</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#4e3524] dark:text-amber-100" style={{ fontFamily: 'var(--font-display)' }}>
            Giá trị cốt lõi
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: '🌿', title: 'Nguyên chất 100%', desc: 'Không tẩm ướp, không chất bảo quản. Chỉ có hạt cà phê rang thẳng tay.' },
            { icon: '🤝', title: 'Thương mại công bằng', desc: 'Hợp tác trực tiếp với nông dân, đảm bảo thu nhập bền vững cho cộng đồng.' },
            { icon: '♻️', title: 'Bền vững môi trường', desc: 'Bao bì thân thiện môi trường, quy trình sản xuất tiết kiệm năng lượng.' },
          ].map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="text-center"
            >
              <div className="text-5xl mb-4">{v.icon}</div>
              <h3 className="text-xl font-bold text-[#4e3524] dark:text-amber-100 mb-2" style={{ fontFamily: 'var(--font-display)' }}>{v.title}</h3>
              <p className="text-gray-500 dark:text-gray-400">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-20 px-4 text-center"
        style={{ background: 'linear-gradient(135deg, #4e3524, #6f4e37)' }}
      >
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 className="text-white text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Sẵn sàng thưởng thức?
          </h2>
          <p className="text-amber-100 mb-8">Khám phá bộ sưu tập cà phê rang mộc nguyên chất của chúng tôi</p>
          <button
            onClick={() => navigate('/products')}
            className="px-10 py-4 bg-amber-400 text-[#1a0a00] font-bold rounded-full hover:bg-amber-300 transition-all hover:scale-105"
          >
            Mua ngay →
          </button>
        </motion.div>
      </section>
    </div>
  );
};

export default AboutPage;
