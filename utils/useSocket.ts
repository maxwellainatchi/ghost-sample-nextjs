import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const socketInitializer = async (): Promise<Socket> => {
  await fetch("/api/socket");
  let socket = io();

  socket.on("connect", () => {
    console.log("connected");
  });
  return socket;
};

const useSocket = ({ logging }: { logging?: boolean } = {}):
  | Socket
  | undefined => {
  let [socket, setSocket] = useState<Socket | undefined>();

  useEffect(() => {
    socketInitializer().then(setSocket);
  }, []);

  useEffect(() => {
    if (socket && logging) {
      socket.onAny(console.log);
    }
    return () => {
      socket?.offAny(console.log);
    };
  }, [socket]);

  return socket;
};
export default useSocket;
