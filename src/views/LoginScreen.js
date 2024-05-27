// src/screens/AuthScreen.js
import React, { useState } from "react";
import { Box, Tabs, Tab, Grid } from "@mui/material";
import { motion } from "framer-motion";
import Login from "../components/Login";
import SignUp from "../components/SignUp";

const AuthScreen = ({ isLogin }) => {
  const [activeTab, setActiveTab] = useState(isLogin ? 0 : 1);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Grid
      item
      container
      xs={12}
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab label="Login" />
          <Tab label="Sign Up" />
        </Tabs>
        {activeTab === 0 && <Login />}
        {activeTab === 1 && <SignUp />}
      </motion.div>
    </Grid>
  );
};

export default AuthScreen;
