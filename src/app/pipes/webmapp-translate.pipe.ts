import { Pipe, PipeTransform } from '@angular/core';
import { LanguagesService } from '../services/languages.service';

@Pipe({
  name: 'WebmappTranslate',
})
export class WebmappTranslatePipe implements PipeTransform {
  constructor(private _languagesService: LanguagesService) {}

  transform(value: any, ...args: unknown[]): string {
    if (value) {
      return this._languagesService.translate(value);
    } else {
      return '';
    }
  }
}
