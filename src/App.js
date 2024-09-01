import React, { createContext, useEffect, useState } from "react";
import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";
import SignIn from "./components/auth/SignIn";
import { getUserInfo, initFirebase } from "./controllers/Firebase";
import { Box, CircularProgress } from "@mui/material";
import About from "./components/About";
import Dashboard from "./components/Dashboard";
import ChessGame from "./components/game/ChessGame";
import Navbar from "./components/navbar/Navbar";
import { auth } from "./helpers/config";
import { TaskProvider } from "./components/context/TaskContext";
import TaskPage from "./components/task/task";
import { SubjectProvider } from "./components/context/SubjectContext";
import SettingsPage from "./components/settings/Settings";
import EditProfile from "./components/EditProfile";
export const UserContext = createContext();

function App() {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);

  const [authenticated, setAuthenticated] = useState(null);
  useEffect(() => {
    initFirebase(setAuthenticated);
  }, []);
  useEffect(() => {
    const user = auth.currentUser;
    if (user?.uid) {
      setLoading(true);
      console.log("tt", { user });

      getUserInfo(user.uid).then((user) => setUser(user));
      setLoading(false);
    }
  }, [authenticated]);

  if (authenticated === null || loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }
  function ProtectedRoute({ element, authenticated }) {
    if (authenticated === null) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      );
    }

    return authenticated ? (
      <SubjectProvider>
        <TaskProvider>
          <UserContext.Provider value={{ user }}>
            <Navbar />
            {element}
          </UserContext.Provider>
        </TaskProvider>
      </SubjectProvider>
    ) : (
      <Navigate to="/signIn" />
    );
  }
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={checkAuthentication("/")}>
          <Route path="about" element={<About />} />
          <Route path="chess" element={<ChessGame />} />
        </Route>
        <Route path="/signIn" element={checkAuthentication("/signIn")} />
        <Route path="*" element={<Navigate to="/" />} /> */}

        <Route
          path="/"
          element={
            <ProtectedRoute
              authenticated={authenticated}
              element={<Dashboard />}
            />
          }
        />
        <Route
          path="/about"
          element={
            <ProtectedRoute
              authenticated={authenticated}
              element={
                <>
                  <About />
                </>
              }
            />
          }
        />
        <Route
          path="/chess"
          element={
            <ProtectedRoute
              authenticated={authenticated}
              element={<ChessGame />}
            />
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute
              authenticated={authenticated}
              element={<SettingsPage />}
            />
          }
        />
        <Route
          path="/task"
          element={
            <ProtectedRoute
              authenticated={authenticated}
              element={<TaskPage />}
            />
          }
        />
        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute
              authenticated={authenticated}
              element={<EditProfile />}
            />
          }
        />

        {/* Public routes */}
        <Route
          path="/signIn"
          element={authenticated ? <Navigate to="/" /> : <SignIn />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
