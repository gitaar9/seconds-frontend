import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Game} from '../_models/game';
import {GameService} from '../_services/game.service';

@Component({
  templateUrl: 'play-screen.component.html',
  selector: 'play-screen'
})
export class PlayScreenComponent implements OnInit {
    @Input() game: Game;
    @Output() update: EventEmitter<string> = new EventEmitter<string>();

    constructor(private gameService: GameService) {
    }

    ngOnInit() {
    }

    ngOnDestroy() {
    }

    myTeam() {
        return this.game.teams.find(team => team.is_my_team);
    }

    me() {
        return this.myTeam().players.find(player => player.is_me);
    }

    currentlyPlaying() {
        return this.game.teams.find(t => t.currently_playing).players.find(p => p.currently_playing);
    }

    startReadingCard() {
        this.gameService.startReadingCard().subscribe(
            () => this.update.emit('update'),
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
            () => this.update.emit('update'),
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
        } else if (me.state === 'REA' && this.me().time_left > 0) {
            return 'READING_CARD';
        } else if (me.state === 'REA' && this.me().time_left <= 0) {
            return 'FILLING_IN_SCORE';
        }
        return 'NOT_MY_TURN';
    }
}
