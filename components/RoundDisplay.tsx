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
  let [state, setState] = useState<RoundState>(round);
  let [event, setEvent] = useState("");
  let [letter, setLetter] = useState("");

  useEffect(() => {
    socket.on(ServerSentEventNames.round.begin, (roundState: RoundState) => {
      setState(roundState);
      setEvent("Round has begun!");
    });
    socket.on(
      ServerSentEventNames.letter.received,
      ({ letter, state }: { letter: string; state: RoundState }) => {
        setEvent(socket.id === state.turn ? "Your turn" : "Opponent's turn");
        setState(state);
      }
    );
    socket.on(
      ServerSentEventNames.round.end,
      (lossState: GameStateAfterLoss) => {
        // TODO: handle game end
        setState(lossState.lastRoundState);
        setEvent(
          `Round ended! You ${
            lossState.lastRoundState.loser === socket.id ? "lose" : "win"
          }!`
        );
      }
    );
  }, []);

  return (
    <>
      <h3>{event}</h3>
      <div style={{ textTransform: "uppercase" }}>
        {state.word}
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
        <button type="submit" disabled={state.turn !== socket.id}>
          Submit
        </button>
      </form>
    </>
  );
};

export default RoundDisplay;
