// /src/Main.jsx
import React, { useState, useCallback, useEffect, useContext } from "react";
import { Box, Button, Typography, LinearProgress, Modal, Grid } from "@mui/material";
import GameContainer from "./GameContainer";
import {
  useLoginWithAbstract,
  useAbstractClient,
  useGlobalWalletSignerAccount,
} from "@abstract-foundation/agw-react";
import { parseEther } from "viem";
import { AnimatePresence, motion } from "framer-motion";
import UsernameModal from "./game/UsernameModal";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import Leaderboard from "./game/Leaderboard";
import PRModal from "./game/PRModal";
import confetti from "canvas-confetti";
import { MainContext } from "../App";
import musicFile from "../assets/music.mp3";


function Main() {
  const { Theme, bgMusic,
    setBgMusic,
    isMuted,
    setIsMuted } = useContext(MainContext)
  const [connectModalOpen, setConnectModalOpen] = useState(0)
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
    buttonStyle: {
      borderLeft: `3px solid ${Theme.palette.primary.dark}`,
      borderTop: `3px solid ${Theme.palette.primary.dark}`,
      borderRight: `3px solid ${Theme.palette.primary.dark}`,
      borderBottom: `3px solid ${Theme.palette.primary.light}`,
      borderRadius: '100px'
    }
  }

  return (
    <Box
      position="relative"
      height="100vh"
      bgcolor="#121212"
      sx={{
        width: {
          xs: "100dvw",
          // md: "600px", sm:'400px' 
        },
        height: "100dvh",
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow:'hidden'
      }}
    >

      <Button
        onClick={() => {
          if (bgMusic) {
            bgMusic.muted = !isMuted;
            setIsMuted(!isMuted);
          }
        }}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 9999,
          backgroundColor: "#00000088",
          color: "white",
          borderRadius: 50,
          padding: "6px 12px",
          fontWeight: 600
        }}
      >
        {isMuted ? "Unmute 🔇" : "Mute 🔊"}
      </Button>
      <img
        src={window.innerWidth < 500 ? require('../assets/mobile-bg.png') : require('../assets/main-bg.png')}
        alt=''
        style={{
          position: 'absolute',
          alignItemsn: 'center',
          justifyContent: 'center',
          tranform: 'translate(-50%. -50%)',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
          filter: started || gameOver ? 'blur(5px)' : 'none'
        }} />


      {/* 🐤 Baby Duck - fade in + slide from left */}
      <motion.img
        src={require('../assets/main-babyduck.png')}
        alt="baby duck"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, delay: .4 }}
        style={{
          position: 'absolute',
          left: window.innerWidth < 500 ? '-35%' : 0,
          top: window.innerWidth < 500 ? '6.5%' : 0,
          width: window.innerWidth < 500 ? 'auto' : '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
          filter: started || gameOver ? 'blur(5px)' : 'none',
        }}
      />
      {/* 🐻 Baby Bear - fade in + slide from left */}
      <motion.img
        src={require('../assets/main-bear.png')}
        alt=""
        initial={{ opacity: 0, y: -120 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.6, delay: .7 }}
        style={{
          position: 'absolute',
          width: window.innerWidth < 500 ? 'auto' : '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
          filter: started || gameOver ? 'blur(5px)' : 'none',
        }}
      />

      <motion.img
        src={require('../assets/main-duck.png')}
        alt="duck"
        initial={{ opacity: 0, x: 120 }}
        animate={{ opacity: 1, x: window.innerWidth < 500 ? -180 : 0 }}
        transition={{ duration: 1.5, delay: 1.2 }}
        style={{
          position: 'absolute',
          width: window.innerWidth < 500 ? 'auto' : '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
          filter: started || gameOver ? 'blur(5px)' : 'none',
        }}
      />

      <motion.img
        src={require('../assets/main-bearr.png')}
        alt=""
        initial={{ opacity: 0, x: 120 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.4, delay: 1.2 }}
        style={{
          position: 'absolute',
          width: window.innerWidth < 500 ? 'auto' : '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
          filter: started || gameOver ? 'blur(5px)' : 'none',
        }}
      />



      {/* 🔐 AGW Connect Button */}

      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100%"
        sx={{ width: { xs: '100%', md: '600px' }, borderRight: (started && window.innerWidth > 600) && '3px solid white', borderLeft: (started && window.innerWidth > 600) && '3px solid white' }}
        style={{
          zIndex: 1,
          containerType: "inline-size",
          position: 'relative'
        }}
      >
        {!started || gameOver ?
          (<>
            {gameOver ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 180, damping: 12 }}
              >
                <Typography
                  variant="h4"
                  color="white"
                  mb={2}
                  style={{
                    textShadow:
                      "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
                  }}
                >
                  Game Over
                </Typography>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.7, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 140,
                  damping: 10,
                  delay: 1.5,
                }}
              >
                <Typography
                  variant="h3"
                  color="secondary.light"
                  mb={4}
                  style={{
                    textShadow:
                      "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
                    lineHeight: ".67",
                    rotate: "-8deg",
                    fontSize: "12cqw",
                  }}
                >
                  GUGO <br />
                  <span
                    style={{
                      fontFamily: `"Rubik Bubbles", system-ui`,
                      color: Theme.palette.secondary.dark,
                    }}
                  >
                    Bearish
                  </span>
                  <br />
                  <span style={{ color: Theme.palette.info.main }}>Bounce</span>
                </Typography>
              </motion.div>
            )}

            {!started && (
              <motion.div
                style={{
                  padding: "12px 24px",
                  borderRadius: "12px",
                  backgroundColor: "#3B853998",
                  color: Theme.palette.text.light,
                  marginBottom: "16px",
                  textAlign: "center",
                  border: "#B96E1E solid 2px"
                }}
                animate={{
                  boxShadow: [
                    `0 0 10px ${Theme.palette.secondary.dark}, 0 0 20px ${Theme.palette.secondary.dark}aa, 0 0 30px ${Theme.palette.primary.dark}88`,
                    `0 0 20px ${Theme.palette.secondary.main}, 0 0 30px ${Theme.palette.secondary.main}cc, 0 0 40px ${Theme.palette.primary.main}aa`,
                    `0 0 10px ${Theme.palette.secondary.dark}, 0 0 20px ${Theme.palette.secondary.dark}aa, 0 0 30px ${Theme.palette.primary.dark}88`,
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Typography variant="h6" style={{ textShadow: `-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000`, }}>
                  Test Challenge Bonus!
                </Typography>
                <Typography variant="body1" style={{ textShadow: `-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000`, }}>
                  Reward: 0.1 Test ETH
                </Typography>
                <Typography variant="body2" style={{ color: Theme.palette.text.light, textShadow: `-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000` }}>
                  Reach 10,000,000 points in one run to claim!
                </Typography>
              </motion.div>
            )}


            {agwClient?.account?.address ? (
              <>
                <Button
                  style={{ ...styles.buttonStyle }}
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
                  {gameOver ? "Restart" : "Start Game .0001 eth"}
                </Button>

              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.7, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 140,
                  damping: 10,
                  delay: 1.5,
                }}
              >
                <Button
                  style={{ ...styles.buttonStyle, marginTop: '25%' }}
                  variant="contained"
                  color="primary"
                  // onClick={async () => {
                  //   console.log("🔐 Connecting wallet...");
                  //   try {
                  //     await login();
                  //     console.log("✅ Login initiated (no return value)");
                  //   } catch (e) {
                  //     console.error("❌ Wallet login failed:", e);
                  //   }
                  // }}
                  onClick={() => {
                    setConnectModalOpen(true)
                    if (!bgMusic) {
                      const audio = new Audio(musicFile);
                      audio.loop = true;
                      audio.volume = isMuted ? 0 : 1;
                      audio.play();
                      setBgMusic(audio);
                    } else {
                      bgMusic.volume = isMuted ? 0 : 1;
                      bgMusic.play();
                    }
                  }}
                >
                  Play
                </Button>
              </motion.div>
            )}
          </>)
          : (<>
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
            <Box position="absolute" top={5} left={20} width={200} zIndex={1} style={{ textShadow: `-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000` }}>
              <Typography color="white" variant="body2">
                Health: {health}/4
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(health / 4) * 100}
                color={health <= 1 ? "error" : "info"}
                style={{ height: 15, borderRadius: 25 }}
              />
            </Box>
            {/* 🏆 Score Overlay (top-right) */}
            <Box position="absolute" top={20} right={20} zIndex={1}>
              <Typography color="white" variant="body2" style={{ textShadow: `-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000` }}>
                Score: {score}
              </Typography>
              <Typography color="white" variant="body2" style={{ textShadow: `-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000` }}>
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
                  display: { xs: 'flex', md: 'none' },
                  width: "98%",
                  height: "60px",
                  backgroundColor: "#222",
                  borderRadius: "30px",
                  overflow: "hidden",
                  zIndex: 1000,
                  touchAction: "none",
                }}
              >
                <Button
                  sx={{
                    width: "50%",
                    height: "100%",
                    borderRight: "1px solid #444",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "18px",
                    backgroundColor: "#333",
                    "&:active": { backgroundColor: "#555" },
                  }}
                  onTouchStart={() => {
                    window.dispatchEvent(new CustomEvent("sliderMove", { detail: { direction: -1 } }));
                  }}
                  onTouchEnd={() => {
                    window.dispatchEvent(new CustomEvent("sliderMove", { detail: { direction: 0 } }));
                  }}
                  onMouseDown={() => {
                    window.dispatchEvent(new CustomEvent("sliderMove", { detail: { direction: -1 } }));
                  }}
                  onMouseUp={() => {
                    window.dispatchEvent(new CustomEvent("sliderMove", { detail: { direction: 0 } }));
                  }}
                >
                  ← Left
                </Button>

                <Button
                  sx={{
                    width: "50%",
                    height: "100%",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "18px",
                    backgroundColor: "#333",
                    "&:active": { backgroundColor: "#555" },
                  }}
                  onTouchStart={() => {
                    window.dispatchEvent(new CustomEvent("sliderMove", { detail: { direction: 1 } }));
                  }}
                  onTouchEnd={() => {
                    window.dispatchEvent(new CustomEvent("sliderMove", { detail: { direction: 0 } }));
                  }}
                  onMouseDown={() => {
                    window.dispatchEvent(new CustomEvent("sliderMove", { detail: { direction: 1 } }));
                  }}
                  onMouseUp={() => {
                    window.dispatchEvent(new CustomEvent("sliderMove", { detail: { direction: 0 } }));
                  }}
                >
                  Right →
                </Button>
              </Box>

            )}
          </>)
        }

        <Modal open={!!connectModalOpen} onClose={() => setConnectModalOpen(false)}>
          <Grid
            container
            xs={11}
            md={6}
            lg={4}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: "32px 24px",
              boxShadow: "0 0 40px rgba(0,0,0,0.4)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              zIndex: 9999
            }}
          >
            <Typography variant="h5" gutterBottom color="primary" style={{}}>
              Connect Your Wallet
            </Typography>

            <Typography variant="body1" style={{ marginBottom: "24px", color: Theme.palette.text.secondary, }}>
              To play the game and compete for rewards, you'll need to connect your wallet and pay with $ETH.
              <br /><br />
              Or click **Practice** below to try it out for free!
            </Typography>

            <Button
              style={{ ...styles.buttonStyle, marginBottom: "16px" }}
              variant="contained"
              color="primary"
              onClick={async () => {
                console.log("🔐 Connecting wallet...");
                try {
                  await login();
                  console.log("✅ Login initiated (no return value)");
                  setConnectModalOpen(false);
                } catch (e) {
                  console.error("❌ Wallet login failed:", e);
                }
              }}
            >
              Connect Wallet
            </Button>

            <Button
              style={styles.buttonStyle}
              variant="outlined"
              color="primary"
              onClick={() => {
                console.log("🕹 Practice Mode from modal");
                setStarted(true);
                setGameOver(false);
                setHealth(4);
                setScore(0);
                setConnectModalOpen(false);
              }}
            >
              Practice Mode
            </Button>
          </Grid>
        </Modal>


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
          <Button style={{ ...styles.buttonStyle }} variant="contained" color="primary" onClick={logout}>
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

          onPlayAgain={async () => {
            console.log("AGW Client before pay-to-play:", agwClient);
            //   setStarted(true);
            //   setGameOver(false);
            const success = await handlePayToPlay();
            if (success) {
              setStarted(true);
              setGameOver(false);
              setShowLeaderboard(false);
              setHealth(4);
              setScore(0);
            }
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
