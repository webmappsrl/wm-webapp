import {LineString} from 'geojson';
import {BehaviorSubject, Observable, from} from 'rxjs';

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
import {UntypedFormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AlertController, IonContent, IonSlides} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {LangService} from '@wm-core/localization/lang.service';
import {UrlHandlerService} from '@wm-core/services/url-handler.service';
import {WmSlopeChartComponent} from '@wm-core/slope-chart/slope-chart.component';
import {confOPTIONS, confTRACKFORMS} from '@wm-core/store/conf/conf.selector';
import {deleteUgcTrack, updateUgcTrack} from '@wm-core/store/features/ugc/ugc.actions';
import {Media, MediaProperties, WmFeature} from '@wm-types/feature';
import {WmSlopeChartHoverElements} from '@wm-types/slope-chart';
import {tap} from 'rxjs/operators';

@Component({
  selector: 'wm-ugc-details',
  templateUrl: './ugc-details.component.html',
  styleUrls: ['./ugc-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UgcDetailsComponent {
  confOPTIONS$ = this._store.select(confOPTIONS);
  confTRACKFORMS$: Observable<any[]> = this._store.select(confTRACKFORMS);
  @ViewChild('content') public content: IonContent;
  currentImage$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  @Output('dismiss') public dismiss: EventEmitter<any> = new EventEmitter<any>();
  public fg: UntypedFormGroup;
  isEditing$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  medias$: Observable<WmFeature<Media, MediaProperties>[]>;
  @Output('poi-click') public poiClick: EventEmitter<number> = new EventEmitter<number>();
  public slideOptions = {
    allowTouchMove: false,
    slidesPerView: 1,
    slidesPerColumn: 1,
    slidesPerGroup: 1,
    centeredSlides: true,
    watchSlidesProgress: true,
    spaceBetween: 20,
    loop: true,
  };
  @ViewChild('slider') public slider: IonSlides;
  public track: WmFeature<LineString>;
  @Output('trackElevationChartHover')
  public trackElevationChartHover: EventEmitter<WmSlopeChartHoverElements> =
    new EventEmitter<WmSlopeChartHoverElements>();

  constructor(
    private _store: Store,
    private _router: Router,
    private _route: ActivatedRoute,
    private _alertCtlr: AlertController,
    private _langSvc: LangService,
    private _urlHandlerSvc: UrlHandlerService,
  ) {}

  @Input('track') public set setTrack(track: WmFeature<LineString>) {
    if (track != null) {
      this.track = track;
    }
  }

  clickPhoto(): void {
    from(this.slider.getActiveIndex())
      .pipe(tap(index => this.currentImage$.next(this.track.properties.photos[index - 1].photoURL)))
      .subscribe();
  }

  @HostListener('document:keydown.Escape', ['$event'])
  public close(): void {
    this.currentImage$.next(null);
  }

  deleteTrack(): void {
    from(
      this._alertCtlr.create({
        message: this._langSvc.instant(
          'Sicuro di voler eliminare questa traccia? La rimozione è irreversibile.',
        ),
        buttons: [
          {text: this._langSvc.instant('Annulla'), role: 'cancel'},
          {
            text: this._langSvc.instant('Elimina'),
            handler: () => this._store.dispatch(deleteUgcTrack({track: this.track})),
          },
        ],
      }),
    ).subscribe(alert => alert.present());
  }

  enableEditing(): void {
    this.isEditing$;
  }

  @HostListener('keydown.ArrowRight', ['$event'])
  public next(): void {
    this.slider.slideNext();
  }

  onLocationHover(event: WmSlopeChartComponent | any): void {
    this.trackElevationChartHover.emit(event);
  }

  @HostListener('keydown.ArrowLeft', ['$event'])
  public prev(): void {
    this.slider.slidePrev();
  }

  removeUgcTrackFromUrl(): void {
    this._urlHandlerSvc.updateURL({ugc_track: undefined});
  }

  triggerDismiss(): void {
    this.removeUgcTrackFromUrl();
    this.dismiss.emit();
  }

  updateTrack(): void {
    if (this.fg.valid) {
      const track: WmFeature<LineString> = {
        ...this.track,
        properties: {
          ...this.track?.properties,
          name: this.fg.value.title,
          form: this.fg.value,
          updatedAt: new Date(),
        },
      };

      this._store.dispatch(updateUgcTrack({track}));
      this.isEditing$.next(false);
    }
  }
}
