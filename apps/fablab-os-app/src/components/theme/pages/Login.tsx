import React from "react";
import Navbar from "../components/layout/header/Navbar";
import Layout from "../components/layout/Layout";
import LoginScreen from "../components/others/LoginScreen";

export default function Login() {
  return (
    <Layout>
      <Navbar darkBg />
      <LoginScreen />
    </Layout>
  );
}
