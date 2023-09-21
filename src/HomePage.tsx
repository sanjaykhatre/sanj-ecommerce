import { Button } from "@mui/material";
import React from "react";
import { logout } from "./controllers/Firebase";
import { Outlet } from "react-router-dom";

export default function HomePage() {
  return (
    <>
      <p>hlw guys just test</p>
      <Button onClick={logout}>Logout</Button>
      <Outlet />
    </>
  );
}
