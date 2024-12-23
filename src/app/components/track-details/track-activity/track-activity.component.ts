import {ChangeDetectionStrategy, Component, Input, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'wm-track-activity',
  templateUrl: './track-activity.component.html',
  styleUrls: ['./track-activity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TrackActivityComponent{
  @Input() activity: string;
}
