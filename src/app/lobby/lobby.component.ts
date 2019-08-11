import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Game} from '../_models/game';
import {GameService} from '../_services/game.service';
import {TeamService} from '../_services/team.service';

@Component({
  templateUrl: 'lobby.component.html',
  selector: 'lobby'
})
export class LobbyComponent implements OnInit {
    selectedTeam: string = '';
    @Input() game: Game;
    @Output() update: EventEmitter<string> = new EventEmitter<string>();

    constructor(private gameService: GameService, private teamService: TeamService) {
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

    collectUpdates(event: string) {
        if (event === 'update') {
            this.update.emit(event);
        } else {
            this.selectedTeam = event;
        }
    }

    submitChangeNameForm(form) {
        this.teamService.changeName(+this.selectedTeam, form.value.teamName).subscribe(
            () => this.update.emit('update'),
            error => console.log(error)
        );
    }

    addTeam() {
        this.teamService.newTeam().subscribe(
            () => this.update.emit('update'),
            error => console.log(error)
        );
    }

    startGame() {
        this.gameService.startGame().subscribe(
            () => this.update.emit('update'),
            error => console.log(error)
        );
    }

}
