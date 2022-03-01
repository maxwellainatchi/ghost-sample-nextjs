import { randomUUID } from "crypto";
import { stat } from "fs/promises";
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
import RoundDisplay from "./RoundDisplay";

const isLossState: (state: GameState) => state is GameStateAfterLoss = (
  state
) => "lastRoundState" in state;

const GameDisplay: React.FC<{ socket: Socket; game: GameState }> = ({
  socket,
  game,
}) => {
  let [state, setState] = useState(game);
  let [event, setEvent] = useState("");

  useEffect(() => {
    socket.on(ServerSentEventNames.round.begin, (state: GameState) => {
      setState(state);
      setEvent("Round has begun!");
    });
    socket.on(
      ServerSentEventNames.letter.received,
      ({ letter, state }: { letter: string; state: GameState }) => {
        setState(state);
        setEvent(
          socket.id === state.currentRoundState!.turn
            ? "Your turn"
            : "Opponent's turn"
        );
      }
    );
    socket.on(
      ServerSentEventNames.round.end,
      (lossState: GameStateAfterLoss) => {
        // TODO: handle game end
        setState(lossState);
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
      {state.currentRoundState && (
        <RoundDisplay socket={socket} round={state.currentRoundState} />
      )}
      {isLossState(state) && (
        <>
          <p style={{ textTransform: "uppercase" }}>
            {state.lastRoundState.word}
          </p>
          <button onClick={() => socket.emit(ClientSentEventNames.round.next)}>
            Next Round
          </button>
        </>
      )}
      <div>
        {Object.entries(state.letters).map(([name, letters]) => (
          <div key={name}>
            {name}
            {name === socket.id ? " (you)" : ""}: {letters}
          </div>
        ))}
      </div>
    </>
  );
};

export default GameDisplay;
