import {confOPTIONS, confTRACKFORMS} from '@wm-core/store/conf/conf.selector';
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
import {AlertController, IonContent, IonSlides} from '@ionic/angular';
import {ITrackElevationChartHoverElements} from 'src/app/types/track-elevation-chart';
import {Store} from '@ngrx/store';
import {confShowEditingInline} from '@wm-core/store/conf/conf.selector';
import {BehaviorSubject, from, Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {LineString} from 'geojson';
import {Media, MediaProperties, WmFeature} from '@wm-types/feature';
import {getUgcMediasByIds} from '@wm-core/utils/localForage';
import {ActivatedRoute, Router} from '@angular/router';
import {LangService} from '@wm-core/localization/lang.service';
import {deleteUgcTrack, updateUgcTrack} from '@wm-core/store/features/ugc/ugc.actions';
import {UntypedFormGroup} from '@angular/forms';

@Component({
  selector: 'wm-ugc-details',
  templateUrl: './ugc-details.component.html',
  styleUrls: ['./ugc-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UgcDetailsComponent {
  @Input('track') set setTrack(track: WmFeature<LineString>) {
    if (track != null) {
      this.track = track;
      if (track.properties.photoKeys) {
        this.medias$ = from(
          getUgcMediasByIds(track.properties.photoKeys.map(key => key.toString())),
        );
      }
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
  fg: UntypedFormGroup;
  isEditing$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  medias$: Observable<WmFeature<Media, MediaProperties>[]>;
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
  track: WmFeature<LineString>;

  constructor(
    private _store: Store,
    private _router: Router,
    private _route: ActivatedRoute,
    private _alertCtlr: AlertController,
    private _langSvc: LangService,
  ) {}

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
      .pipe(tap(index => this.currentImage$.next(this.track.properties.photos[index - 1].photoURL)))
      .subscribe();
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

  onLocationHover(event: ITrackElevationChartHoverElements | any): void {
    this.trackElevationChartHover.emit(event);
  }

  removeUgcTrackFromUrl(): void {
    const queryParams = {...this._route.snapshot.queryParams}; // Copia dei parametri esistenti

    queryParams['ugc_track'] = undefined;

    // Forza l'aggiornamento dell'URL
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams, // Parametri aggiornati
      queryParamsHandling: 'merge',
    });
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
