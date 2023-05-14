import {Component, Input, OnInit} from '@angular/core';
import {Game} from '../_models/game';
import {GameService} from '../_services/game.service';
import {TeamService} from '../_services/team.service';
import {Router} from '@angular/router';

@Component({
  templateUrl: 'lobby.component.html',
  styleUrls: ['lobby.component.css'],
  selector: 'lobby'
})
export class LobbyComponent implements OnInit {
    selectedTeam: string = '';
    @Input() game: Game;

    constructor(private gameService: GameService, private teamService: TeamService, private router: Router) {
    }

    ngOnInit() {
    }

    ngOnDestroy() {
    }

    leaveGame() {
        this.gameService.leaveGame().subscribe(
          () => this.router.navigate([''])
        );
    }

    collectUpdates(event: string) {
        this.selectedTeam = event;
    }

    submitChangeNameForm(form) {
        this.teamService.changeName(+this.selectedTeam, form.value.teamName).subscribe(
            () => null,
            error => console.log(error)
        );
    }

    addTeam() {
        this.teamService.newTeam().subscribe(
            () => null,
            error => console.log(error)
        );
    }

    startGame() {
        this.gameService.startGame().subscribe(
            () => null,
            error => console.log(error)
        );
    }

    changeLanguageSwitch(event) {
        this.gameService.changeLanguage((event.target.checked) ? 'UK' : 'NL').subscribe(
            () => null,
            error => console.log(error)
        );
    }

    changeDifficultyButton(difficulty: string) {
        this.gameService.changeDifficulty(difficulty).subscribe(
            () => null,
            error => console.log(error)
        )
    }
}
