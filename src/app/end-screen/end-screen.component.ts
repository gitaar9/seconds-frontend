import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Game} from '../_models/game';
import {GameService} from '../_services/game.service';

@Component({
  templateUrl: 'end-screen.component.html',
  selector: 'end-screen'
})
export class EndScreenComponent implements OnInit {
    @Input() game: Game;
    @Output() update: EventEmitter<string> = new EventEmitter<string>();

    constructor(private gameService: GameService) {
    }

    ngOnInit() {
    }

    ngOnDestroy() {
    }

    leaveGame() {
        this.gameService.leaveGame().subscribe(
          () => this.update.emit('update')
        );
    }
}
