import {Component, OnInit} from '@angular/core';
import {Game, Player, Team} from '../_models/game';
import {GameService} from '../_services/game.service';
import {interval, Observable, Subscription} from 'rxjs';
import {UserService} from "../_services";
import { WebsocketService } from "../_services/websocket.service";
import {User} from "../_models";

@Component({
  templateUrl: 'game.component.html',
  selector: 'game',
  providers: [WebsocketService]
})
export class GameComponent implements OnInit {
    game: Game;
    me: User;
    intervalSource: Observable<number>;
    intervalSubscription: Subscription;
    game_updates_subscription: Subscription = null;

    constructor(private websocketService: WebsocketService, private userService: UserService,
                private gameService: GameService) {
    }

    ngOnInit() {
        this.getMeAndCheckIfInGameToMakeWSConnection();
        this.loadGame();
        this.intervalSource = interval(3000);
        this.intervalSubscription = this.intervalSource.subscribe(() => this.checkWebsocketConnection());
    }

    getMeAndCheckIfInGameToMakeWSConnection() {
        this.userService.getMe().subscribe(
            (response) => {
                this.me = response;
                if (this.me.in_game) {
                    this.refreshWebsocketConnection();
                }
            }
        );
    }
    ngOnDestroy() {
        this.intervalSubscription.unsubscribe();
        if (this.game_updates_subscription != null)
            this.game_updates_subscription.unsubscribe();
        this.websocketService.close()
    }

    newGame() {
        this.gameService.createGame().subscribe(
            response => this.game = response,
            error => console.log(error)
        );
    }

    timeLeftBeforeEndOfTurn() {
        if (this.game == null || this.game.state === 'LOB' || this.game.state === 'END' //|| !this.game.teams
            || this.game.teams.find(t => t.currently_playing) == null) {
            return 0;
        }
        return this.game.teams.find(t => t.currently_playing).players.find(p => p.currently_playing).time_left;
    }

    decreaseTimeLeftBeforeEndOfTurn(amount: number) {
        if (this.game == null || this.game.state === 'LOB' || this.game.state === 'END'
            || this.game.teams.find(t => t.currently_playing) == null) {
            return 0;
        }
        const currentTeamIdx = this.game.teams.findIndex(t => t.currently_playing);
        const currentPlayerIdx = this.game.teams[currentTeamIdx].players.findIndex(p => p.currently_playing);
        this.game.teams[currentTeamIdx].players[currentPlayerIdx].time_left -= amount;
        return this.game.teams[currentTeamIdx].players[currentPlayerIdx].time_left;
    }

    countDownFunction(timeWaited = 0) {
        const newTimeLeftBeforeEndOfTurn = this.decreaseTimeLeftBeforeEndOfTurn(timeWaited);
        if (newTimeLeftBeforeEndOfTurn <= 0) {
            return;
        }
        const waitTime = newTimeLeftBeforeEndOfTurn % 1000 === 0 ? 1000 : newTimeLeftBeforeEndOfTurn % 1000;
        setTimeout(() => this.countDownFunction(waitTime), waitTime);
    }

    loadGame() {
        if (this.timeLeftBeforeEndOfTurn() <= 0) {
            this.gameService.getGame().subscribe(
                response => {
                    console.log(response);
                    this.game = response;
                    if (this.timeLeftBeforeEndOfTurn() > 0) {
                        this.countDownFunction();
                    }
                },
                error => {
                    this.game = null;
                    console.log(error);
                }
            );
        }
    }

    submitJoinGameForm(form) {
        this.gameService.joinGame(form.value.code).subscribe(
            () => this.loadGame(),
            error => console.log(error)
        );
    }

    updateGameWithIsMe(game: Game): Game {
        if (!game || !game.teams)
            return game;
        game.teams = game.teams.map((team: Team) => {
            team.players.map((player: Player) => {
                player.is_me = player.username === this.me.username
            });
            team.is_my_team = team.players.some((player: Player) => player.is_me);
            return team;
        });
        return game;
    }

    isWebsocketOpen() {
        return this.websocketService.ws != null && this.websocketService.ws.readyState === this.websocketService.ws.OPEN;
    }

    checkWebsocketConnection() {
        /* This function checks if the websocket connection is still healthy and restart the connection if not */
        if (this.websocketService.ws)
            console.log(this.websocketService.ws.readyState);
        if (this.websocketService.ws == null || this.websocketService.ws.readyState === this.websocketService.ws.CLOSED) {
            if (this.game_updates_subscription)
                this.game_updates_subscription.unsubscribe();
            this.getMeAndCheckIfInGameToMakeWSConnection();
        }
    }

    subscribeToWebsocket() {
        this.game_updates_subscription = this.websocketService.game_updates.subscribe((new_game_state: Game) => {
            new_game_state = this.updateGameWithIsMe(new_game_state);
            this.game = new_game_state;
            if (this.timeLeftBeforeEndOfTurn() > 0) {
                this.countDownFunction();
            }
            console.log(new_game_state);
        });
    }

    refreshWebsocketConnection() {
        this.websocketService = new WebsocketService();
        this.websocketService.setupConnection();
        this.subscribeToWebsocket();
    }
}
