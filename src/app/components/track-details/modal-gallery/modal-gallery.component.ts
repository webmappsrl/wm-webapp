import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 'webmapp-modal-gallery',
  templateUrl: './modal-gallery.component.html',
  styleUrls: ['./modal-gallery.component.scss'],
})
export class ModalGalleryComponent implements OnInit, OnDestroy {
  @Input() gallery: Array<{
    src: string;
    caption?: string;
    url?: string;
  }>;
  @ViewChild('gallerySlider') slider: any; // TODO: Update to use Swiper directly
  public galleryOptions: any;
  public isExpanded: boolean;
  public isStart: boolean;
  public isEnd: boolean;

  private _destroyer: Subject<any> = new Subject<any>();

  constructor(private _modalController: ModalController) {
    this.isExpanded = false;
    this.isStart = true;
    this.isEnd = false;
    this.galleryOptions = {
      slidesPerView: 1,
    };

    if (1 == 1) {
      // || alleryAnimationType === "fade") {
      this.galleryOptions.on = {
        beforeInit() {
          const swiper = this;
          swiper.classNames.push(`${swiper.params.containerModifierClass}fade`);
          const overwriteParams = {
            slidesPerView: 1,
            slidesPerColumn: 1,
            slidesPerGroup: 1,
            watchSlidesProgress: true,
            spaceBetween: 0,
            virtualTranslate: true,
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
            if (!swiper.params.virtualTranslate) {
              tx -= swiper.translate;
            }
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
              if (eventTriggered) {
                return;
              }
              if (!swiper || swiper.destroyed) {
                return;
              }
              eventTriggered = true;
              swiper.animating = false;
              const triggerEvents = ['webkitTransitionEnd', 'transitionend'];
              for (const te of triggerEvents) {
                $wrapperEl.trigger(te);
              }
            });
          }
        },
      };
    }
  }

  ngOnInit() {
    setTimeout(() => {
      this.slider.ionSlideTransitionEnd.pipe(takeUntil(this._destroyer)).subscribe(
        event => {
          this.slider.getActiveIndex().then(index => {
            this.isStart = index === 0 ? true : false;
            this.isEnd = index === this.gallery.length - 1 ? true : false;
            this.isExpanded = false;
          });
        },
        err => {
          console.warn(err);
        },
      );

      console.log('------- ~ ModalGalleryComponent ~ setTimeout ~ this.gallery', this.gallery);
      if (this.gallery.length === 1) {
        this.isEnd = true;
      }
    }, 0);
  }

  next(): void {
    this.slider.slideNext();
  }

  previous(): void {
    this.slider.slidePrev();
  }

  dismiss() {
    this._modalController.dismiss();
  }

  expandCaption(): void {
    this.isExpanded = !this.isExpanded;
  }

  ngOnDestroy() {
    this._destroyer.next();
  }
}
