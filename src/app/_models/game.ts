import {User} from "./user";

export class Card {
  words: string[];

    static serialize(d: Object): Card {
        let o: Card = Object.assign(new Card(), d);
        return o;
    }

}

export class Player {
    username: string;
    is_me: boolean;
    currently_playing: boolean;
    state: string;
    start_of_turn: Date;
    card: Card;

    public time_left = () : number => {
        let start_of_turn = new Date(this.start_of_turn);
        var diff_in_seconds: number = (Date.now() - start_of_turn.getTime()) / 1000;
        return Math.round(Math.max(0, 30.5 - diff_in_seconds));
    }

    static serialize(d: Object): Player {
        let o: Player = Object.assign(new Player(), d);
        o.card = Card.serialize(o.card);
        return o;
    }
}

export class Team {
    players: Player[];
    name: string;
    id: number;
    score: number;
    currently_playing: boolean;
    is_my_team: boolean;
    pion_filename: string;

    static serialize(d: Object): Team {
        let o: Team = Object.assign(new Team(), d);
        o.players = o.players.map( (player: Player): Player => {return Player.serialize(player)})
        return o;
    }


}

export class Game {
    code: string;
    teams: Team[];
    state: string;
    language: string;

    public toString = () : string => {
        return `Game ${this.code} in state ${this.state}`;
    }

    static serialize(d: Object): Game {
        if (d) {
            let o: Game = Object.assign(new Game(), d);
            o.teams = o.teams.map( (team: Team): Team => {return Team.serialize(team)})
            return o;
        } else {
            return null;
        }
    }

    public currentPlayer(): Player {
        let currentTeam = this.teams.find((t: Team) => t.currently_playing);
        return (currentTeam) ? currentTeam.players.find((p: Player) => p.currently_playing): undefined;
    }

    public updateWithIsMe(me: User): void {
        if (!this || !this.teams)
            return;
        this.teams = this.teams.map((team: Team) => {
            team.players.map((player: Player) => {
                player.is_me = player.username === me.username
            });
            team.is_my_team = team.players.some((player: Player) => player.is_me);
            return team;
        });
    }
}
