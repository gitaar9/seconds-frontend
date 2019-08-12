import {RouterModule, Routes} from '@angular/router';

import {HomeComponent} from './home';
import {LoginComponent} from './auth/login';
import {RegisterComponent} from './auth/register';
import {AuthGuard} from './_guards';
import {GameComponent} from './game/game.component';
import {AdminScreenComponent} from './admin-screen/admin-screen.component';

const appRoutes: Routes = [
    {path: '', component: HomeComponent, canActivate: [AuthGuard]},
    {path: 'login', component: LoginComponent },
    {path: 'register', component: RegisterComponent},
    {path: 'game', component: GameComponent, canActivate: [AuthGuard]},
    {path: 'admin-screen', component: AdminScreenComponent, canActivate: [AuthGuard]},

    // otherwise redirect to home
    {path: '**', redirectTo: ''}
];

export const routing = RouterModule.forRoot(appRoutes);
