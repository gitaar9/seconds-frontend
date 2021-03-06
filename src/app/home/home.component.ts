﻿import {Component, OnDestroy, OnInit} from '@angular/core';
import {User} from '../_models';
import {AuthenticationService, UserService} from '../_services';
import {GameService} from '../_services/game.service';


@Component({ templateUrl: 'home.component.html' })
export class HomeComponent implements OnInit, OnDestroy {
    me: User;
    currentlyInGame = false;
    constructor(private authenticationService: AuthenticationService, private userService: UserService,
                private gameService: GameService) {
    }

    ngOnInit() {
        this.userService.getMe().subscribe(
            response => this.me = response
        );
        this.gameService.getGame().subscribe(
            (/*succes*/) => this.currentlyInGame = true,
            (/*error*/) => this.currentlyInGame = false
        );
    }

    leaveGame() {
        this.gameService.leaveGame().subscribe(
          () => this.currentlyInGame = false
        );
    }

    ngOnDestroy() {
    }
}
