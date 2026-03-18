import React from "react";
import { Layout } from "antd";

import "./index.scss";
import FooterPage from "../../../components/layout/Footer";
import HeaderPage from "../../../components/layout/Header";
import Chatbox from "../../../components/chatbox";
import HeroSection from "../../../components/sections/home/HeroSection";
import BestSellersSection from "../../../components/sections/home/BestSellersSection";
import ReviewsSection from "../../../components/sections/home/ReviewsSection";
import RoastingProcessSection from "../../../components/sections/home/RoastingProcessSection";
import ExploreFlavorsSection from "../../../components/sections/home/ExploreFlavorsSection";
import FeaturedProductSection from "../../../components/sections/home/FeaturedProductSection";
import ArtisticRoastingSection from "../../../components/sections/home/ArtisticRoastingSection";
import HandsToHeartSection from "../../../components/sections/home/HandsToHeartSection";
import ClubCtaSection from "../../../components/sections/home/ClubCtaSection";


const { Content } = Layout;

const HomePage: React.FC = () => {
  const handleScrollHero = () => {
    const el = document.getElementById("home-content");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Layout className='homepage'>
      <HeaderPage />

      <Content className='homepage__content'>
        <HeroSection onScrollNext={handleScrollHero} />
        <div id='home-content'>
          <ExploreFlavorsSection />
          <FeaturedProductSection />
          <ArtisticRoastingSection />
          <HandsToHeartSection />
          {/* <BestSellersSection /> */}
        </div>
        <RoastingProcessSection />
        <ReviewsSection />
        <ClubCtaSection />
      </Content>

      <FooterPage />
      <Chatbox />
    </Layout>
  );
};

export default HomePage;
