/**
 * Languages Service
 *
 * It provides all the languages feature based on the app configuration,
 * such as default language, current language in use. It also handle the
 * tranlate service (ngx-translate) initialization. The translations are
 * available using the TranslateService
 *
 * */

import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class LanguagesService {
  private _defaultLanguage: string;
  private _currentLanguage: string;
  private _availableLanguages: Array<string>;
  private _onCurrentLanguageChange: ReplaySubject<string>;

  constructor(private _translateService: TranslateService) {
    this._onCurrentLanguageChange = new ReplaySubject<string>(1);
  }

  public get onCurrentLanguageChange(): Observable<string> {
    return this._onCurrentLanguageChange;
  }

  public get currentLanguage(): string {
    return this._currentLanguage;
  }

  public get defaultLang(): string {
    return this._defaultLanguage;
  }

  /**
   * Initialize the translation service and the app language
   */
  initialize() {
    this._initTranslate();
  }

  /**
   * Change the app language
   *
   * @param lang string of at least two chars that represent the language to switch
   *
   * @returns
   */
  changeLanguage(lang: string): void {
    lang = lang.substring(0, 2);
    if (this.isAvailable(lang)) {
      this._currentLanguage = lang;
      this._translateService
        .use(this._currentLanguage)
        .pipe(take(1))
        .subscribe(
          () => {
            this._onCurrentLanguageChange.next(this._currentLanguage);
          },
          (err) => {
            console.warn(err);
          }
        );
    }
  }

  /**
   * Check if the language is available
   *
   * @param lang the language to look for
   *
   * @returns
   */
  isAvailable(lang: string): boolean {
    if (
      typeof lang === 'undefined' ||
      lang === null ||
      lang === '' ||
      lang.length < 2
    ) {
      return false;
    }

    for (const i of this._availableLanguages) {
      if (i === lang.substring(0, 2)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Translate the specified key in the specified object
   *
   * @param key a translatable string or object
   * @param fallbackKey a translatable string or object to fall back if the main key has no translations
   *
   * @returns the translated string
   */
  translate(key?: string | any, fallbackKey?: string | any): string {
    let value: string;

    if (!key) {
      return undefined;
    }

    console.log(this._translateService.instant(key));
    // First the key is a string
    if (typeof key === 'string') {
      value = this._translateService.instant(key);
    }
    // Second the key object is translatable for the current language
    else if (key?.[this._currentLanguage]) {
      value = key[this._currentLanguage];
    }
    // Third the key object is translatable for the default language
    else if (key?.[this._defaultLanguage]) {
      value = key[this._defaultLanguage];
    }
    // Fourth the same with the fallback key
    else if (fallbackKey) {
      // First the fallbackKey is a string
      if (typeof fallbackKey === 'string') {
        value = this._translateService.instant(fallbackKey);
      }
      // Second the fallbackKey object is translatable for the current language
      else if (fallbackKey?.[this._currentLanguage]) {
        value = fallbackKey[this._currentLanguage];
      }
      // Third the fallbackKey object is translatable for the default language
      else if (fallbackKey?.[this._defaultLanguage]) {
        value = fallbackKey[this._defaultLanguage];
      }
    }

    return value;
  }

  /**
   * Initialize the translations and select the language
   */
  private _initTranslate() {
    this._defaultLanguage = 'it';
    this._availableLanguages = ['it'];

    this._translateService.setDefaultLang('it');
    if (
      this._translateService.getBrowserLang() !== undefined &&
      this.isAvailable(this._translateService.getBrowserLang())
    ) {
      this._currentLanguage = this._translateService
        .getBrowserLang()
        .substring(0, 2);
    } else {
      this._currentLanguage = this._defaultLanguage;
    }

    this._translateService
      .use(this._currentLanguage)
      .pipe(take(1))
      .subscribe(
        () => {
          this._onCurrentLanguageChange.next(this._currentLanguage);
        },
        (err) => {
          console.warn(err);
        }
      );
  }
}
