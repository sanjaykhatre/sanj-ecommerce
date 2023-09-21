import React, { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./components/auth/SignIn";
import SingUp from "./components/auth/SignUp";
import HomePage from "./HomePage";
import { initFirebase } from "./controllers/Firebase";
import { Box, CircularProgress } from "@mui/material";
import About from "./components/About";

function App() {
  const [authenticated, setAuthenticated] = useState(null);
  useEffect(() => {
    initFirebase(setAuthenticated);
  }, []);

  const checkAuthentication = (path) => {
    console.log({ path, authenticated });
    switch (path) {
      case "/":
        if (authenticated) {
          return <HomePage />;
        }
        return <Navigate to="/signIn" />;

      case "/signIn":
        if (authenticated) {
          return <Navigate to="/" />;
        }
        return <SignIn />;

      default:
        return null;
    }
  };

  if (authenticated === null) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={checkAuthentication("/")}>
          <Route path="singUp" element={<SingUp />} />
          <Route path="about" element={<About />} />
        </Route>
        <Route path="/signIn" element={checkAuthentication("/signIn")} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
