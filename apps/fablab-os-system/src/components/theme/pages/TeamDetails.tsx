import React from "react";
import Footer from "../components/layout/footer/Footer";
import Navbar from "../components/layout/header/Navbar";
import Layout from "../components/layout/Layout";
import Subsribe from "../components/newsletter/Subsribe";
import VideoPromo from "../components/promo/VideoPromo";
import PageHeader from "../components/team/PageHeader";
import TeamMember from "../components/team/TeamMember";
import BrandCarousel from "../components/testimonial/BrandCarousel";

export default function TeamDetails() {
  return (
    <Layout>
      <Navbar darkBg />
      <PageHeader HeaderTitle="Our Team" PageTitle="Our Team" />
      <TeamMember />
      <VideoPromo />
      <BrandCarousel />
      <Subsribe />
      <Footer space />
    </Layout>
  );
}
