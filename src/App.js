import React, { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import Confetti from "react-confetti";
import { Howl } from "howler";
import "./App.css";

const moveSound = new Howl({
  src: ["https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg"]
});

function App() {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [advice, setAdvice] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [vsComputer, setVsComputer] = useState(true);
  const [difficulty, setDifficulty] = useState("Medium"); // New
  const [winner, setWinner] = useState("");
  const [moveHistory, setMoveHistory] = useState([]);

  useEffect(() => {
    if (game.isGameOver()) {
      setGameOver(true);
      setWinner(game.turn() === "w" ? "Black wins!" : "White wins!");
      return;
    }

    if (vsComputer && game.turn() === "b") {
      setTimeout(() => {
        makeComputerMove();
      }, 500);
    }
  }, [game, vsComputer]);

  const handleMove = (sourceSquare, targetSquare) => {
    if (!game || game.isGameOver()) return false;
    if (vsComputer && game.turn() !== "w") return false;

    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    if (move === null) return false;

    moveSound.play();
    setFen(game.fen());
    setGame(new Chess(game.fen()));
    setMoveHistory(game.history());
    setAdvice("");
    return true;
  };

  const makeComputerMove = () => {
    const bestMove = findBestMove(game, difficulty);
    game.move(bestMove);
    moveSound.play();
    setFen(game.fen());
    setGame(new Chess(game.fen()));
    setMoveHistory(game.history());
  };

  const findBestMove = (gameInstance, level) => {
    const moves = gameInstance.moves();
    if (level === "Easy") {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    let bestEvaluation = -Infinity;
    let bestMove = moves[Math.floor(Math.random() * moves.length)];
    for (let move of moves) {
      const clone = new Chess(gameInstance.fen());
      clone.move(move);
      let evaluation = -evaluateBoard(clone);

      if (level === "Hard") {
        const nextMoves = clone.moves();
        for (let reply of nextMoves) {
          const replyClone = new Chess(clone.fen());
          replyClone.move(reply);
          evaluation += evaluateBoard(replyClone) * 0.5;
        }
      }

      if (evaluation > bestEvaluation) {
        bestEvaluation = evaluation;
        bestMove = move;
      }
    }
    return bestMove;
  };

  const evaluateBoard = (board) => {
    const pieceValue = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };
    let evaluation = 0;
    const boardState = board.board();
    for (let row of boardState) {
      for (let piece of row) {
        if (piece) {
          const value = pieceValue[piece.type] || 0;
          evaluation += piece.color === "w" ? value : -value;
        }
      }
    }
    return evaluation;
  };

  const getAdvice = () => {
    const moves = game.moves({ verbose: true });

    if (moves.length > 0) {
      const explainedMoves = moves.map((move) => {
        if (move.flags.includes('c')) return { move: move.san, reason: "captures an opponent's piece" };
        if (move.flags.includes('k')) return { move: move.san, reason: "puts the king in check" };
        if (['d', 'e'].includes(move.to[0])) return { move: move.san, reason: "controls the center" };
        if (move.flags.includes('e')) return { move: move.san, reason: "special en passant capture" };
        return { move: move.san, reason: "develops a piece toward safety or activity" };
      });

      const bestHint = explainedMoves[0]; // Pick the first best hint
      setAdvice(`Best Move: ${bestHint.move} — ${bestHint.reason}.`);
    } else {
      setAdvice("No advice available.");
    }
  };

  const undoMove = () => {
    game.undo();
    setFen(game.fen());
    setGame(new Chess(game.fen()));
    setMoveHistory(game.history());
  };

  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setAdvice("");
    setMoveHistory([]);
    setGameOver(false);
    setWinner("");
  };

  return (
    <div className="App" style={{ textAlign: "center" }}>
      <h1>Chess Learning App</h1>

      {gameOver && <Confetti />}
      {winner && <h2>{winner}</h2>}

      <div style={{ marginBottom: 20 }}>
        <label>
          <input
            type="radio"
            checked={vsComputer}
            onChange={() => setVsComputer(true)}
          />
          Play vs Computer
        </label>
        <label style={{ marginLeft: 15 }}>
          <input
            type="radio"
            checked={!vsComputer}
            onChange={() => setVsComputer(false)}
          />
          Play Solo (2 players)
        </label>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label>Difficulty: </label>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      {/* Centered Chessboard */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
        <Chessboard
          position={fen}
          onPieceDrop={(source, target) => handleMove(source, target)}
          boardWidth={600}
        />
      </div>

      <div style={{ marginTop: 20 }}>
        {gameOver ? (
          <button onClick={resetGame}>New Game</button>
        ) : (
          <>
            <button onClick={getAdvice}>Get Smart Hint</button>
            <button onClick={undoMove} style={{ marginLeft: "10px" }}>Undo Last Move</button>
            {advice && <p>{advice}</p>}
            <br />
            <button onClick={resetGame}>Reset Game</button>
          </>
        )}
      </div>

      {/* Move history */}
      <div style={{ marginTop: 30 }}>
        <h3>Move History:</h3>
        <ol>
          {moveHistory.map((move, idx) => (
            <li key={idx}>{move}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default App;

