import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Game, Player} from '../_models/game';
import {map} from 'rxjs/operators';


@Injectable({ providedIn: 'root' })
export class GameService {
    constructor(private http: HttpClient) { }

    static addIsMyTeam(game) {
        if (!game || !game.teams)
            return null;
        game.teams = game.teams.map((team) => {
            team.is_my_team = team.players.some((player) => player.is_me);
            return team;
        });
        return game;
    }

    createGame() {
        return this.http.post<Game>(`${environment.apiUrl}/game/`, {}).pipe(map(GameService.addIsMyTeam)).pipe(map(Game.serialize));
    }

    getGame() {
        return this.http.get<Game>(`${environment.apiUrl}/game/`).pipe(map(GameService.addIsMyTeam)).pipe(map(Game.serialize));
    }

    spectateGame(gameCode: string, sortByPk = true) {
        return this.http.get<Game>(`${environment.apiUrl}/game/${gameCode}/spectate/`).pipe(map(game => {
            if (sortByPk) {
                game.teams.sort((left, right) => left.id - right.id);
            }
            return Game.serialize(game);
        }));
    }

    leaveGame() {
        return this.http.delete<{}>(`${environment.apiUrl}/game/leave_game/`);
    }

    joinGame(code: string) {
        return this.http.post<Game>(`${environment.apiUrl}/game/join_game/`, {code}).pipe(map(GameService.addIsMyTeam)).pipe(map(Game.serialize));
    }

    startGame() {
        return this.http.get<{}>(`${environment.apiUrl}/game/start/`);
    }

    startReadingCard() {
        return this.http.get<{}>(`${environment.apiUrl}/game/start_reading_card/`);
    }

    completeTurn(score) {
        return this.http.post<{}>(`${environment.apiUrl}/game/complete_turn/`, {score});
    }

    changeLanguage(language: string) {
        return this.http.patch<Game>(`${environment.apiUrl}/game/update_game/`, {"language": language});
    }

    changeDifficulty(difficulty: string) {
        return this.http.patch<Game>(`${environment.apiUrl}/game/update_game/`, {"difficulty": difficulty});
    }

}
