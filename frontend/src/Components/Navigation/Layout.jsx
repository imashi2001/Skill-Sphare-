import React from "react";
import Header from "../Navigation/Header";
import Footer from "../Navigation/Footer";

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default Layout;
