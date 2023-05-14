import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Team} from '../_models/game';


@Injectable({ providedIn: 'root' })
export class TeamService {
    constructor(private http: HttpClient) { }

    deleteTeam(id: number) {
        return this.http.delete<Team>(`${environment.apiUrl}/team/${id}/`);
    }

    changeName(id: number, name: string) {
        return this.http.patch<Team>(`${environment.apiUrl}/team/${id}/`, {"name": name});
    }

    changePionFilename(id: number, pionFilename: string) {
        return this.http.patch<Team>(`${environment.apiUrl}/team/${id}/`, {"pion_filename": pionFilename});
    }

    joinTeam(id: number) {
        return this.http.get<Team>(`${environment.apiUrl}/team/${id}/join/`);
    }

    newTeam() {
        return this.http.post<Team>(`${environment.apiUrl}/team/`, {});
    }
  }
