import React from "react";
import SidebarBlog from "../components/blogs/SidebarBlog";
import Footer from "../components/layout/footer/Footer";
import Navbar from "../components/layout/header/Navbar";
import Layout from "../components/layout/Layout";
import PageHeader from "../components/team/PageHeader";

export default function BlogWithSidebar() {
  return (
    <Layout>
      <Navbar darkBg />
      <PageHeader
        HeaderTitle="Blog Left Sidebar"
        PageTite="Blog Left Sidebar"
        Parent="Blog"
      />
      <SidebarBlog />
      <Footer />
    </Layout>
  );
}
