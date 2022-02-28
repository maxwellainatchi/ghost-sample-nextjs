import { NextApiHandler } from "next";
import { Server } from "Socket.IO";
import { LetterHandler } from "../../utils/Types/SocketEvents";
import State from "../../utils/Types/State";

let state: State = {
  word: "",
};

const SocketHandler: NextApiHandler = (req, res) => {
  if ((res.socket as any)?.server?.io) {
    console.log("Socket is already running");
  } else {
    console.log("Socket is initializing");
    const io = new Server((res.socket as any)?.server);
    (res.socket as any).server.io = io;

    io.on("connection", (socket) => {
      console.log("Socket connected");
      socket.on("letter", ((letter, ack) => {
        console.log("Letter received: ", letter);
        state.word += letter;
        ack({
          success: true,
          state,
        });
      }) as LetterHandler);
    });

    console.log("Socket initialized");
  }
  res.end();
};

export default SocketHandler;
