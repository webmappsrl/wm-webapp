import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'webmapp-box',
  templateUrl: './box.component.html',
  styleUrls: ['./box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BoxComponent {
  @Input('data') data: IHIT;
  @Output() public clickEVT: EventEmitter<void> = new EventEmitter<void>();
  public defaultPhotoPath = '/assets/icon/no-photo.svg';
}
