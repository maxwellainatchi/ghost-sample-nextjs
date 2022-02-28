import { randomUUID } from "crypto";
import { BroadcastOperator, Socket, Server } from "socket.io";
import { io } from "socket.io-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { LetterHandler } from "./Types/SocketEvents";
import State from "./Types/State";

export default class Room {
  public static limit: number = 2;

  public numberOfPlayers = 0;
  public state: State;

  private roomName = randomUUID();

  constructor(private io: Server) {
    this.state = {
      word: "",
      isPlaying: false,
    };
  }

  public addPlayer(player: Socket) {
    if (this.numberOfPlayers >= Room.limit) {
      console.log("Room is full");
      return;
    }

    player.join(this.roomName);
    this.registerEvents(player);

    this.numberOfPlayers++;
    if (this.numberOfPlayers === Room.limit) {
      this.begin();
    }
  }

  public begin() {
    console.log("Starting game " + this.roomName);
    this.state.isPlaying = true;
  }

  public registerEvents(socket: Socket) {
    socket.on("letter", ((letter, ack) => {
      console.log("Letter received: ", letter);
      this.state.word += letter;
      ack({
        success: true,
        state: this.state,
      });
    }) as LetterHandler);
  }
}
