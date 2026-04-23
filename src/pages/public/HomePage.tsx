import React, { Suspense } from 'react';
import { useDocumentTitle } from '@/hooks/userdocumentitles/useDocumentTitle';
import { Layout } from 'antd';
import { motion } from 'framer-motion';
import HeroSection from '@/components/sections/home/HeroSection';
import ExploreFlavorsSection from '@/components/sections/home/ExploreFlavorsSection';
import FeaturedProductSection from '@/components/sections/home/FeaturedProductSection';
import ArtisticRoastingSection from '@/components/sections/home/ArtisticRoastingSection';
import HandsToHeartSection from '@/components/sections/home/HandsToHeartSection';
import RoastingProcessSection from '@/components/sections/home/RoastingProcessSection';
import ReviewsSection from '@/components/sections/home/ReviewsSection';
import ClubCtaSection from '@/components/sections/home/ClubCtaSection';
import Chatbox from '@/types/widgets/chatbox';

const { Content } = Layout;

const SectionWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-100px' }}
    transition={{ duration: 0.8, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

const HomePage: React.FC = () => {
  useDocumentTitle('pages.home.documentTitle');

  const handleScrollHero = () => {
    const el = document.getElementById('home-content');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Content className="homepage__content about-page about-page--bg-animate min-h-screen bg-[color:var(--hl-surface)] text-[color:var(--hl-on-surface)] transition-colors duration-300">
      <div className="relative z-[1]">
        <HeroSection onScrollNext={handleScrollHero} />
        <div id="home-content">
          <Suspense fallback={null}>
            <SectionWrapper>
              <ExploreFlavorsSection />
            </SectionWrapper>
            <SectionWrapper>
              <FeaturedProductSection />
            </SectionWrapper>
            <SectionWrapper>
              <ArtisticRoastingSection />
            </SectionWrapper>
            <SectionWrapper>
              <HandsToHeartSection />
            </SectionWrapper>
          </Suspense>
        </div>
        <SectionWrapper>
          <RoastingProcessSection />
        </SectionWrapper>
        <SectionWrapper>
          <ReviewsSection />
        </SectionWrapper>
        <SectionWrapper>
          <ClubCtaSection />
        </SectionWrapper>
        <Chatbox />
      </div>
    </Content>
  );
};

export default HomePage;
