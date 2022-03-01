export interface GameState<T extends RoundState = RoundState> {
  id: string;
  currentRoundState: T | undefined;
  letters: {
    [key: string]: string;
  };
  isPlaying: boolean;
}

export interface GameStateAfterLoss extends GameState<RoundLossState> {
  currentRoundState: undefined;
  lastRoundState: RoundLossState;
}

export interface RoundState {
  isPlaying: boolean;
  word: string;
  turn: string;
}

export interface RoundLossState extends RoundState {
  loser: string;
}
