import React from "react";
// @ts-ignore
import { ReactComponent as HeaderLogo } from "../../assets/images/HeaderLogo.svg";
import { Button } from "@mui/material";
import { logout } from "src/controllers/Firebase";
import About from "../About";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

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
      <HeaderLogo
        onClick={() => {
          navigate("/");
        }}
      />
      <div>
        <ul>
          <Link style={{ textDecoration: "none" }} to={"/about"}>
            <li>About</li>
          </Link>
        </ul>
      </div>
      <Button onClick={logout}>Logout</Button>
    </div>
  );
}
