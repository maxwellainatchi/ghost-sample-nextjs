export default interface State {
  word: string;
  isPlaying: boolean;
  turn: string;
}

export interface WinState extends State {
  winner: string;
}
