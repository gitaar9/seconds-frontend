import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {ErrorInterceptor, JwtInterceptor} from './_helpers';

import {AppComponent} from './app.component';
import {routing} from './app.routing';

import {AlertComponent} from './_components';
import {HomeComponent} from './home';
import {LoginComponent} from './auth/login';
import {RegisterComponent} from './auth/register';
import {GameComponent} from './game/game.component';
import {LobbyTeamComponent} from './lobby/team/lobby-team.component';
import {LobbyComponent} from './lobby/lobby.component';
import {PlayScreenComponent} from './play-screen/play-screen.component';
import {AdminScreenComponent} from './admin-screen/admin-screen.component';
import {EndScreenComponent} from './end-screen/end-screen.component';
import {SpectateComponent} from './spectate/spectate.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RenderComponent} from "./render/render.component";

@NgModule({
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        HttpClientModule,
        routing,
        FormsModule,
        BrowserAnimationsModule
    ],
    declarations: [
        AppComponent,
        AlertComponent,
        HomeComponent,
        LoginComponent,
        RegisterComponent,
        GameComponent,
        LobbyTeamComponent,
        LobbyComponent,
        PlayScreenComponent,
        EndScreenComponent,
        AdminScreenComponent,
        SpectateComponent,
        RenderComponent
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
    ],
    bootstrap: [AppComponent]
})

export class AppModule { }
