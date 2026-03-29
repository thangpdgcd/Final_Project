import React, { useState } from 'react';
import { EnvironmentOutlined, PhoneOutlined, MailOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const ContactPage: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success(t('contact.success') || 'Gửi tin nhắn thành công!');
    setFormData({ name: '', email: '', message: '' });
    setLoading(false);
  };

  const info = [
    {
      icon: <EnvironmentOutlined />,
      label: t('contact.addressLabel') || 'Địa chỉ',
      value: t('footer.contact.address') || '123 Đường Cà Phê, Quận 1, TP.HCM',
    },
    {
      icon: <PhoneOutlined />,
      label: t('contact.phoneLabel') || 'Điện thoại',
      value: t('footer.contact.phone') || '1900 1234',
    },
    {
      icon: <MailOutlined />,
      label: t('contact.emailLabel') || 'Email',
      value: t('footer.contact.email') || 'hello@phancoffee.com',
    },
    {
      icon: <ClockCircleOutlined />,
      label: t('contact.hoursLabel') || 'Giờ mở cửa',
      value: t('footer.contact.hours') || '07:00 - 22:00 Hàng ngày',
    },
  ];

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1 } 
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="bg-[#fdfbf7] dark:bg-[#0a0a0a] min-h-screen">
      {/* Top Banner */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full py-24 px-4 flex items-center justify-center bg-gradient-to-b from-[#6f4e37] to-[#2c1e16] shadow-xl relative overflow-hidden"
      >
        {/* Abstract background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500 via-transparent to-transparent" />
        
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center relative z-10"
        >
          <span className="text-amber-300 text-xs font-bold tracking-[0.2em] uppercase mb-4 block">
            {t('contact.heroLabel') || 'Kết Nối Với Chúng Tôi'}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight">
            {t('contact.heroTitle') || 'Liên Hệ'}
          </h1>
          <p className="text-amber-100/80 max-w-lg mx-auto text-sm md:text-base font-medium">
            {t('contact.heroSubtitle') || 'Chúng tôi luôn lắng nghe và sẵn sàng hỗ trợ bạn bất cứ lúc nào.'}
          </p>
        </motion.div>
      </motion.div>

      {/* Main Section */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          
          {/* LEFT: INFO */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col justify-center"
          >
            <motion.h2 variants={fadeUp} className="text-3xl lg:text-4xl font-bold text-stone-800 dark:text-amber-50 mb-8 tracking-tight">
              {t('contact.form.infoTitle') || 'Thông tin liên hệ'}
            </motion.h2>
            
            <div className="space-y-8">
              {info.map((item, index) => (
                <motion.div key={index} variants={fadeUp} className="flex items-start gap-6 group">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br from-[#6f4e37] to-[#8c674e] shadow-lg shadow-[#6f4e37]/20 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-xl">{item.icon}</span>
                  </div>
                  <div className="flex-1 mt-1">
                    <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1.5">
                      {item.label}
                    </div>
                    <div className="text-lg font-medium text-stone-700 dark:text-stone-200">
                      {item.value}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT: FORM CARD */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-stone-200/50 dark:shadow-black/50 p-8 sm:p-10 border border-stone-100 dark:border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 bg-amber-500/10 blur-[50px] rounded-full pointer-events-none" />
              
              <h2 className="text-2xl font-bold text-stone-800 dark:text-amber-50 mb-8 tracking-tight">
                {t('contact.form.title') || 'Gửi ngay lời nhắn'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <motion.div variants={fadeUp}>
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                    {t('contact.form.nameLabel') || 'Họ và tên'}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-stone-50 dark:bg-black/20 border border-stone-200 dark:border-white/10 rounded-xl text-stone-800 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#c4963b] focus:border-transparent transition-all duration-300"
                    placeholder={t('contact.form.namePlaceholder') || 'Nhập họ và tên...'}
                  />
                </motion.div>
                
                <motion.div variants={fadeUp}>
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                    {t('contact.form.emailLabel') || 'Email'}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-stone-50 dark:bg-black/20 border border-stone-200 dark:border-white/10 rounded-xl text-stone-800 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#c4963b] focus:border-transparent transition-all duration-300"
                    placeholder={t('contact.form.emailPlaceholder') || 'Nhập địa chỉ email...'}
                  />
                </motion.div>
                
                <motion.div variants={fadeUp}>
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                    {t('contact.form.messageLabel') || 'Lời nhắn'}
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-5 py-4 bg-stone-50 dark:bg-black/20 border border-stone-200 dark:border-white/10 rounded-xl text-stone-800 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#c4963b] focus:border-transparent transition-all duration-300 resize-none"
                    placeholder={t('contact.form.messagePlaceholder') || 'Ghi chú cho chúng tôi...'}
                  />
                </motion.div>
                
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-[#6f4e37] to-[#4e3524] text-white font-bold rounded-xl shadow-lg shadow-[#6f4e37]/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    t('contact.form.submit') || 'Gửi ngay'
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
