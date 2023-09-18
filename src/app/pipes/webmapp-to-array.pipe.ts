import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'toArray',
})
export class WmToArrayPipe implements PipeTransform {
  transform(value: string): string[] {
    if (!value) {
      return [];
    }

    if (!value.includes(',')) {
      return [value.trim()];
    }

    return value.split(',').map(phone => phone.trim());
  }
}
