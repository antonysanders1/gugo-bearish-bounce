// src/components/Login.js
import React from "react";
import { Box, TextField, Button, Typography } from "@mui/material";

const Login = () => {
  return (
    <Box sx={{ width: "300px", textAlign: "center" }}>
      <Typography variant="h5" sx={{ marginBottom: "1rem" }}>
        Login
      </Typography>
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
        Login
      </Button>
    </Box>
  );
};

export default Login;
