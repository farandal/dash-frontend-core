import React from "react";
import BlogCard from "../components/blogs/BlogCard";
import Pagination from "../components/blogs/Pagination";
import Footer from "../components/layout/footer/Footer";
import Navbar from "../components/layout/header/Navbar";
import Layout from "../components/layout/Layout";
import PageHeader from "../components/team/PageHeader";

export default function BlogGrid() {
  return (
    <Layout>
      <Navbar darkBg />
      <PageHeader
        HeaderTitle="Blog Default"
        Parent="Blog"
        PageTitle="Blog Default"
      />
      <BlogCard />
      <Pagination hasBg />
      <Footer />
    </Layout>
  );
}
