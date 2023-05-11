import {Component, Input, OnInit} from '@angular/core';
import {Game, Player, Team} from '../_models/game';
import {GameService} from '../_services/game.service';
import {interval, Observable, Subscription} from 'rxjs';

@Component({
  templateUrl: 'play-screen.component.html',
  selector: 'play-screen'
})
export class PlayScreenComponent implements OnInit {
    @Input() game: Game;
    intervalSource: Observable<number>;
    intervalSubscription: Subscription;
    my_time_left: number = 0;
    other_time_left: number = 0;

    constructor(private gameService: GameService) {
    }

    ngOnInit() {
        this.intervalSource = interval(100);
        this.intervalSubscription = this.intervalSource.subscribe(() => this.update_time_lefts());
    }

    update_time_lefts() {
        this.my_time_left = this.me().time_left();
        this.other_time_left = this.game.currentPlayer().time_left();
        // console.log(this.game);
    }

    ngOnDestroy() {
        this.intervalSubscription.unsubscribe();
    }

    myTeam() {
        return this.game.teams.find((team: Team) => team.is_my_team);
    }

    me() {
        return this.myTeam().players.find((player: Player) => player.is_me);
    }

    currentlyPlaying() {
        return this.game.currentPlayer();
    }

    startReadingCard() {
        this.gameService.startReadingCard().subscribe(
            () => null,
            error => console.log(error)
        );
    }

    submitWordForm(form) {
        let answeredCorrect = 0;
        for (const key in form.value) {
            if (form.value[key] === true) {
                answeredCorrect++;
            }
        }
        this.gameService.completeTurn(answeredCorrect).subscribe(
            () => null,
            error => console.log(error)
        );
    }

    turnState() {
        const me = this.me();
        const myTeam = this.myTeam();
        if (!(me.currently_playing && myTeam.currently_playing)) {
            return 'NOT_MY_TURN';
        } else if (me.state === 'PRE') {
            return 'BEFORE_READING_CARD';
        } else if (me.state === 'REA' && this.me().time_left() > 0) {
            return 'READING_CARD';
        } else if (me.state === 'REA' && this.me().time_left() <= 0) {
            return 'FILLING_IN_SCORE';
        }
        return 'NOT_MY_TURN';
    }
}
