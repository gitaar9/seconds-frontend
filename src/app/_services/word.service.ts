import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {OptionalWord, Word} from '../_models/word';


@Injectable({ providedIn: 'root' })
export class WordService {
    constructor(private http: HttpClient) { }


    getOptionalWord() {
        return this.http.get<OptionalWord>(`${environment.apiUrl}/optional_word/get_one/`);
    }

    skipOptionalWord() {
        return this.http.delete<{}>(`${environment.apiUrl}/optional_word/skip_one/`);
    }

    createNewWord(word: Word) {
        return this.http.post<Word>(`${environment.apiUrl}/word/`, word);
    }

    removeWord(word: string) {
        return this.http.post<{}>(`${environment.apiUrl}/word/delete_by_string/`, {word});
    }
}
