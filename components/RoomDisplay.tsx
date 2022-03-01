import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import {
  ClientSentEventNames,
  ServerSentEventNames,
} from "../utils/Types/SocketEvents";
import { GameState } from "../utils/Types/State";
import GameDisplay from "./GameDisplay";

const RoomDisplay: React.FC<{ socket: Socket }> = ({ socket }) => {
  let [event, setEvent] = useState("");
  let [game, setGame] = useState<GameState>();
  let [canBegin, setCanBegin] = useState(false);

  useEffect(() => {
    socket.on(
      ServerSentEventNames.room.connected,
      ({
        room,
        state,
        canBegin,
      }: {
        room: string;
        state: GameState;
        canBegin: boolean;
      }) => {
        setGame(state);
        setEvent(`Joined room ${room}!`);
        setCanBegin(canBegin);
      }
    );

    socket.on(
      ServerSentEventNames.player.joined,
      ({
        player,
        state,
        canBegin,
      }: {
        player: string;
        state: GameState;
        canBegin: boolean;
      }) => {
        setGame(state);
        if (player !== socket.id) {
          setEvent(`Player ${player} just joined!`);
        }
        setCanBegin(canBegin);
      }
    );

    socket.on(
      ServerSentEventNames.game.begin,
      ({ state }: { state: GameState }) => {
        setEvent("Game has begun!");
        setGame(state);
      }
    );
  }, []);

  return (
    <>
      <h2>Your Name: {socket.id}</h2>
      <h3>{event}</h3>
      {game?.isPlaying ? (
        <GameDisplay socket={socket} game={game} />
      ) : (
        <button
          disabled={!canBegin}
          onClick={() => {
            socket.emit(ClientSentEventNames.game.begin);
          }}
        >
          Start Game
        </button>
      )}
      {!game?.isPlaying && (
        <>
          <div>Players:</div>
          <div>
            {game?.players.map((player) => (
              <p>
                {player}
                {player === socket.id ? " (you)" : ""}
              </p>
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default RoomDisplay;
