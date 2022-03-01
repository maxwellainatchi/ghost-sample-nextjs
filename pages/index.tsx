import { useEffect, useState } from "react";
import io from "Socket.IO-Client";
import { Socket } from "socket.io-client";
import State from "../utils/Types/State";

const socketInitializer = async (): Promise<Socket> => {
  await fetch("/api/socket");
  let socket = io();

  socket.on("connect", () => {
    console.log("connected");
  });
  return socket;
};

const useSocket = (): Socket | undefined => {
  let [socket, setSocket] = useState<Socket | undefined>();

  useEffect(() => {
    socketInitializer().then(setSocket);
  }, []);

  return socket;
};

const GC: React.FC<{ socket: Socket }> = ({ socket }) => {
  let [state, setState] = useState<State>({
    isPlaying: false,
    turn: "",
    word: "",
  });

  let [letter, setLetter] = useState("");

  useEffect(() => {
    socket.onAny(console.log);

    socket.on(
      "letter.received",
      ({ letter, state }: { letter: string; state: State }) => {
        setState(state);
      }
    );

    socket.on(
      "connected",
      ({ roomName, state }: { roomName: string; state: State }) => {
        setState(state);
      }
    );

    socket.on("game.begin", (state: State) => {
      setState(state);
    });
  }, []);

  return (
    <>
      {}
      <div style={{ textTransform: "uppercase" }}>
        {state?.word}
        <span style={{ color: "grey" }}>{letter}</span>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          socket.emit("letter.sent", {
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

const Home = () => {
  const socket = useSocket();

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <h1>GHOST</h1>
      {socket ? <GC socket={socket} /> : <div>Loading...</div>}
    </div>
  );
};

export default Home;
