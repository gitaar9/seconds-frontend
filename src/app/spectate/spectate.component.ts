import {Component, OnInit} from '@angular/core';
import {Game, Player} from '../_models/game';
import {GameService} from '../_services/game.service';
import {interval, Observable, Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {WebsocketService} from "../_services/websocket.service";


@Component({
  templateUrl: 'spectate.component.html',
  styleUrls: ['spectate.component.css'],
  selector: 'spectate',
  providers: [WebsocketService]
})
export class SpectateComponent implements OnInit {
    game: Game;
    intervalSource: Observable<number>;
    intervalSubscription: Subscription;
    game_updates_subscription: Subscription;
    gameCode: string;
    timeLeft: number = 0;

    constructor(private gameService: GameService, private route: ActivatedRoute,
                private websocketService: WebsocketService) {
    }

    ngOnInit() {
        this.gameCode = this.route.snapshot.paramMap.get('gameCode');
        this.loadGame();
        this.websocketService.setupConnection(this.gameCode)
        this.subscribeToWebsocket()
        this.intervalSource = interval(150);
        this.intervalSubscription = this.intervalSource.subscribe(
            () => {
                this.checkWebsocketConnection();
                if (this.game) {
                    let currentPlayer: Player = this.game.currentPlayer();
                    if (currentPlayer) {
                        this.timeLeft = currentPlayer.time_left();
                        // console.log(this.timeLeft);
                    }
                }
            }
        );
    }
    ngOnDestroy() {
        this.intervalSubscription.unsubscribe();
        this.game_updates_subscription.unsubscribe();
    }

    timeLeftBeforeEndOfTurn() {
        if (this.game == null || this.game.state === 'LOB' || this.game.state === 'END'
            || this.game.teams.find(t => t.currently_playing) == null) {
            return 0;
        }
        return this.game.currentPlayer().time_left();
    }

    loadGame() {
        if (this.timeLeftBeforeEndOfTurn() <= 0) {
            this.gameService.spectateGame(this.gameCode).subscribe(
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

    checkWebsocketConnection() {
        /* This function checks if the websocket connection is still healthy and restart the connection if not */
        console.log("Websocket readystate: ", this.websocketService.ws.readyState);
        if (this.websocketService.ws.readyState === this.websocketService.ws.CLOSED) {
            this.game_updates_subscription.unsubscribe();
            this.websocketService = new WebsocketService();
            this.websocketService.setupConnection(this.gameCode)
            this.subscribeToWebsocket()
        }
    }

    subscribeToWebsocket() {
        this.game_updates_subscription = this.websocketService.game_updates.subscribe((new_game_state: Game) => {
            console.log(new_game_state);
            this.game = new_game_state;
        });
    }

}
