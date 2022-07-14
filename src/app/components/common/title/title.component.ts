import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'webmapp-title',
  template: `<ng-content></ng-content>`,
  styles: [
    `
    webmapp-title {
    padding: 3%;
    font-size: 21px;
    font-weight: 700;
    line-height: 25px;
    letter-spacing: 0em;
    text-align: left;
  }
  `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TitleComponent {}
