import { randomUUID } from "crypto";
import { Socket, Server } from "socket.io";
import Game from "./Game";
import Round from "./Round";
import {
  ClientSentEventNames,
  ServerSentEventNames,
} from "./Types/SocketEvents";

export default class Room {
  public static rooms: { [roomName: string]: Room } = {};
  public static min: number = 2;
  public static max: number = 5;

  /** Handle global events for all rooms */
  public static initialize(io: Server) {
    io.of("/").adapter.on(
      "leave-room",
      (roomName: string, socketId: string) => {
        if (roomName in this.rooms) {
          this.rooms[roomName].handlePlayerLeaving(socketId);
        }
      }
    );

    Round.initialize();
  }

  public static findOrCreate(io: Server): Room {
    let existingRoom = Object.values(this.rooms).find(
      (room) => room.players.length < Room.max && !room.game.state.isPlaying
    );
    if (existingRoom) {
      return existingRoom;
    }
    console.log("Creating new room");
    let room = new Room(io);
    this.rooms[room.roomName] = room;
    return room;
  }

  public game: Game;
  public roomName = randomUUID();
  public players: string[] = [];

  public get room() {
    return this.io.to(this.roomName);
  }

  constructor(private io: Server) {
    this.game = new Game(this);
  }

  public addPlayer(player: Socket) {
    if (this.players.length >= Room.max || this.game.state.isPlaying) {
      console.log("Room is full");
      return;
    }

    player.join(this.roomName);
    this.players.push(player.id);
    this.game.state.players = this.players;
    this.registerEvents(player);
    this.room.emit(ServerSentEventNames.player.joined, {
      player: player.id,
      state: this.game.state,
      canBegin: this.players.length >= Room.min && !this.game.state.isPlaying,
    });

    if (this.players.length === Room.max && !this.game.state.isPlaying) {
      this.game.begin();
    }
  }

  public close() {
    this.room.disconnectSockets();
    delete Room.rooms[this.roomName];
  }

  public registerEvents(socket: Socket) {
    socket.on(ClientSentEventNames.letter.sent, ({ letter }) => {
      this.game.currentRound?.handleLetter(letter, socket);
    });
    socket.on(ClientSentEventNames.round.next, () => {
      this.game.beginRound();
    });
    socket.on(ClientSentEventNames.game.begin, () => {
      if (this.players.length >= Room.min && !this.game.state.isPlaying) {
        this.game.begin();
      }
    });
  }

  private handlePlayerLeaving(playerId: string) {
    this.players.indexOf(playerId) !== -1 &&
      this.players.splice(this.players.indexOf(playerId), 1);

    console.log("Player left");
    this.room.emit(ServerSentEventNames.player.left, {
      player: playerId,
      state: this.game.state,
    });

    this.close();
  }
}
