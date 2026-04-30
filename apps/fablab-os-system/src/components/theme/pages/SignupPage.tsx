import React from "react";
import Navbar from "../components/layout/header/Navbar";
import Layout from "../components/layout/Layout";
import Signup from "../components/others/Signup";

export default function SignupPage() {
  return (
    <Layout>
      <Navbar />
      <Signup />
    </Layout>
  );
}
