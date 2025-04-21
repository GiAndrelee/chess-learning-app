import React from "react";

const Feedback = ({ mistakes }) => {
  return (
    <div>
      <h2>Mistakes</h2>
      {mistakes.length === 0 ? (
        <p>No mistakes yet. Great job!</p>
      ) : (
        <ul>
          {mistakes.map((move, i) => (
            <li key={i}>
              You moved {move.piece} from {move.from} to {move.to} – review better options!
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Feedback;
