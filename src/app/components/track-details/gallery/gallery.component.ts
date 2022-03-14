import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {IWmImage} from 'src/app/types/model';

@Component({
  selector: 'webmapp-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryComponent {
  currentImage$: BehaviorSubject<IWmImage | null> = new BehaviorSubject<IWmImage | null>(null);
  public defaultPhotoPath = '/assets/icon/no-photo.svg';
  public gallery: IWmImage[] = [];

  @Input('gallery') public set imageGallery(value: IWmImage[]) {
    this.gallery = value;
  }

  @HostListener('document:keydown.Escape', ['$event'])
  public close(): void {
    this.currentImage$.next(null);
  }

  @HostListener('document:keydown.ArrowRight', ['$event'])
  public next(): void {
    const currentIndex = this.gallery.indexOf(this.currentImage$.value);
    const nextIndex = (currentIndex + 1) % this.gallery.length;
    this.currentImage$.next(this.gallery.slice(nextIndex)[0]);
  }

  @HostListener('document:keydown.ArrowLeft', ['$event'])
  public prev(): void {
    const currentIndex = this.gallery.indexOf(this.currentImage$.value);
    const prevIndex = (currentIndex - 1) % this.gallery.length;
    this.currentImage$.next(this.gallery.slice(prevIndex)[0]);
  }
}
