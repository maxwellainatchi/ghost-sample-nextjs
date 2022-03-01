export const ServerSentEventNames = {
  room: {
    connected: "room.connected",
  },
  player: {
    joined: "player.joined",
    left: "player.left",
  },
  game: {
    begin: "game.begin",
    end: "game.end",
  },
  round: {
    begin: "round.begin",
    end: "round.end",
  },
  letter: {
    received: "letter.received",
  },
};

export const ClientSentEventNames = {
  letter: {
    sent: "letter.sent",
  },
  round: {
    next: "round.next",
  },
};
