import { useEffect } from "react";
import RoomDisplay from "../components/RoomDisplay";
import useSocket from "../utils/useSocket";

const Home = () => {
  const socket = useSocket({ logging: true });

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <h1>GHOST</h1>
      {socket ? <RoomDisplay socket={socket} /> : <div>Connecting...</div>}
    </div>
  );
};

export default Home;
