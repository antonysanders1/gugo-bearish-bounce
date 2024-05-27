// src/components/SignUp.js
import React from "react";
import { Box, TextField, Button, Typography } from "@mui/material";

const SignUp = () => {
  return (
    <Box sx={{ width: "300px", textAlign: "center" }}>
      <Typography variant="h5" sx={{ marginBottom: "1rem" }}>
        Sign Up
      </Typography>
      <TextField
        fullWidth
        label="Name"
        variant="outlined"
        sx={{ marginBottom: "1rem" }}
      />
      <TextField
        fullWidth
        label="Email"
        variant="outlined"
        sx={{ marginBottom: "1rem" }}
      />
      <TextField
        fullWidth
        label="Password"
        variant="outlined"
        type="password"
        sx={{ marginBottom: "1rem" }}
      />
      <Button variant="contained" fullWidth>
        Sign Up
      </Button>
    </Box>
  );
};

export default SignUp;
