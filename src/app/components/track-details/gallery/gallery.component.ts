import { Component, Input, OnInit } from '@angular/core';
import { IWmImage } from 'src/app/types/model';
import SwiperCore, {
  Autoplay,
  Keyboard,
  Pagination,
  Scrollbar,
  Zoom,
} from 'swiper';

@Component({
  selector: 'webmapp-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent implements OnInit {
  @Input('gallery') set imageGallery(value: Array<IWmImage>) {
    this._initializeGallery(value);
  }

  public gallery: Array<IWmImage>;

  constructor() {
    SwiperCore.use([Autoplay, Keyboard, Pagination, Scrollbar, Zoom]);
  }

  ngOnInit() {}

  private _initializeGallery(gallery: Array<IWmImage>): void {
    this.gallery = gallery;
  }
}
