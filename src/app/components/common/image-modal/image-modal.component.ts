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
  @Input('showArrows') public showArrow = false;
  @Output() public closeEVT: EventEmitter<void> = new EventEmitter<void>();
  @Output() public nextEVT: EventEmitter<void> = new EventEmitter<void>();
  @Output() public prevEVT: EventEmitter<void> = new EventEmitter<void>();

  public defaultPhotoPath = '/assets/icon/no-photo.svg';
  public imagePath: string = this.defaultPhotoPath;

  @Input('image') public set mapPadding(image: string) {
    this.imagePath = image;
  }
}
