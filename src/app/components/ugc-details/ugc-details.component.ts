import {confOPTIONS, confTRACKFORMS} from 'wm-core/store/conf/conf.selector';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {IonContent, IonSlides} from '@ionic/angular';
import {ITrackElevationChartHoverElements} from 'src/app/types/track-elevation-chart';
import {Store} from '@ngrx/store';
import {confShowEditingInline} from 'wm-core/store/conf/conf.selector';
import {ITrack} from 'wm-core/types/track';
import {BehaviorSubject, from, Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {Feature} from 'geojson';

@Component({
  selector: 'wm-ugc-details',
  templateUrl: './ugc-details.component.html',
  styleUrls: ['./ugc-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UgcDetailsComponent {
  @Input('track') set setTrack(track: ITrack) {
    if (track != null) {
      this.track = track;
      this.trackFeature = this._convertItrackToFeature(track);
    }
  }

  @Output('dismiss') dismiss: EventEmitter<any> = new EventEmitter<any>();
  @Output('poi-click') poiClick: EventEmitter<number> = new EventEmitter<number>();
  @Output('trackElevationChartHover')
  trackElevationChartHover: EventEmitter<ITrackElevationChartHoverElements> =
    new EventEmitter<ITrackElevationChartHoverElements>();
  @ViewChild('content') content: IonContent;
  @ViewChild('slider') slider: IonSlides;

  confOPTIONS$ = this._store.select(confOPTIONS);
  confTRACKFORMS$: Observable<any[]> = this._store.select(confTRACKFORMS);
  currentImage$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  enableEditingInline$ = this._store.select(confShowEditingInline);
  isEditing$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  slideOptions = {
    allowTouchMove: false,
    slidesPerView: 1,
    slidesPerColumn: 1,
    slidesPerGroup: 1,
    centeredSlides: true,
    watchSlidesProgress: true,
    spaceBetween: 20,
    loop: true,
  };
  track: ITrack;
  trackFeature: Feature;

  constructor(private _store: Store) {}

  @HostListener('document:keydown.Escape', ['$event'])
  public close(): void {
    this.currentImage$.next(null);
  }

  @HostListener('keydown.ArrowRight', ['$event'])
  public next(): void {
    this.slider.slideNext();
  }

  @HostListener('keydown.ArrowLeft', ['$event'])
  public prev(): void {
    this.slider.slidePrev();
  }

  clickPhoto(): void {
    from(this.slider.getActiveIndex())
      .pipe(tap(index => this.currentImage$.next(this.track.photos[index - 1].photoURL)))
      .subscribe();
  }

  private _convertItrackToFeature(track: ITrack): Feature {
    return {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: (track.geojson as any).coordinates as number[][],
      },
      properties: {
        name: track.title,
        description: track.description,
        photos: track.photos,
      },
    };
  }

  enableEditing(): void {
    this.isEditing$;
  }

  onLocationHover(event: ITrackElevationChartHoverElements | any): void {
    this.trackElevationChartHover.emit(event);
  }

  triggerDismiss(): void {
    this.dismiss.emit();
  }
}
