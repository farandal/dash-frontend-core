import React from "react";
import Contact from "../components/contact/Contact";
import Footer from "../components/layout/footer/Footer";
import Navbar from "../components/layout/header/Navbar";
import Layout from "../components/layout/Layout";
import Subsribe from "../components/newsletter/Subsribe";
import PageHeader from "../components/team/PageHeader";
import Teams from "../components/team/Teams";
import BrandCarousel from "../components/testimonial/BrandCarousel";

export default function OurTeam() {
  return (
    <Layout>
      <Navbar darkBg />
      <PageHeader HeaderTitle="Our Team" Parent="Pages" PageTitle="Our Team" />
      <Teams />
      <Contact bgColor="gray-light-bg" />
      <BrandCarousel />
      <Subsribe />
      <Footer space />
    </Layout>
  );
}
