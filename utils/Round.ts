import fs from "fs";
import { Socket } from "socket.io";
import Game from "./Game";
import { ServerSentEventNames } from "./Types/SocketEvents";
import { RoundState } from "./Types/State";

export default class Round {
  public static wordlist: string[] = [];

  /** Handle global events for all rooms */
  public static initialize() {
    this.wordlist = fs.readFileSync("./utils/wordlist.txt", "utf8").split("\n");
  }

  public state: RoundState;

  public get room() {
    return this.game.room.room;
  }

  public get players() {
    return this.game.room.players;
  }

  constructor(private game: Game) {
    this.state = {
      isPlaying: true,
      word: "",
      turn: "",
    };
  }

  public begin() {
    this.state.isPlaying = true;
    this.state.turn = this.players[0];
    this.room.emit(ServerSentEventNames.round.begin, this.game.state);
  }

  public handleLetter(letter: string, socket: Socket) {
    console.log(`Received ${letter} from ${socket.id}`);
    if (this.state.turn !== socket.id || letter.length !== 1) {
      return;
    }
    this.state.word += letter;

    if (this.checkLoss()) {
      this.game.endRound(socket.id);
      return;
    }

    this.state.turn =
      this.players[(this.players.indexOf(socket.id) + 1) % this.players.length];
    this.room.emit(ServerSentEventNames.letter.received, {
      letter,
      state: this.game.state,
    });
  }

  private checkLoss(): boolean {
    return (
      this.state.word.length >= 3 &&
      Round.wordlist.includes(this.state.word.toLowerCase())
    );
  }
}
