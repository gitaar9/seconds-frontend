import {Component, Input, OnInit} from '@angular/core';
import {Game} from '../_models/game';
import {GameService} from '../_services/game.service';
import {Router} from '@angular/router';

@Component({
  templateUrl: 'end-screen.component.html',
  selector: 'end-screen'
})
export class EndScreenComponent implements OnInit {
    @Input() game: Game;

    constructor(private gameService: GameService, private router: Router) {
    }

    ngOnInit() {
        console.log('endscreen:', this.game);
    }

    ngOnDestroy() {
    }

    leaveGame() {
        this.gameService.leaveGame().subscribe(
            () => this.router.navigate([''])
        );
    }
}
