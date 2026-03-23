import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Star, Quote, CheckCircle } from "lucide-react";

import "./index.scss";

const ReviewsSection: React.FC = () => {
  const { t } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  } as any;

  const reviews = [
    {
      id: 1,
      content: "home.reviews1Content",
      author: "home.reviews1Author",
      role: "BARISTA PROFESSIONAL",
    },
    {
      id: 2,
      content: "home.reviews2Content",
      author: "home.reviews2Author",
      role: "COFFEE LOVER",
    },
    {
      id: 3,
      content: "home.reviews3Content",
      author: "home.reviews3Author",
      role: "SHOP OWNER",
    },
  ];

  return (
    <section className='customer-reviews'>
      <div className='customer-reviews__container'>
        <motion.div 
          className='customer-reviews__header'
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className='customer-reviews__eyebrow'>
            {t("home.reviewsTitle", { defaultValue: "LỜI KHEN TỪ KHÁCH HÀNG" })}
          </span>
          <h2 className='customer-reviews__title'>
             {t("home.reviewsSubtitle")}
          </h2>
        </motion.div>

        <motion.div 
          className='customer-reviews__grid'
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {reviews.map((review) => (
            <motion.article 
              key={review.id}
              className='customer-reviews__item'
              variants={cardVariants}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <div className="customer-reviews__quote-icon">
                <Quote size={24} fill="currentColor" opacity={0.1} />
              </div>
              
              <div className='customer-reviews__stars'>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="#dfa88b" stroke="#dfa88b" />
                ))}
              </div>

              <p className='customer-reviews__content'>
                "{t(review.content)}"
              </p>

              <div className='customer-reviews__footer'>
                <div className="customer-reviews__divider" />
                <div className='customer-reviews__profile'>
                  <div className="customer-reviews__info">
                    <div className='customer-reviews__author'>
                      {t(review.author)}
                    </div>
                    <div className='customer-reviews__role'>
                      <CheckCircle size={10} className="inline mr-1" />
                      {review.role}
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ReviewsSection;
