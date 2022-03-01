import Room from "./Room";
import Round from "./Round";
import { ServerSentEventNames } from "./Types/SocketEvents";
import { GameState, GameStateAfterLoss, RoundLossState } from "./Types/State";

export default class Game {
  public static lossWord = "GHOST";

  public state: GameState;
  public currentRound: Round | undefined;

  constructor(public room: Room) {
    this.currentRound = undefined;
    this.state = {
      id: "",
      isPlaying: false,
      currentRoundState: undefined,
      letters: {},
      players: [],
    };
  }

  public begin() {
    (this.state.letters = Object.fromEntries(
      this.room.players.map((player) => [player, ""])
    )),
      (this.state.isPlaying = true);
    this.beginRound();
    this.room.room.emit(ServerSentEventNames.game.begin, {
      state: this.state,
    });
  }

  public beginRound() {
    this.currentRound = new Round(this);
    this.state.currentRoundState = this.currentRound.state;
    this.currentRound.begin();
  }

  public endRound(loser: string) {
    this.currentRound!.state.isPlaying = false;
    console.log("loser", loser, this.state.letters);
    this.state.letters[loser] +=
      Game.lossWord[this.state.letters[loser].length];

    let lossState: GameStateAfterLoss = {
      ...this.state,
      currentRoundState: undefined,
      lastRoundState: {
        ...this.currentRound!.state,
        loser,
      },
    };

    this.room.room.emit(ServerSentEventNames.round.end, lossState);
    if (this.checkLoss(loser)) {
      this.room.room.emit(ServerSentEventNames.game.end, lossState);
      this.room.close();
    }
  }

  private handlePlayerLeaving(playerId: string) {
    // TODO: Handle player leaving
  }

  private checkLoss(player: string): boolean {
    return this.state.letters[player] === Game.lossWord;
  }
}
