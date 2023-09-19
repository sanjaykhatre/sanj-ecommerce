import React from "react";
import { FilledInput } from "@mui/material";
import { useForm } from "react-hook-form";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { app } from "src/helpers/config";
export default function SingUp() {
  const { register, handleSubmit } = useForm();
  const auth = getAuth(app);
  const onSubmit = (data) => {
    createUserWithEmailAndPassword(auth, data.email, data.password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log({ user });
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
      });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label>Email</label>
      <input {...register("email")} />
      <br />
      <label>Password</label>
      <input {...register("password")} />
      <br />
      <input type="submit" />
    </form>
  );
}
