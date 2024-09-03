import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { app, db } from "src/helpers/config";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { logout } from "src/controllers/Firebase";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const SignInContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #e0f7fa;
  animation: ${fadeIn} 0.5s ease-in-out;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const SignInBox = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
  animation: ${fadeIn} 0.5s ease-in-out;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 1.5rem;
  color: #007bff;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 5px;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #007bff;
  }
`;

export default function SignIn() {
  const [role, setRole] = useState(null);
  const { register, handleSubmit } = useForm();
  const [signup, setSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verified, setVerified] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth(app);

  const onSubmit = async (data) => {
    setTimeout(async () => {
      setLoading(true);
      if (!signup) {
        console.log({ data });
        signInWithEmailAndPassword(auth, data.email, data.password)
          .then(async (userCredential) => {
            // Signed in
            const user = userCredential.user;
            console.log({ user });
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
              const userData = userDoc.data();
              console.log({ userData });
              const userRole = userData.role;
              console.log({ role, userRole });
              if (role === userRole) {
                setVerified(true);
              } else {
                setError("Invalid role. Please contact support.");
                logout();
              }
              setLoading(false);
            } else {
              setError("Invalid Data. Please contact support.");
              setLoading(false);
            }
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            setLoading(false);
          });
      } else {
        try {
          // Create user with email and password
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            data.email,
            data.password
          );
          const user = userCredential.user;
          console.log({ user, role, data }, user.uid);

          // Add user to Firestore
          await setDoc(doc(db, "users", user.uid), {
            username: data.name,
            email: data.email,
            createdAt: new Date(),
            role: role,
            id: user.uid,
          });

          console.log("User created and saved to Firestore:", user.uid);
        } catch (error) {
          console.error("Error creating user:", error);
        }
      }
    }, 1000);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!role) {
    return (
      <RoleSelectionContainer>
        <RoleSelectionBox>
          <h2>Select Your Role</h2>
          <RoleButton onClick={() => setRole("student")}>Student</RoleButton>
          <RoleButton onClick={() => setRole("admin")}>Admin</RoleButton>
        </RoleSelectionBox>
      </RoleSelectionContainer>
    );
  }

  return (
    <SignInContainer>
      <SignInBox>
        <h1 style={{ textAlign: "center", color: "#007bff" }}>
          Task Management System
        </h1>
        <Title>{signup ? "Sign Up" : "Sign In"}</Title>
        <p style={{ textAlign: "center" }}>Welcome, Let's continue with</p>

        <form
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
          onSubmit={handleSubmit(onSubmit)}
        >
          {signup && (
            <>
              <label>Name</label>
              <Input {...register("name")} />
              <br />
            </>
          )}
          <label>Email</label>
          <Input {...register("email")} />
          <br />
          <label>Password</label>
          <Input {...register("password")} />
          <br />
          <Button
            variant="contained"
            color="primary"
            type="submit"
            style={{ marginTop: "1rem" }}
          >
            {signup ? "Sign Up" : "Sign In"}
          </Button>
          <p style={{ textAlign: "center", marginTop: "1rem" }}>
            {signup
              ? "Have an account? Sign in below"
              : "Don't have an account? Sign up below"}
          </p>
          {error && <Typography color="error">{error}</Typography>}
          <Button
            variant="text"
            color="primary"
            onClick={() => setSignUp(!signup)}
          >
            {signup ? "Sign In" : "Sign Up"}
          </Button>
        </form>
      </SignInBox>
    </SignInContainer>
  );
}

const RoleSelectionContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #e0f7fa;
  animation: ${fadeIn} 0.5s ease-in-out;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const RoleSelectionBox = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
  text-align: center;
  animation: ${fadeIn} 0.5s ease-in-out;
`;

const RoleButton = styled(Button)`
  margin-top: 1rem;
  width: 100%;
  background-color: #007bff;
  color: white;
  &:hover {
    background-color: #0056b3;
  }
  &:not(:last-child) {
    margin-bottom: 1rem;
  }
`;
