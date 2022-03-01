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

  useEffect(() => {
    socket.on(
      ServerSentEventNames.room.connected,
      ({ room }: { room: string }) => {
        setEvent(`Joined game ${room}!`);
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
      {game && <GameDisplay socket={socket} game={game} />}
    </>
  );
};

export default RoomDisplay;
