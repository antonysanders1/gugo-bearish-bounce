import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { motion } from "framer-motion";

const testPlayers = [
  { address: "0xaaa1", username: "Zeta", totalPoints: 98540 },
  { address: "0xaaa2", username: "Nova", totalPoints: 91230 },
  { address: "0xaaa3", username: "Quik", totalPoints: 89310 },
  { address: "0xaaa4", username: "Maxx", totalPoints: 87200 },
  { address: "0xaaa5", username: "JoJo", totalPoints: 85000 },
  { address: "0xaaa6", username: "Buzz", totalPoints: 83800 },
  { address: "0xaaa7", username: "Koda", totalPoints: 81020 },
  { address: "0xaaa8", username: "Ace", totalPoints: 79990 },
  { address: "0xaaa9", username: "Lulu", totalPoints: 77500 },
  { address: "0xaa10", username: "Dart", totalPoints: 76040 },
  { address: "0xaa11", username: "Zerk", totalPoints: 74100 },
  { address: "0xaa12", username: "Gigi", totalPoints: 71550 },
  { address: "0xaa13", username: "Bman", totalPoints: 70230 },
  { address: "0xaa14", username: "Flex", totalPoints: 68100 },
  { address: "0xaa15", username: "Roxy", totalPoints: 66790 },
  { address: "0xaa16", username: "Chub", totalPoints: 65900 },
  { address: "0xaa17", username: "Nemo", totalPoints: 64000 },
  { address: "0xaa18", username: "Fizz", totalPoints: 62000 },
  { address: "0xaa19", username: "Tusk", totalPoints: 60050 },
  { address: "0xaa20", username: "Zino", totalPoints: 58990 },
  { address: "0xaa21", username: "Axel", totalPoints: 57300 },
  { address: "0xaa22", username: "Bubu", totalPoints: 55810 },
  { address: "0xaa23", username: "Jinx", totalPoints: 54110 },
];

const Leaderboard = ({ playerAddress, onPlayAgain, styles, playerScore }) => {
  const [entries, setEntries] = useState([]);
  const [playerRank, setPlayerRank] = useState(null);
  const playerRef = useRef(null); // 👈 Ref to scroll into view
  const scrollContainerRef = useRef(null); // 👈 Ref for scrolling box

  useEffect(() => {
    const loadLeaderboard = async () => {
      const q = query(
        collection(db, "testLeaderboards"),
        orderBy("totalPoints", "desc"),
        limit(100)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc, index) => ({
        ...doc.data(),
        address: doc.id,
        rank: index + 1,
      }));
      setEntries(
        [...data, ...testPlayers].sort((a, b) => b.totalPoints - a.totalPoints)
      );

      const found = data.find(
        (d) => d.address.toLowerCase() === playerAddress.toLowerCase()
      );
      if (found) setPlayerRank(found.rank);
    };

    loadLeaderboard();
  }, [playerAddress]);

  useEffect(() => {
    // 👇 Scroll into view if player's row exists
    if (playerRef.current && scrollContainerRef.current) {
      playerRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [entries]);

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
        zIndex: 9998,
        boxShadow: 3,
        width: "80%",
        height: "80dvh",
        overflow: "hidden",
      }}
    >
      <Typography variant="h5" gutterBottom>
        🏆 Weekly Leaderboard
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-evenly",
          alignItems: "center",
          px: 2,
          mb: 1,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: "bold",
            color: "#444",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          0 GUGO BURNED
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: "bold",
            color: "#444",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Prize Pool: TBA
        </Typography>
      </Box>

      <Box
        ref={scrollContainerRef}
        sx={{
          maxHeight: "400px",
          overflowY: "auto",
          mt: 2,
          // border: "1px solid #444",
          // borderRadius: 2,
          scrollbarWidth: "none", // Firefox
          "&::-webkit-scrollbar": { display: "none" }, // Chrome/Safari
        }}
      >
        {entries.map((entry, i) => {
          const isCurrentPlayer =
            entry.address.toLowerCase() === playerAddress.toLowerCase();

          const MotionBox = motion(Box);
          const reverseIndex = entries.length - i;
          const delay = reverseIndex * 0.05;
          const duration = Math.max(0.3, 1 - reverseIndex * 0.008);

          return (
            <MotionBox
              key={entry.address}
              ref={isCurrentPlayer ? playerRef : null}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay, duration }}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                px: 3,
                py: 1.5,
                my: 1,
                mx: 2,
                backgroundColor: isCurrentPlayer ? "#fbcf57" : "#f9f9f9",
                fontWeight: isCurrentPlayer ? "bold" : "normal",
                borderRadius: "50px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              }}
            >
              <Typography sx={{ width: "15%", fontSize: "1rem" }}>
                #{entry.rank}
              </Typography>
              <Typography sx={{ width: "45%", fontSize: "1rem" }}>
                {entry.username}
              </Typography>
              <Typography
                sx={{
                  width: "40%",
                  textAlign: "right",
                  fontWeight: "medium",
                  fontSize: "1rem",
                }}
              >
                {entry.totalPoints.toLocaleString()} pts
              </Typography>
            </MotionBox>
          );
        })}
      </Box>

      {/* If NOT in top 100 */}
      {!playerRank && playerScore && (
        <Box
          sx={{
            position: "absolute",
            bottom: 80,
            left: "50%",
            transform: "translateX(-50%)",
            bgcolor: "#eee",
            px: 3,
            py: 2,
            borderRadius: 2,
            boxShadow: 2,
          }}
        >
          <Typography>
            Your Score: <strong>{playerScore.toLocaleString()} pts</strong>
          </Typography>
          <Typography color="text.secondary">
            Rank: Unlisted (keep climbing!)
          </Typography>
        </Box>
      )}

      <Button
        style={{ ...styles.buttonStyle }}
        variant="contained"
        color="primary"
        sx={{ mt: 4 }}
        onClick={onPlayAgain}
      >
        Play Again
      </Button>
    </Box>
  );
};

export default Leaderboard;
