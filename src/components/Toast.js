import React, { useContext } from "react";
import { MdOutlineClose } from "react-icons/md";
import { Typography } from "@mui/material";
import { motion } from "framer-motion";
import { MainContext } from "../App";

const Toast = () => {
  const {
    success,
    setSuccess,
    error,
    setError,
    info,
    setInfo,
    message,
    setMessage,
    defaultTheme,
  } = useContext(MainContext);

  console.log(success, setSuccess);

  const getBackgroundColor = () => {
    if (success) {
      return defaultTheme.palette.success.main;
    } else if (error) {
      return defaultTheme.palette.error.main;
    } else if (info) {
      return defaultTheme.palette.info.main;
    } else {
      return defaultTheme.palette.primary.main;
    }
  };

  const getTextColor = () => {
    if (success) {
      return defaultTheme.palette.white;
    } else if (error) {
      return defaultTheme.palette.white;
    } else if (info) {
      return defaultTheme.palette.black;
    } else {
      return defaultTheme.palette.black;
    }
  };

  const closeNotif = () => {
    setSuccess(false);
    setError(false);
    setInfo(false);
    setMessage("");
  };

  return (
    <motion.div
      animate={{
        opacity: success || error || info ? 1 : 0,
        top: success || error || info ? "10%" : "-10%",
      }}
      transition={{
        duration: 0.2,
      }}
      onAnimationComplete={() =>
        setTimeout(() => closeNotif(), success ? 2000 : error ? 5000 : 3000)
      }
      style={{
        position: "absolute",
        top: "-10%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 100,
        borderRadius: 8,
        backgroundColor: getBackgroundColor(),
      }}
    >
      <div
        style={{
          minWidth: "40dvw",
          maxWidth: "80dvw",
          position: "relative",
          padding: "10px 20px",
        }}
      >
        <MdOutlineClose 
          style={{
            position: "absolute",
            top: "50%",
            right: 5,
            transform: "translate(0%, -50%)",
            cursor: "pointer",
            color: getTextColor(),
          }}
          onClick={closeNotif}
        />
        <Typography
          //   variant="caption"
          style={{
            display: "block",
            width: "90%",
            textAlign: "left",
            fontWeight: "bold",
            color: getTextColor(),
          }}
        >
          {message}
        </Typography>
      </div>
    </motion.div>
  );
};

export default Toast;
