export class Card {
  words: string[];
}

export class Player {
    username: string;
    is_me: boolean;
    currently_playing: boolean;
    state: string;
    time_left: number;
    card: Card;
}

export class Team {
    players: Player[];
    name: string;
    id: number;
    score: number;
    currently_playing: boolean;
    is_my_team: boolean;
}

export class Game {
    code: string;
    teams: Team[];
    state: string;
}
