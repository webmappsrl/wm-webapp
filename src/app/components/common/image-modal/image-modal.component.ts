/* eslint-disable @angular-eslint/template/eqeqeq */
import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
@Component({
  selector: 'webmapp-image-modal',
  templateUrl: './image-modal.component.html',
  styleUrls: ['./image-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ImageModalComponent {
  @Output() closeEVT: EventEmitter<void> = new EventEmitter<void>();

  @Input('image') set mapPadding(image: string) {
    this.imagePath = image;
  }
  readonly defaultPhotoPath = '/assets/icon/no-photo.svg';
  imagePath: string = this.defaultPhotoPath;
}
