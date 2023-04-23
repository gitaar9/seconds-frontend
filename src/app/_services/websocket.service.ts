import { Injectable } from "@angular/core";
import { Observable, Observer } from 'rxjs';
import { AnonymousSubject } from 'rxjs/internal/Subject';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import {environment} from '../../environments/environment';
import {Game} from '../_models/game';


@Injectable()
export class WebsocketService {
    private subject: AnonymousSubject<MessageEvent>;
    public game_updates: Subject<Game>;
    public ws: WebSocket;

    constructor() {
        const token = JSON.parse(localStorage.getItem('currentToken'));
        const CHAT_URL = `ws://${environment.apiIp}/ws/chat/lobby/?token=${token.access_token}`;
        this.game_updates = <Subject<Game>>this.connect(CHAT_URL).pipe(
            map(
                (response: MessageEvent): Game => {
                    console.log(response.data);
                    let data = JSON.parse(response.data)
                    return data.game;
                }
            )
        );
    }

    public connect(url): AnonymousSubject<MessageEvent> {
        if (!this.subject) {
            this.subject = this.create(url);
            console.log("Successfully connected: " + url);
        }
        return this.subject;
    }

    private create(url): AnonymousSubject<MessageEvent> {
        this.ws = new WebSocket(url);
        let observable = new Observable((obs: Observer<MessageEvent>) => {
            this.ws.onmessage = obs.next.bind(obs);
            this.ws.onerror = obs.error.bind(obs);
            this.ws.onclose = obs.complete.bind(obs);
            return this.ws.close.bind(this.ws);
        });
        let observer = {
            error: null,
            complete: () => {
                console.log('Disconnected from the websocket')
            },
            next: (data: Object) => { /*This is never used, but I leave it here for reference.*/
                console.log('Message sent to websocket: ', data);
                if (this.ws.readyState === WebSocket.OPEN) {
                    this.ws.send(JSON.stringify(data));
                }
            }
        };
        return new AnonymousSubject<MessageEvent>(observer, observable);
    }
}
