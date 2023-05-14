﻿import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
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
        this.intervalSource = interval(1000);
        this.intervalSubscription = this.intervalSource.subscribe(() => this.checkWebsocketConnection());
    }

    getMeAndCheckIfInGameToMakeWSConnection(): void {
        this.userService.getMe().subscribe(
            (response: User): void => {
                this.me = response;
                if (this.me.in_game) {
                    this.refreshWebsocketConnection();
                }
            },
            error => {
                console.log(error);
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
        return this.game.currentPlayer().time_left();
    }


    loadGame() {
        if (this.timeLeftBeforeEndOfTurn() <= 0) {
            this.gameService.getGame().subscribe(
                response => {
                    this.game = response;
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

    isWebsocketOpen() {
        return this.websocketService.ws != null && this.websocketService.ws.readyState === this.websocketService.ws.OPEN;
    }

    checkWebsocketConnection() {
        /* This function checks if the websocket connection is still healthy and restart the connection if not */
        if (this.websocketService.ws)
            console.log("Websocket readystate: ", this.websocketService.ws.readyState, this.game);
        if (this.websocketService.ws == null || this.websocketService.ws.readyState === this.websocketService.ws.CLOSED) {
            if (this.game_updates_subscription)
                this.game_updates_subscription.unsubscribe();
            this.getMeAndCheckIfInGameToMakeWSConnection();
        }
    }

    subscribeToWebsocket() {
        this.game_updates_subscription = this.websocketService.game_updates.subscribe((new_game_state: Game) => {
            new_game_state.updateWithIsMe(this.me);
            this.game = new_game_state;
            // console.log(this.game);
        });
    }

    refreshWebsocketConnection() {
        this.websocketService = new WebsocketService();
        this.websocketService.setupConnection();
        this.subscribeToWebsocket();
    }
}
