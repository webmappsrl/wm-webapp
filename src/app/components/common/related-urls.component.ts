/* eslint-disable @angular-eslint/template/eqeqeq */
import {Component, ChangeDetectionStrategy, Input} from '@angular/core';
@Component({
  standalone: false,
  selector: 'webmapp-related-urls',
  template: `
  <div *ngIf="relatedUrls !== null">
    <ng-container *ngFor="let item of relatedUrls|keyvalue">
      <a [href]="item.value" target="_blank" style="display:block">{{item.key}}</a>
    </ng-container>
  </div>
`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RelatedUrlsComponent {
  @Input('relatedUrls') relatedUrls: {[label: string]: string};
}
