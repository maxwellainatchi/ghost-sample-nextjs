import { randomUUID } from "crypto";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import {
  ClientSentEventNames,
  ServerSentEventNames,
} from "../utils/Types/SocketEvents";
import {
  GameState,
  GameStateAfterLoss,
  RoundLossState,
  RoundState,
} from "../utils/Types/State";

const RoundDisplay: React.FC<{ socket: Socket; round: RoundState }> = ({
  socket,
  round,
}) => {
  let [letter, setLetter] = useState("");

  return (
    <>
      <div style={{ textTransform: "uppercase" }}>
        {round.word}
        <span style={{ color: "grey" }}>{letter}</span>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          socket.emit(ClientSentEventNames.letter.sent, {
            letter,
          });
          setLetter("");
          return false;
        }}
      >
        <input
          minLength={1}
          maxLength={1}
          size={1}
          style={{ textAlign: "center" }}
          value={letter}
          onChange={({ target: { value } }) => setLetter(value)}
        />
        <button type="submit" disabled={round.turn !== socket.id}>
          Submit
        </button>
      </form>
    </>
  );
};

export default RoundDisplay;
