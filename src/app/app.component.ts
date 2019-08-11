import {Component} from '@angular/core';
import {Router} from '@angular/router';

import {AuthenticationService} from './_services';
import {Token} from './_models/token';

@Component({ selector: 'app', templateUrl: 'app.component.html' })
export class AppComponent {
    currentToken: Token;

    constructor(
        private router: Router,
        private authenticationService: AuthenticationService
    ) {
        this.authenticationService.currentToken.subscribe(x => this.currentToken = x);
    }

    logout() {
        this.authenticationService.logout();
    }
}
