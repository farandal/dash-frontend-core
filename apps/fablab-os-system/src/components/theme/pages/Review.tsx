import React from "react";
import FooterTwo from "../components/layout/footer/FooterTwo";
import Navbar from "../components/layout/header/Navbar";
import Layout from "../components/layout/Layout";
import PageHeader from "../components/team/PageHeader";
import AllReview from "../components/testimonial/AllReview";

export default function Review() {
  return (
    <Layout>
      <Navbar />
      <PageHeader HeaderTitle="Customer Say About Us" PageTitle="Review" />
      <AllReview />
      <FooterTwo />
    </Layout>
  );
}
