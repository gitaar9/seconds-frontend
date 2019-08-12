import {Component, OnDestroy, OnInit} from '@angular/core';
import {User} from '../_models';
import {AuthenticationService, UserService} from '../_services';
import {WordService} from '../_services/word.service';
import {OptionalWord} from '../_models/word';


@Component({ templateUrl: 'admin-screen.component.html' })
export class AdminScreenComponent implements OnInit, OnDestroy {
    me: User;
    optionalWord: OptionalWord;
    optionalEnglishWord: OptionalWord;
    stats: {};

    constructor(private authenticationService: AuthenticationService, private userService: UserService,
                private wordService: WordService) {
    }

    ngOnInit() {
        this.userService.getMe().subscribe(
            response => this.me = response
        );
        this.wordService.statistics().subscribe(
            response => this.stats = response,
            error => console.log(error)
        );
        this.getNewOptionalWord(true);
        this.getNewOptionalWord(false);
    }

    getNewOptionalWord(isDutch: boolean) {
        if (isDutch) {
            this.wordService.getOptionalWord().subscribe(
                response => this.optionalWord = response,
                error => console.log(error)
            );
        } else {
            this.wordService.getOptionalEnglishWord().subscribe(
                response => this.optionalEnglishWord = response,
                error => console.log(error)
            );
        }
    }

    skipWord(isDutch: boolean) {
        if (isDutch) {
            this.wordService.skipOptionalWord().subscribe(
                (/*succes*/) => this.getNewOptionalWord(isDutch),
                error => console.log(error)
            );
        } else {
            this.wordService.skipOptionalEnglishWord().subscribe(
                (/*succes*/) => this.getNewOptionalWord(isDutch),
                error => console.log(error)
            );
        }
    }

    addWord(difficulty: number, language: string) {
        const word = {
            word: (language === 'NL') ? this.optionalWord.word : this.optionalEnglishWord.word,
            added_by: this.me.username,
            difficulty,
            language
        };
        this.wordService.createNewWord(word).subscribe(
            (/*succes*/) => {
                this.getNewOptionalWord(language === 'NL');
            },
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
