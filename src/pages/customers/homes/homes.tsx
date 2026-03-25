import React from "react";
import { Layout } from "antd";

import FooterPage from "../../../components/layout/Footer";
import HeaderPage from "../../../components/layout/Header";
import Chatbox from "../../../components/chatbox";
import HeroSection from "../../../components/sections/home/HeroSection";
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
    <Layout className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-main)]">
      <HeaderPage />

      <Content className="m-0 min-h-0 bg-[var(--bg-main)] p-0 text-[var(--text-main)]">
        <HeroSection onScrollNext={handleScrollHero} />
        <div id="home-content">
          <ExploreFlavorsSection />
          <FeaturedProductSection />
          <ArtisticRoastingSection />
          <HandsToHeartSection />
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
