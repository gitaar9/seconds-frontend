import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, HostBinding} from '@angular/core';
import {Game} from '../_models/game';
import {GameService} from '../_services/game.service';
import {interval, Observable, Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {trigger, state, style, animate, transition} from '@angular/animations';
import {Locations} from './locations';
import {WebsocketService} from "../_services/websocket.service";


@Component({
  templateUrl: 'spectate.component.html',
  styleUrls: ['spectate.component.css'],
  selector: 'spectate',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('team0location', Locations.team0location),
    trigger('team1location', Locations.team1location),
    trigger('team2location', Locations.team2location),
    trigger('team3location', Locations.team3location),
  ],
  providers: [WebsocketService]
})
export class SpectateComponent implements OnInit {
    game: Game;
    intervalSource: Observable<number>;
    intervalSubscription: Subscription;
    game_updates_subscription: Subscription;
    gameCode: string;

    constructor(private gameService: GameService, private route: ActivatedRoute, private cdr: ChangeDetectorRef,
                private websocketService: WebsocketService) {
    }

    ngOnInit() {
        this.gameCode = this.route.snapshot.paramMap.get('gameCode');
        this.loadGame();
        this.websocketService.setupConnection(this.gameCode)
        this.subscribeToWebsocket()
        this.intervalSource = interval(1000);
        this.intervalSubscription = this.intervalSource.subscribe(() => this.checkWebsocketConnection());
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
        return this.game.teams.find(t => t.currently_playing).players.find(p => p.currently_playing).time_left;
    }

    decreaseTimeLeftBeforeEndOfTurn(amount: number) {
        const currentTeamIdx = this.game.teams.findIndex(t => t.currently_playing);
        const currentPlayerIdx = this.game.teams[currentTeamIdx].players.findIndex(p => p.currently_playing);
        this.game.teams[currentTeamIdx].players[currentPlayerIdx].time_left -= amount;
        return this.game.teams[currentTeamIdx].players[currentPlayerIdx].time_left;
    }

    countDownFunction(timeWaited = 0) {
        const newTimeLeftBeforeEndOfTurn = this.decreaseTimeLeftBeforeEndOfTurn(timeWaited);
        if (newTimeLeftBeforeEndOfTurn <= 0) {
            return this.loadGame();
        }
        const waitTime = newTimeLeftBeforeEndOfTurn % 1000 === 0 ? 1000 : newTimeLeftBeforeEndOfTurn % 1000;
        setTimeout(() => this.countDownFunction(waitTime), waitTime);
        this.cdr.detectChanges();
    }

    loadGame() {
        if (this.timeLeftBeforeEndOfTurn() <= 0) {
            this.gameService.spectateGame(this.gameCode).subscribe(
                response => {
                    console.log(response);
                    this.game = response;
                    if (this.timeLeftBeforeEndOfTurn() > 0) {
                        this.countDownFunction();
                    }
                    this.cdr.detectChanges();
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
        console.log(this.websocketService.ws.readyState);
        if (this.websocketService.ws.readyState === this.websocketService.ws.CLOSED) {
            this.game_updates_subscription.unsubscribe();
            this.websocketService = new WebsocketService();
            this.websocketService.setupConnection(this.gameCode)
            this.subscribeToWebsocket()
        }
    }

    subscribeToWebsocket() {
        this.game_updates_subscription = this.websocketService.game_updates.subscribe((new_game_state: Game) => {
            this.game = new_game_state;
            if (this.timeLeftBeforeEndOfTurn() > 0) {
                this.countDownFunction();
            }
            this.cdr.detectChanges();
            console.log(new_game_state);
        });
    }

}
