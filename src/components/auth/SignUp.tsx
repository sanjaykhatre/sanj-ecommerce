import React from "react";
import { FilledInput } from "@mui/material";
import { useForm } from "react-hook-form";
export default function SingUp() {
  const { register, handleSubmit } = useForm();
  const onSubmit = (data) => console.log(data);
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
