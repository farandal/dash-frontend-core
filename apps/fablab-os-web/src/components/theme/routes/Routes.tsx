import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomeOne from "../themes/index-1/HomeOne";
import ChangePassword from "../components/others/ChangePassword";
import ComingSoon from "../components/others/ComingSoon";
import LoginTwo from "../components/others/LoginTwo";
import NotFound from "../components/others/NotFound";
import PasswordReset from "../components/others/PasswordReset";
import ThankYou from "../components/others/ThankYou";
import Login from "../pages/Login";

import HomeTwo from "../themes/index-2/HomeTwo";
import HomeThree from "../themes/index-3/HomeThree";
import HomeFour from "../themes/index-4/HomeFour";
import HomeFive from "../themes/index-5/HomeFive";
import HomeSix from "../themes/index-6/HomeSix";
import HomeSeven from "../themes/index-7/HomeSeven";
import HomeEight from "../themes/index-8/HomeEight";
import OurTeam from "../pages/OurTeam";
import TeamDetails from "../pages/TeamDetails";
import Download from "../pages/Download";
import Review from "../pages/Review";
import Faq from "../pages/Faq";
import SignupTwo from "../components/others/SignupTwo";
import SignupPage from "../pages/SignupPage";
import BlogGrid from "../pages/BlogGrid";
import BlogWithSidebar from "../pages/BlogWithSidebar";
import BlogDetails from "../pages/BlogDetails";
import ScrollToTop from "./ScrollToTop";

const AppRoutes = () => {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomeOne />} />
        <Route path="/home-two" element={<HomeTwo />} />
        <Route path="/home-three" element={<HomeThree />} />
        <Route path="/home-four" element={<HomeFour />} />
        <Route path="/home-five" element={<HomeFive />} />
        <Route path="/home-six" element={<HomeSix />} />
        <Route path="/home-seven" element={<HomeSeven />} />
        <Route path="/home-eight" element={<HomeEight />} />
        <Route path="/our-team" element={<OurTeam />} />
        <Route path="/team-details" element={<TeamDetails />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/coming-soon" element={<ComingSoon />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login-two" element={<LoginTwo />} />
        <Route path="/signup-two" element={<SignupTwo />} />
        <Route path="/basic-signup" element={<SignupPage />} />
        <Route path="/reset-password" element={<PasswordReset />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/download" element={<Download />} />
        <Route path="/review" element={<Review />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/blog-grid" element={<BlogGrid />} />
        <Route path="/blog-sidebar" element={<BlogWithSidebar />} />
        <Route path="/blog-details" element={<BlogDetails />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
