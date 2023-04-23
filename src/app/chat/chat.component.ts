import { Component } from '@angular/core';
import { WebsocketService } from "../_services/websocket.service";
import {User} from "../_models";
import {UserService} from "../_services";
import {Game, Player, Team} from '../_models/game';

@Component({
    selector: "chat",
    templateUrl: "./chat.component.html",
    providers: [WebsocketService]
})
export class ChatComponent {
    game: Game;
    title = 'socketrv';
    content = '';
    received = [];
    sent = [];
    me: User;

    constructor(private WebsocketService: WebsocketService, private userService: UserService) {
        WebsocketService.game_updates.subscribe((new_game_state: Game) => {
            new_game_state = this.updateGameWithIsMe(new_game_state)
            this.received.push(new_game_state);
            this.game = new_game_state;
            console.log("Response from websocket: " + new_game_state.toString());
            console.log(new_game_state.code)
            console.log(new_game_state)
        });
    }

    ngOnInit() {
        this.userService.getMe().subscribe(
            response => this.me = response
        );
    }

    updateGameWithIsMe(game: Game): Game {
        game.teams = game.teams.map((team: Team) => {
            team.players.map((player: Player) => {
                player.is_me = player.username === this.me.username
            });
            team.is_my_team = team.players.some((player: Player) => player.is_me);
            return team;
        });
        return game;
    }
}
