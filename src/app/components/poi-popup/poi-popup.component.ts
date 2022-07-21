import {BehaviorSubject, Observable, from} from 'rxjs';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';

import {IonSlides} from '@ionic/angular';

@Component({
  selector: 'webmapp-poi-popup',
  templateUrl: './poi-popup.component.html',
  styleUrls: ['./poi-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PoiPopupComponent implements OnInit {
  @Output() closeEVT: EventEmitter<void> = new EventEmitter<void>();
  @Output() nextEVT: EventEmitter<void> = new EventEmitter<void>();
  @Output() prevEVT: EventEmitter<void> = new EventEmitter<void>();
  @ViewChild('gallery') slider: IonSlides;
  isEnd$: Observable<boolean>;
  defaultPhotoPath = '/assets/icon/no-photo.svg';
  poiProperties: any = null;
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
  ngOnInit(): void {}

  toggleImage$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  @Input('poi') set setPoi(poi: any) {
    if (poi != null && poi.properties != null) {
      const prop: {[key: string]: any} = {};
      try {
        prop.address =
          poi.properties.addr_complete ??
          [poi.properties.addr_locality, poi.properties.addr_street]
            .filter(f => f != null)
            .join(', ');
      } catch (_) {
        prop.address = '';
      }
      try {
        prop.address_link = [poi.properties.addr_locality, poi.properties.addr_street]
          .filter(f => f != null)
          .join('+');
      } catch (_) {
        prop.address_link = '';
      }
      if (poi.properties.related_url != null) {
        if (poi.properties.related_url[''] === null) {
          delete poi.properties.related_url[''];
        }
        prop.related_url =
          Object.keys(poi.properties.related_url).length === 0 ? null : poi.properties.related_url;
      }

      this.poiProperties = {...poi.properties, ...prop};
    }
  }

  @HostListener('document:keydown.ArrowLeft', ['$event'])
  handleArrowLeft() {
    this.prevEVT.emit();
  }

  @HostListener('document:keydown.ArrowRight', ['$event'])
  handleArrowRight() {
    this.nextEVT.emit();
  }

  @HostListener('document:keydown.Escape', ['$event'])
  handleEscape() {
    this.closeEVT.emit();
  }

  toggleImage(val = null): void {
    console.log('click');
    this.toggleImage$.next(val);
  }

  next(): void {
    this.slider.slideNext();
    this.toggleImage(null);
  }
  prev(): void {
    this.slider.slidePrev();
    this.toggleImage(null);
  }
}
