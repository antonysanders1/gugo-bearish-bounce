import React, { useContext } from "react";
import { motion } from "framer-motion";
import logo from "../assets/logo512.png";
import { Grid, Typography } from "@mui/material";
import { MainContext } from "../App";

const SplashScreen = () => {
  const { defaultTheme } = useContext(MainContext);

  return (
    <Grid
      item
      container
      xs={12}
      md={6}
      lg={5}
      xl={4}
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        // background: primary,
        // background: `linear-gradient(180deg, ${primary} 60%, ${secondary} 100%)`,
      }}
    >
      <motion.div
        animate={{ opacity: 1, top: "50%" }}
        transition={{ duration: 1.5, delay: 0.5 }}
        style={{
          position: "absolute",
          top: "80%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "55%",
          height: "fit-contet",
          display: "flex",
          flexFlow: "column",
          alignItems: "center",
          opacity: 0,
        }}
      >
        <img
          src={logo}
          alt=""
          style={{
            width: "100%",
            height: "auto",
            objectFit: "contain",
          }}
        />
        {/* <Typography
          variant="h3"
          style={{ fontWeight: "bold", color: black, marginTop: 20 }}
        >
          Antony Sanders
        </Typography> */}
        <Typography
          variant="caption"
          style={{ color: defaultTheme.palette.black, marginTop: 20 }}
        >
          SUB TEXT HERE
        </Typography>
      </motion.div>
      <motion.p
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 1 }}
        variant="caption"
        style={{
          position: "absolute",
          left: "50%",
          bottom: "5%",
          transform: "translate(-50%, 0%)",
          color: defaultTheme.palette.black,
          opacity: 0,
          fontSize: ".75rem",
        }}
      >
        Additional Text Here
      </motion.p>
    </Grid>
  );
};

export default SplashScreen;
