import React from "react";
// @ts-ignore
import { ReactComponent as HeaderLogo } from "../../assets/images/HeaderLogo.svg";
import { Button } from "@mui/material";
import { logout } from "src/controllers/Firebase";

export default function Navbar() {
  return (
    <div
      className="Navbar-wrapper"
      style={{
        display: "flex",
        backgroundColor: "white",
        borderBottom: "1px solid gray",
        padding: "8px",
        justifyContent: "space-between",
      }}
    >
      <HeaderLogo />
      <Button onClick={logout}>Logout</Button>
    </div>
  );
}
