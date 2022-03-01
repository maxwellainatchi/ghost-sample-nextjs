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
import RoundDisplay from "./RoundDisplay";

const GameDisplay: React.FC<{ socket: Socket; game: GameState }> = ({
  socket,
  game,
}) => {
  let [state, setState] = useState(game);
  let [event, setEvent] = useState("");

  useEffect(() => {
    socket.on(
      ServerSentEventNames.round.end,
      (lossState: GameStateAfterLoss) => {
        // TODO: handle game end
        setState(lossState);
        setEvent(
          `Game ended! You ${
            lossState.lastRoundState.loser === socket.id ? "lose" : "win"
          }!`
        );
      }
    );
  }, []);

  return (
    <>
      <h3>{event}</h3>
      {game.currentRoundState && (
        <RoundDisplay socket={socket} round={game.currentRoundState} />
      )}
    </>
  );
};

export default GameDisplay;
