import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {User} from '../_models';
import {environment} from '../../environments/environment.prod';


@Injectable({ providedIn: 'root' })
export class UserService {
    constructor(private http: HttpClient) { }

    getMe() {
        return this.http.get<User>(`${environment.apiUrl}/user/me/`);
    }

    register(body) {
        return this.http.post<User>(`${environment.apiUrl}/user/`, body);
    }
  }
