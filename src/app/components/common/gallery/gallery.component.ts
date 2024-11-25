import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Input,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {IonSlides} from '@ionic/angular';
import {BehaviorSubject} from 'rxjs';
import {IWmImage} from 'src/app/types/model';

@Component({
  selector: 'wm-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryComponent {
  @Input('gallery') public set imageGallery(gallery: IWmImage[]) {
    this.gallery = gallery;
  }

  @ViewChild('slider') slider: IonSlides;

  currentImage$: BehaviorSubject<IWmImage | null> = new BehaviorSubject<IWmImage | null>(null);
  public defaultPhotoPath = '/assets/icon/no-photo.svg';
  public gallery: IWmImage[] = [];
  slideOptions = {
    slidesPerView: 1,
    allowTouchMove: false,
    slidesPerColumn: 1,
    slidesPerGroup: 1,
    centeredSlides: true,
    watchSlidesProgress: true,
    spaceBetween: 0,
    virtualTranslate: false,
    parallax: false,
    on: {
      beforeInit() {
        const swiper = this;
        swiper.classNames.push(`${swiper.params.containerModifierClass}fade`);
        const overwriteParams = {
          slidesPerView: 1,
          slidesPerColumn: 1,
          slidesPerGroup: 1,
          centeredSlides: true,
          watchSlidesProgress: true,
          spaceBetween: 0,
          virtualTranslate: false,
          allowTouchMove: false,
          parallax: false,
        };
        swiper.params = Object.assign(swiper.params, overwriteParams);
        swiper.params = Object.assign(swiper.originalParams, overwriteParams);
      },
      setTranslate() {
        const swiper = this;
        const {slides} = swiper;
        for (let i = 0; i < slides.length; i += 1) {
          const $slideEl = swiper.slides.eq(i);
          const offset$$1 = $slideEl[0].swiperSlideOffset;
          let tx = -offset$$1;
          if (!swiper.params.virtualTranslate) tx -= swiper.translate;
          let ty = 0;
          if (!swiper.isHorizontal()) {
            ty = tx;
            tx = 0;
          }
          const slideOpacity = swiper.params.fadeEffect.crossFade
            ? Math.max(1 - Math.abs($slideEl[0].progress), 0)
            : 1 + Math.min(Math.max($slideEl[0].progress, -1), 0);
          $slideEl
            .css({
              opacity: slideOpacity,
            })
            .transform(`translate3d(${tx}px, ${ty}px, 0px)`);
        }
      },
      setTransition(duration) {
        const swiper = this;
        const {slides, $wrapperEl} = swiper;
        slides.transition(duration);
        if (swiper.params.virtualTranslate && duration !== 0) {
          let eventTriggered = false;
          slides.transitionEnd(() => {
            if (eventTriggered) return;
            if (!swiper || swiper.destroyed) return;
            eventTriggered = true;
            swiper.animating = false;
            const triggerEvents = ['webkitTransitionEnd', 'transitionend'];
            for (let i = 0; i < triggerEvents.length; i += 1) {
              $wrapperEl.trigger(triggerEvents[i]);
            }
          });
        }
      },
    },
  };

  @HostListener('document:keydown.Escape', ['$event'])
  public close(): void {
    this.currentImage$.next(null);
  }

  @HostListener('keydown.ArrowRight', ['$event'])
  public next(): void {
    this._navigateGallery('next');
  }

  @HostListener('keydown.ArrowLeft', ['$event'])
  public prev(): void {
    this._navigateGallery('prev');
  }

  private _navigateGallery(direction: 'next' | 'prev'): void {
    const currentIndex =
      this.currentImage$.value == null ? 0 : this.gallery.indexOf(this.currentImage$.value);

    const newIndex = direction === 'next'
      ? (currentIndex + 1) % this.gallery.length
      : currentIndex <= 0
        ? this.gallery.length - 1
        : (currentIndex - 1) % this.gallery.length;

    this.currentImage$.next(this.gallery[newIndex]);
    this.slider.slideTo(newIndex);
  }
}
