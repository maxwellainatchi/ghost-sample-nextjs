import { NextApiHandler } from "next";
import { Server } from "Socket.IO";
import Room from "../../utils/Room";

const SocketHandler: NextApiHandler = (req, res) => {
  if ((res.socket as any)?.server?.io) {
    console.log("Socket is already running");
  } else {
    console.log("Socket is initializing");
    const io = new Server((res.socket as any)?.server);
    (res.socket as any).server.io = io;

    Room.initialize(io);

    io.on("connection", (socket) => {
      console.log("Socket connected");
      const room = Room.findOrCreate(io);
      room.addPlayer(socket);
    });

    console.log("Socket initialized");
  }
  res.end();
};

export default SocketHandler;
