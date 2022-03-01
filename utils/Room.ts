import { randomUUID } from "crypto";
import { Socket, Server } from "socket.io";
import State, { WinState } from "./Types/State";

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
      (room) => room.players.length < Room.limit
    );
    if (existingRoom) {
      return existingRoom;
    }
    console.log("Creating new room");
    let room = new Room(io);
    this.rooms[room.roomName] = room;
    return room;
  }

  public state: State;
  public roomName = randomUUID();

  private players: string[] = [];

  private get room() {
    return this.io.to(this.roomName);
  }

  constructor(private io: Server) {
    this.state = {
      word: "",
      isPlaying: false,
      turn: "",
    };
  }

  public addPlayer(player: Socket) {
    if (this.players.length >= Room.limit) {
      console.log("Room is full");
      return;
    }

    player.join(this.roomName);
    this.players.push(player.id);
    this.registerEvents(player);
    this.room.emit("player.joined", {
      player: player.id,
      state: this.state,
    });

    if (this.players.length === Room.limit && !this.state.isPlaying) {
      this.begin();
    }
  }

  public begin() {
    this.state.isPlaying = true;
    this.state.turn = this.players[0];
    this.room.emit("game.begin", this.state);
  }

  public close() {
    this.room.disconnectSockets();
    delete Room.rooms[this.roomName];
  }

  public registerEvents(socket: Socket) {
    socket.on("letter.sent", ({ letter }) => {
      console.log(`Received ${letter} from ${socket.id}`);
      if (this.state.turn !== socket.id) {
        return;
      }
      this.state.word += letter;

      if (this.checkWin()) {
        let winState: WinState = {
          ...this.state,
          winner: this.state.turn,
        };
        this.room.emit("game.end", winState);
        this.close();
        return;
      }

      this.state.turn =
        this.players[
          (this.players.indexOf(socket.id) + 1) % this.players.length
        ];
      this.room.emit("letter.received", {
        letter,
        state: this.state,
      });
    });
  }

  private handlePlayerLeaving(playerId: string) {
    this.players.indexOf(playerId) !== -1 &&
      this.players.splice(this.players.indexOf(playerId), 1);

    console.log("Player left");
    this.room.emit("player.left", {
      player: playerId,
      state: this.state,
    });

    this.close();
  }

  private checkWin(): boolean {
    return this.state.word.length === 3;
  }
}
