// /src/Main.jsx
import React, { useState, useCallback, useEffect, useContext } from "react";
import { Box, Button, Typography, LinearProgress } from "@mui/material";
import GameContainer from "./components/GameContainer";
import {
  useLoginWithAbstract,
  useAbstractClient,
  useGlobalWalletSignerAccount,
} from "@abstract-foundation/agw-react";
import { parseEther } from "viem";
import { AnimatePresence, motion } from "framer-motion";
import UsernameModal from "./game/UsernameModal";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../@shared/firebase/config";
import Leaderboard from "./game/Leaderboard";
import PRModal from "./game/PRModal";
import confetti from "canvas-confetti";
import { MainContext } from "../../App";

function Main() {
  const {Theme} = useContext(MainContext)
  const [started, setStarted] = useState(false);
  const [health, setHealth] = useState(4);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [multiplier, setMultiplier] = useState(2);
  const [message, setMessage] = useState(null);

  //user state
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [hasData, setHasData] = useState(null);

  //leaderboard
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showPRModal, setShowPRModal] = useState(false);
  const [isNewPR, setIsNewPR] = useState(false);


  // UI Queues
  const [platformsReached, setPlatformsReached] = useState(0)
  const [babyBearsCollected, setBabyBearsCollected] = useState(0) 
  const [babyDucksCollected, setBabyDucksCollected] = useState(0) 
  const [fishCollected, setFishCollected] = useState(0) 
  const [honeyCollected, setHoneyCollected] = useState(0) 
  const [grapesCollected, setGrapesCollected] = useState(0) 

  const handleLeaderboardUpdate = async (walletAddress, score) => {
    const ref = doc(db, "testLeaderboards", walletAddress.toLowerCase());
    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const data = snap.data();
    const newTotal = (data.totalPoints || 0) + score;
    const newPR =
      score > (data.personalRecord || 0) ? score : data.personalRecord;
    const newLives = Math.max((data.lives || 3) - 1, 0);

    await updateDoc(ref, {
      totalPoints: newTotal,
      personalRecord: newPR,
      lives: newLives,
    });

    console.log("🏁 Leaderboard updated:", { newTotal, newPR, newLives });
  };

  const { address: signerAddress, status: signerStatus } =
    useGlobalWalletSignerAccount();

  const { login, logout, isConnected } = useLoginWithAbstract();
  const { data: agwClient } = useAbstractClient();

  useEffect(() => {
    console.log("🧾 Signer EOA:", signerAddress, "Status:", signerStatus);
  }, [signerAddress, signerStatus]);

  useEffect(() => {
    console.log("AGW connection status:", isConnected);
  }, [isConnected]);

  useEffect(() => {
    if (agwClient?.address) {
      console.log("AGW Wallet Address:", agwClient.address);
      console.log(
        "🔗 Connected to:",
        agwClient.chain?.network || agwClient.chain?.name
      );
    }
  }, [agwClient]);

  useEffect(() => {
    console.log("AGW Client Data:", agwClient);
  }, [agwClient]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (gameOver && signerAddress) {
      const ref = doc(db, "testLeaderboards", signerAddress.toLowerCase());

      getDoc(ref).then(async (docSnap) => {
        if (docSnap.exists()) {
          setHasData(true);

          const data = docSnap.data();
          const newTotal = (data.totalPoints || 0) + score;
          const newPR =
            score > (data.personalRecord || 0) ? score : data.personalRecord;
          const newLives = Math.max((data.lives || 3) - 1, 0);

          const gotNewPR = score > (data.personalRecord || 0);
          setIsNewPR(gotNewPR);

          await updateDoc(ref, {
            totalPoints: newTotal,
            personalRecord: newPR,
            lives: newLives,
          });

          console.log("🏁 Leaderboard updated:", { newTotal, newPR, newLives });

          if (gotNewPR) {
            setShowPRModal(true);
            confetti({ particleCount: 150, spread: 100, origin: { y: 0.3 } });
          } else {
            setShowLeaderboard(true);
          }
        } else {
          setShowUsernameModal(true); // new user
        }
      });
    }
  }, [gameOver]);

  const handleScoreChange = useCallback((newScore, newMultiplier) => {
    setScore(newScore);
    setMultiplier(newMultiplier);
  }, []);

  const handleHealthChange = (amount) => {
    setHealth((prev) => {
      const newHealth =
        Math.max(0, prev + amount) > 4 ? 4 : Math.max(0, prev + amount);
      if (newHealth === 0) {
        setGameOver(true);
      }
      return newHealth;
    });
  };

  const handlePayToPlay = async () => {
    if (!agwClient || !agwClient.sendTransaction) {
      console.error(
        "⚠️ AGW client not ready or sendTransaction method missing"
      );
      return false;
    }

    try {
      const txHash = await agwClient.sendTransaction({
        to: "0x65E1C0cCB719B4818ade39C5D84cD7de445BCA27", // Dev wallet
        value: parseEther("0.0001"), // 0.0001 ETH
      });

      console.log("✅ Transaction hash:", txHash);
      return true;
    } catch (err) {
      console.error("❌ Failed to pay to play:", err);
      return false;
    }
  };


  const styles = {
    buttonStyle:{
              borderLeft: `3px solid ${Theme.palette.primary.dark}`,
              borderTop: `3px solid ${Theme.palette.primary.dark}`,
              borderRight: `3px solid ${Theme.palette.primary.dark}`,
              borderBottom: `3px solid ${Theme.palette.primary.light}`,
              borderRadius:'100px'
    }
  }

  return (
    <Box
      position="relative"
      height="100vh"
      bgcolor="#121212"
      sx={{
        width: { xs: "100dvw", 
          // md: "600px", sm:'400px' 
        },
        height: "100dvh",
        containerType: "inline-size",
        display:'flex',
        justifyContent:'center',
        alignItems:'center'
      }}
    >
      <img 
      src={require('./main-bg.png')}
      alt=''
      style={{
        position: 'absolute',
        alignItemsn:'center',
        justifyContent:'center',
        tranform:'translate(-50%. -50%)',
        width:'100%',
        height:'100%',
        objectFit:'cover',
        zIndex:0,
        fitler: started || gameOver ? 'blur(5px)' : 'none'
      }} />
      {/* 🔐 AGW Connect Button */}
      
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          height="100%"
          sx={{width:{xs:'100%', md: '600px'}, borderRight:(started && window.innerWidth > 600) && '3px solid white' , borderLeft: (started && window.innerWidth > 600) && '3px solid white'}}
style={{          zIndex:1
}}        >
 { !started || gameOver ? 
 (<>
 <Typography variant="h4" color="white" mb={2} style={{fontWeight:900}}>
            {gameOver ? "Game Over" : "GUGO Bearish Bounce"}
          </Typography>
          {agwClient?.account?.address ? (
            <Button
            style={{...styles.buttonStyle}}
              variant="contained"
              color="primary"
              onClick={async () => {
                console.log("AGW Client before pay-to-play:", agwClient);
                //   setStarted(true);
                //   setGameOver(false);
                const success = await handlePayToPlay();
                if (success) {
                  setStarted(true);
                  setGameOver(false);
                  setHealth(4);
                  setScore(0);
                }
              }}
            >
              {gameOver ? "Restart" : "Start Game"}
            </Button>
          ) : (
            <Button
            style={{...styles.buttonStyle}}
              variant="contained"
              color="primary"
              onClick={async () => {
                console.log("🔐 Connecting wallet...");
                try {
                  await login();
                  console.log("✅ Login initiated (no return value)");
                } catch (e) {
                  console.error("❌ Wallet login failed:", e);
                }
              }}
            >
              Connect Wallet
            </Button>
          )}
 </>)
 : (  <>
          {/* 🎯 Message Overlay */}
          <AnimatePresence>
            {message && (
              <motion.div
                key="multiplier-message"
                initial={{ scale: 0.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.2, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 20,
                  duration: 0.6,
                }}
                style={{
                  position: "absolute",
                  top: "10%",
                  left: "30%",
                  //   transform: "translate(-50%, 0%)",
                  zIndex: 1000,
                }}
              >
                <Typography
                  color={message.includes("x Combo!") ? "error" : "primary"}
                  style={{
                    // position: "absolute",
                    // top: "10%",
                    // left: "50%",
                    // transform: "translate(-50%, 0%)",
                    fontSize: "12cqw",
                    fontWeight: 900,
                    textShadow: `-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff`,
                    rotate: "-4deg",
                    letterSpacing: -3,
                    zIndex: 1000,
                  }}
                >
                  {message.split(" ")[0]}
                  <span style={{ fontSize: "6cqw" }}>
                    {message.split(" ")[1]}
                  </span>
                </Typography>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 🎯 Health Bar Overlay */}
          <Box position="absolute" top={5} left={20} width={200} zIndex={1}>
            <Typography color="white" variant="body2">
              Health: {health}/4
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(health / 4) * 100}
              color={health <= 1 ? "error" : "secondary"}
              style={{ height: 15, borderRadius: 25 }}
            />
          </Box>
          {/* 🏆 Score Overlay (top-right) */}
          <Box position="absolute" top={20} right={20} zIndex={1}>
            <Typography color="white" variant="body2">
              Score: {score}
            </Typography>
            <Typography color="white" variant="body2">
              Multiplier: x{multiplier}
            </Typography>
          </Box>
          {/* 🕹 Game Canvas */}
          <GameContainer
            onHealthChange={handleHealthChange}
            onScoreChange={handleScoreChange}
            setMessage={setMessage}
          />
          {started && !gameOver && (
            <Box
              sx={{
                position: "absolute",
                bottom: 70,
                left: "50%",
                transform: "translateX(-50%)",
                display:{xs:'box', md:'none'},
                width: "98%",
                height: "60px",
                backgroundColor: "#222",
                borderRadius: "30px",
                zIndex: 1000,
                touchAction: "none",
              }}
              onTouchStart={(e) => {
                const touch = e.touches[0];
                const box = e.currentTarget.getBoundingClientRect();
                const deltaX = touch.clientX - box.left - box.width / 2;
                const direction = deltaX / (box.width / 2);
                window.dispatchEvent(
                  new CustomEvent("sliderMove", { detail: { direction } })
                );
              }}
              onTouchMove={(e) => {
                const touch = e.touches[0];
                const box = e.currentTarget.getBoundingClientRect();
                const deltaX = touch.clientX - box.left - box.width / 2;
                const direction = deltaX / (box.width / 2);
                window.dispatchEvent(
                  new CustomEvent("sliderMove", { detail: { direction } })
                );
              }}
              onTouchEnd={() => {
                window.dispatchEvent(
                  new CustomEvent("sliderMove", { detail: { direction: 0 } })
                );
              }}
            />
          )}
        </>)
 }
          
        </Box>
      

      {agwClient?.account?.address && (
        <Box
          style={{
            width: "90%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "absolute",
            bottom: 5,
            left: "50%",
            transform: "translate(-50%, 0%)",
          }}
        >
          <Button style={{...styles.buttonStyle}} variant="contained" color="primary" onClick={logout}>
            Disconnect Wallet
          </Button>
          <Typography variant="caption" color="white">
            Address:{" "}
            {agwClient.account.address.slice(0, 8) +
              "....." +
              agwClient.account.address.slice(-3)}
          </Typography>
        </Box>
      )}

      {showUsernameModal && (
        <UsernameModal
        styles={styles}
          walletAddress={signerAddress}
          score={finalScore}
          onComplete={() => {
            setShowUsernameModal(false);
            setHasData(true);
            setShowLeaderboard(true);
          }}
        />
      )}

      {showLeaderboard && (
        <Leaderboard
        styles={styles}
          playerAddress={signerAddress}
          onPlayAgain={() => {
            setGameOver(false);
            setScore(0);
            setHealth(4);
            setShowLeaderboard(false);
            setStarted(true); // restart game
          }}
        />
      )}

      {showPRModal && (
        <PRModal
        styles={styles}
          score={score}
          onClose={() => {
            setShowPRModal(false);
            setShowLeaderboard(true); // now show the board after closing
          }}
        />
      )}
    </Box>
  );
}

export default Main;
