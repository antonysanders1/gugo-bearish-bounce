import React, { useState } from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../../@shared/firebase/config";

const UsernameModal = ({ walletAddress, score, onComplete, styles }) => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const trimmed = username.trim().toUpperCase();

    if (trimmed.length < 3 || trimmed.length > 5) {
      return setError("Username must be 3–5 characters.");
    }

    try {
      await setDoc(
        doc(db, "testLeaderboards", walletAddress.toLowerCase()),
        {
          username: trimmed,
          totalPoints: score,
          personalRecord: score,
          lives: 3,
        },
        { merge: true }
      );
      onComplete(); // signal to close modal + load leaderboard
    } catch (err) {
      console.error("❌ Failed to save username:", err);
      setError("Something went wrong. Try again.");
    }
  };

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
        height: "80dvh",
      }}
    >
      <Typography variant="h6" gutterBottom>
        🧾 New High Score!
      </Typography>
      <Typography mb={2}>Enter your name (3–5 chars)</Typography>
      <TextField
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        inputProps={{ maxLength: 6, style: { textTransform: "uppercase" } }}
        placeholder="NAME"
        fullWidth
        sx={{ mb: 2 }}
        autoFocus
      />
      {error && <Typography color="error">{error}</Typography>}
      <Button 
      style={{...styles.buttonStyle}}
      variant="contained" onClick={handleSubmit}>
        Submit Score
      </Button>
    </Box>
  );
};

export default UsernameModal;
