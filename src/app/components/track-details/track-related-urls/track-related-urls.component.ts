import {Component, ChangeDetectionStrategy, Input} from '@angular/core';
@Component({
  selector: 'webmapp-track-related-urls',
  templateUrl: './track-related-urls.component.html',
  styleUrls: ['./track-related-urls.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackRelatedUrlsComponent {
  @Input('relatedUrls') relatedUrls: {[label: string]: string};
  constructor() {}
}
