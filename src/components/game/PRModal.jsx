import React from "react";
import { Box, Button, Typography } from "@mui/material";

const PRModal = ({ onClose, score,styles }) => {
  return (
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        bgcolor: "#fff",
        p: 4,
        borderRadius: 2,
        textAlign: "center",
        zIndex: 9999,
        boxShadow: 3,
        width: "80%",
      }}
    >
      <Typography variant="h5" gutterBottom color="primary">
        🎉 New Personal Record!
      </Typography>
      <Typography variant="h5" gutterBottom color="primary">
        {score}
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        You just set your highest score ever.
      </Typography>
      <Button style={{...styles.buttonStyle}} variant="contained" onClick={onClose}>
        Close
      </Button>
    </Box>
  );
};

export default PRModal;
