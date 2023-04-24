import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Team} from 'src/app/_models/game';
import {TeamService} from 'src/app/_services/team.service';
import * as $ from 'jquery';

declare var M;
@Component({
  templateUrl: 'lobby-team.component.html',
  selector: 'lobby-team'
})
export class LobbyTeamComponent implements OnInit {
    @Input() team: Team;
    @Output() update: EventEmitter<string> = new EventEmitter<string>();

    constructor(private teamService: TeamService) {
        $(document).ready(function() {
            const elems = document.querySelectorAll('.modal');
            const openElems = document.querySelectorAll('.modal.open');
            if (openElems.length === 0) {
                const instances = M.Modal.init(elems, {});
            }
        });
    }

    ngOnInit() {
    }

    ngOnDestroy() {
    }

    deleteTeam() {
        this.teamService.deleteTeam(this.team.id).subscribe(
            response => null,
            error => console.log(error)
        );
    }

    changeTeamName() {
        this.update.emit('' + this.team.id);
    }

    isMyTeam() {
        return this.team.players.some(p => p.is_me);
    }

    joinTeam() {
        this.teamService.joinTeam(this.team.id).subscribe(
            response => null,
            error => console.log(error)
        );
    }
}
