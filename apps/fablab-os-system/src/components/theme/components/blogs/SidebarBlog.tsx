import React from "react";
import BlogPost from "./BlogPost";
import Sidebar from "./Sidebar";

export default function SidebarBlog() {
  return (
    <>
      <div className="module ptb-100">
        <div className="container">
          <div className="row">
            <Sidebar />
            <BlogPost />
          </div>
        </div>
      </div>
    </>
  );
}
