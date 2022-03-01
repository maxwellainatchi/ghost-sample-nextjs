export default interface State {
  word: string;
  isPlaying: boolean;
  turn: string;
}

export interface LossState extends State {
  loser: string;
}
