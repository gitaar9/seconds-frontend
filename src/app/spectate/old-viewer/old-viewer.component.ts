import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, HostBinding} from '@angular/core';
import {Game} from '../../_models/game';
import {GameService} from '../../_services/game.service';
import {interval, Observable, Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {trigger, state, style, animate, transition} from '@angular/animations';
import {Locations} from '../locations';
import {WebsocketService} from "../../_services/websocket.service";
import * as $ from 'jquery';

declare var M;


@Component({
  templateUrl: 'old-viewer.component.html',
  selector: 'old-viewer',
  styleUrls: ['old-viewer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('team0location', Locations.team0location),
    trigger('team1location', Locations.team1location),
    trigger('team2location', Locations.team2location),
    trigger('team3location', Locations.team3location),
  ],
})
export class OldViewerComponent implements OnInit {
    @Input() game: Game;
    @Input() timeLeft: number;

    constructor(private cdr: ChangeDetectorRef) {
    }

    ngOnInit() {
    }

    ngOnDestroy() {
    }

}
