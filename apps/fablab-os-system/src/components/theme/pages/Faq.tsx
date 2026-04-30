import React from "react";
import Accordion from "../components/Faqs/Accordion";
import FaqStatic from "../components/Faqs/FaqStatic";
import Footer from "../components/layout/footer/Footer";
import Navbar from "../components/layout/header/Navbar";
import Layout from "../components/layout/Layout";
import PageHeader from "../components/team/PageHeader";

export default function Faq() {
  return (
    <Layout>
      <Navbar darkBg />
      <PageHeader HeaderTitle="FAQ Page" Parent="Pages" PageTitle="Faq" />
      <Accordion Title />
      <FaqStatic Title space />
      <Footer />
    </Layout>
  );
}
