import {Component, OnDestroy, OnInit} from '@angular/core';
import {User} from '../_models';
import {AuthenticationService, UserService} from '../_services';
import {WordService} from '../_services/word.service';
import {OptionalWord} from '../_models/word';


@Component({ templateUrl: 'admin-screen.component.html' })
export class AdminScreenComponent implements OnInit, OnDestroy {
    me: User;
    optionalWord: OptionalWord;

    constructor(private authenticationService: AuthenticationService, private userService: UserService,
                private wordService: WordService) {
    }

    ngOnInit() {
        this.userService.getMe().subscribe(
            response => this.me = response
        );
        this.getNewOptionalWord();
    }

    getNewOptionalWord() {
        this.wordService.getOptionalWord().subscribe(
            response => this.optionalWord = response,
            error => console.log(error)
        );
    }

    skipWord() {
        this.wordService.skipOptionalWord().subscribe(
            (/*succes*/) => this.getNewOptionalWord(),
            error => console.log(error)
        );
    }

    addWord(difficulty: number) {
        const word = {
            word: this.optionalWord.word,
            added_by: this.me.username,
            difficulty,
            language: 'NL'
        };
        this.wordService.createNewWord(word).subscribe(
            (/*succes*/) => this.getNewOptionalWord(),
            error => console.log(error)
        );
    }

    submitRemoveWordForm(form) {
        this.wordService.removeWord(form.value.word).subscribe(
            () => null,
            error => console.log(error)
        );
    }


    ngOnDestroy() {
    }
}
