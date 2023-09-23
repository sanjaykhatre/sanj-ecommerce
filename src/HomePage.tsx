import { Button } from "@mui/material";
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";

export default function HomePage() {
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <div style={{ height: "10%" }}>
        <Navbar />
      </div>
      <p>hlw guys just test</p>
      <Outlet />
    </div>
  );
}
