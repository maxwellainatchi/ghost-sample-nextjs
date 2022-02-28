import { NextApiHandler } from "next";
import { Server } from "Socket.IO";
import Room from "../../utils/Room";
import { LetterHandler } from "../../utils/Types/SocketEvents";
import State from "../../utils/Types/State";

let rooms: Room[] = [];
let freeRoom: Room | undefined;

const SocketHandler: NextApiHandler = (req, res) => {
  if ((res.socket as any)?.server?.io) {
    console.log("Socket is already running");
  } else {
    console.log("Socket is initializing");
    const io = new Server((res.socket as any)?.server);
    (res.socket as any).server.io = io;

    io.on("connection", (socket) => {
      console.log("Socket connected");

      if (!freeRoom) {
        console.log("Creating new room");
        freeRoom = new Room(io);
      }
      freeRoom.addPlayer(socket);
      if (freeRoom.state.isPlaying) {
        rooms.push(freeRoom);
        freeRoom = undefined;
      }
    });

    console.log("Socket initialized");
  }
  res.end();
};

export default SocketHandler;
