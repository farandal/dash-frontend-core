import React from "react";
import SingleBlog from "../components/blogs/SingleBlog";
import Footer from "../components/layout/footer/Footer";
import Navbar from "../components/layout/header/Navbar";
import Layout from "../components/layout/Layout";
import PageHeader from "../components/team/PageHeader";

export default function BlogDetails() {
  return (
    <Layout>
      <Navbar darkBg />
      <PageHeader
        HeaderTitle="Blog Single Right Sidebar"
        PageTitle="Blog Single Right Sidebar"
        Parent="Blog"
      />
      <SingleBlog />
      <Footer />
    </Layout>
  );
}
