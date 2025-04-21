import React, { useState } from "react";
import Chessboard from "chessboardjsx";
import { Chess } from "chess.js";
import Feedback from "./Feedback";

const App = () => {
  const [game, setGame] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState([]);
  const [mistakes, setMistakes] = useState([]);

  const handleMove = ({ sourceSquare, targetSquare }) => {
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    if (move === null) return;

    const newHistory = [...moveHistory, move];
    const mistakeDetected = checkForMistake(move);

    if (mistakeDetected) {
      setMistakes([...mistakes, move]);
    }

    setMoveHistory(newHistory);
    setGame(new Chess(game.fen()));
  };

  const checkForMistake = (move) => {
    return move.flags !== "c";
  };

  return (
    <div className="App">
      <h1>LearnChess - Mistake Analyzer</h1>
      <Chessboard position={game.fen()} onDrop={handleMove} />
      <Feedback mistakes={mistakes} />
    </div>
  );
};

export default App;
