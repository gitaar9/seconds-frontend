import {Component, OnInit} from '@angular/core';
import {Game} from '../_models/game';
import {GameService} from '../_services/game.service';
import {interval, Observable, Subscription} from 'rxjs';

@Component({
  templateUrl: 'game.component.html',
  selector: 'game'
})
export class GameComponent implements OnInit {
    game: Game;
    intervalSource: Observable<number>;
    intervalSubscription: Subscription;

    constructor(private gameService: GameService) {
    }

    ngOnInit() {
        this.loadGame();
        this.intervalSource = interval(3000);
        this.intervalSubscription = this.intervalSource.subscribe(() => this.loadGame());
    }

    ngOnDestroy() {
        this.intervalSubscription.unsubscribe();
    }

    newGame() {
        this.gameService.createGame().subscribe(
            response => this.game = response,
            error => console.log(error)
        );
    }

    collectUpdates(event: string) {
        if (event === 'update') {
            this.loadGame();
        }
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
}
