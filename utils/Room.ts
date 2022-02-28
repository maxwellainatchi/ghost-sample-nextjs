import { randomUUID } from "crypto";
import { Socket, Server } from "socket.io";
import State from "./Types/State";

export default class Room {
  public static rooms: { [roomName: string]: Room } = {};
  public static limit: number = 2;

  /** Handle global socket events for individual rooms */
  public static initialize(io: Server) {
    io.of("/").adapter.on(
      "leave-room",
      (roomName: string, socketId: string) => {
        if (roomName in this.rooms) {
          this.rooms[roomName].handlePlayerLeaving(socketId);
        }
      }
    );
  }

  public static findOrCreate(io: Server): Room {
    let existingRoom = Object.values(this.rooms).find(
      (room) => room.numberOfPlayers < Room.limit
    );
    if (existingRoom) {
      return existingRoom;
    }
    console.log("Creating new room");
    let room = new Room(io);
    this.rooms[room.roomName] = room;
    return room;
  }

  public numberOfPlayers = 0;
  public state: State;
  public roomName = randomUUID();

  private get room() {
    return this.io.to(this.roomName);
  }

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
    this.room.emit("player.joined", {
      player: player.id,
      state: this.state,
    });

    this.numberOfPlayers++;
    if (this.numberOfPlayers === Room.limit && !this.state.isPlaying) {
      this.begin();
    }
  }

  public begin() {
    this.state.isPlaying = true;
    this.room.emit("game.begin", this.state);
  }

  public close() {
    this.room.disconnectSockets();
  }

  public registerEvents(socket: Socket) {
    socket.on("letter", (letter, ack) => {
      console.log("Letter received: ", letter);
      this.state.word += letter;
      this.room.emit("letter.received", {
        letter,
        state: this.state,
      });
    });
  }

  private handlePlayerLeaving(playerId: string) {
    console.log("Player left");
    this.numberOfPlayers--;
    this.room.emit("player.left", {
      player: playerId,
      state: this.state,
    });

    if (this.numberOfPlayers === 0) {
      this.close();
    }
  }
}
