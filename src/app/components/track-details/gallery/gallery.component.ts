import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IWmImage } from 'src/app/types/model';
import SwiperCore, {
  Autoplay,
  Keyboard,
  Pagination,
  Scrollbar,
  Zoom,
} from 'swiper';
import { SwiperComponent } from 'swiper/angular';
import { ModalGalleryComponent } from '../modal-gallery/modal-gallery.component';

@Component({
  selector: 'webmapp-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent implements OnInit {
  @Input('gallery') set imageGallery(value: Array<IWmImage>) {
    this._initializeGallery(value);
  }

  @ViewChild('swiper', { static: false }) swiper?: SwiperComponent;

  public gallery: Array<IWmImage>;
  public currentSlide: number = 0;

  constructor(
    private _modalController: ModalController
  ) {
    SwiperCore.use([Autoplay, Keyboard, Pagination, Scrollbar, Zoom]);
  }

  ngOnInit() { }

  next() {
    this.swiper.swiperRef.slideNext(200);
  }

  back() {
    this.swiper.swiperRef.slidePrev(200);
  }

  slideChange(ev) {
    this.currentSlide = ev.activeIndex;
  }

  open() {
    if (this.gallery.length > 0) {
      this._modalController
        .create({
          component: ModalGalleryComponent,
          cssClass: 'modal-gallery-class',
          componentProps: {
            gallery: this.gallery,
          },
        })
        .then((modal) => {
          modal.present();
        });
    }

  }

  private _initializeGallery(gallery: Array<IWmImage>): void {
    this.gallery = gallery;
  }
}
