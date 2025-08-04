// GameContainer.jsx
import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import GameScene from "./game/GameScene";

const GameContainer = ({ onHealthChange, onScoreChange, setMessage }) => {
  const gameRef = useRef(null);

useEffect(() => {
  const createGame = () => {
    const config = {
      type: Phaser.AUTO,
      width: Math.min(window.innerWidth, 1600),
      height: window.innerHeight,
      backgroundColor: "#6e6e6e",
      physics: {
        default: "arcade",
        arcade: { debug: false },
      },
      scene: [GameScene],
      parent: "game-container",
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    gameRef.current = new Phaser.Game(config);

    gameRef.current.scene.start("GameScene", {
      onHealthChange,
      onScoreChange,
      setMessage,
    });
  };

  createGame();

  const handleResize = () => {
    if (gameRef.current && gameRef.current.scale) {
      gameRef.current.scale.resize(
        Math.min(window.innerWidth, 1600),
        window.innerHeight
      );
    }
  };

  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize);
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }
  };
}, []);


  return <div id="game-container" />;
};

export default GameContainer;
