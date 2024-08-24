import React, { useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

const ChessGame = () => {
  const [game, setGame] = useState(new Chess());

  const makeMove = (move) => {
    const gameCopy = { ...game };
    const result = gameCopy.move(move);
    setGame(gameCopy);
    return result;
  };

  const onDrop = ({ sourceSquare, targetSquare }) => {
    const move = makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q", // auto-promote to a queen for simplicity
    });

    if (move === null) return false; // illegal move
    return true;
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
      <Chessboard />
    </div>
  );
};

export default ChessGame;
