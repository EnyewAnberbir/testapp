// filepath: frontend/src/components/Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar"; // Assuming Navbar.jsx is in the same directory or adjust path

function Layout() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Outlet /> {/* Child routes will render here */}
      </main>
    </>
  );
}

export default Layout;
