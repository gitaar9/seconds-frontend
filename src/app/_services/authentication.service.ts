import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {environment} from '../../environments/environment.prod';
import {Router} from '@angular/router';
import {Token} from '../_models/token';


@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentTokenSubject: BehaviorSubject<Token>;
    public currentToken: Observable<Token>;

    constructor(private http: HttpClient, private router: Router) {
        this.currentTokenSubject = new BehaviorSubject<Token>(JSON.parse(localStorage.getItem('currentToken')));
        this.currentToken = this.currentTokenSubject.asObservable();
    }

    public get currentTokenValue(): Token {
        return this.currentTokenSubject.value;
    }

    login(username: string, password: string) {
        const body: {} = {
            grant_type: 'password',
            username,
            password,
            client_id: 1,
            client_secret: 2
        };
        return this.http.post<any>(`${environment.apiUrl}/oauth2/token/`, body)
            .pipe(map(response => {
                // login successful if there's a jwt token in the response
                // console.log(JSON.stringify(response));
                if (response && response.access_token) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentToken', JSON.stringify(response));
                    this.currentTokenSubject.next(response);
                }
                return response;
            }));
    }

    logout() {
        const body: {} = {
            token: this.currentTokenValue.access_token,
            client_id: 1,
            client_secret: 2
        };
        this.http.post<any>(`${environment.apiUrl}/oauth2/revoke_token/`, body).subscribe(succes => {
            localStorage.removeItem('currentToken');
            this.currentTokenSubject.next(null);
            this.router.navigate(['/login']);
        });
    }
}
