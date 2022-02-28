import { useEffect, useState } from "react";
import io from "Socket.IO-Client";
import { Socket } from "socket.io-client";
import { LetterAck } from "../utils/Types/SocketEvents";

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
  let [word, setWord] = useState("");
  let [letter, setLetter] = useState("");

  socket?.onAny(console.log);

  return (
    <>
      <div>
        {word}
        <span style={{ color: "grey" }}>{letter.toUpperCase()}</span>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          socket.emit("letter", letter, ((response) => {
            if (!response.success) {
              console.log("fail");
            }
            setWord(response.state.word);
          }) as LetterAck);
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
        <button type="submit">Submit</button>
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
