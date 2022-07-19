import {ActivatedRoute, Router} from '@angular/router';
import {BehaviorSubject, Observable, merge, of} from 'rxjs';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import {filter, map, shareReplay, startWith, withLatestFrom} from 'rxjs/operators';
import {setCurrentLayer, setCurrentPoiId} from 'src/app/store/UI/UI.actions';

import {IConfRootState} from 'src/app/store/conf/conf.reducer';
import {IElasticSearchRootState} from 'src/app/store/elastic/elastic.reducer';
import {IUIRootState} from 'src/app/store/UI/UI.reducer';
import {InnerHtmlComponent} from '../project/project.page.component';
import {ModalController} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {confHOME} from 'src/app/store/conf/conf.selector';
import {elasticSearch} from 'src/app/store/elastic/elastic.selector';
import {pois} from 'src/app/store/pois/pois.selector';

@Component({
  selector: 'webmapp-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent {
  cards$: Observable<IHIT[]> = of([]);
  confHOME$: Observable<IHOME[]> = this._storeConf.select(confHOME);
  currentSearch$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  currentLayer$: BehaviorSubject<ILAYER | null> = new BehaviorSubject<ILAYER | null>(null);
  elasticSearch$: Observable<IHIT[]> = this._storeSearch.select(elasticSearch);
  isTyping$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  layerCards$: BehaviorSubject<IHIT[] | null> = new BehaviorSubject<IHIT[] | null>(null);
  poiCards$ = this._storeUi.select(pois).pipe(
    filter(p => p != null),
    map(p => ((p as any).features || []).map(p => (p as any).properties || [])),
    shareReplay(1),
    withLatestFrom(this.currentSearch$),
    map(([features, search]) => {
      console.log('search');
      return features.filter(f => JSON.stringify(f.name).includes(search));
    }),
  );

  showSearch: boolean = true;
  title = '';
  currentTab = 'tracks';

  constructor(
    private _storeSearch: Store<IElasticSearchRootState>,
    private _storeConf: Store<IConfRootState>,
    private _storeUi: Store<IUIRootState>,
    private _router: Router,
    private _route: ActivatedRoute,
    private _modalCtrl: ModalController,
    private _cdr: ChangeDetectorRef,
  ) {
    this.cards$ = merge(this.elasticSearch$, this.layerCards$).pipe(startWith([]), shareReplay(1));
    this.poiCards$.subscribe(v => console.log(v));
  }

  openExternalUrl(url: string): void {
    window.open(url);
  }

  segmentChanged(ev: any) {
    this.currentTab = ev.detail.value;
    this._cdr.detectChanges();
  }

  openSlug(slug: string): void {
    if (slug === 'project') {
      this._modalCtrl
        .create({
          component: InnerHtmlComponent,
          cssClass: 'wm-modal',
          backdropDismiss: true,
          keyboardClose: true,
        })
        .then(modal => {
          modal.present();
        });
    }
  }

  searchCard(id: string | number): void {
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: {track: id ? id : null},
      queryParamsHandling: 'merge',
    });
  }
  setPoi(id: number): void {
    this._storeUi.dispatch(setCurrentPoiId({currentPoiId: id}));
  }

  setLayer(layer: ILAYER | null | any): void {
    if (layer != null) {
      const cards = layer.tracks[layer.id] ?? [];
      this.layerCards$.next(cards);
    } else {
      this.layerCards$.next(null);
    }
    this._storeUi.dispatch(setCurrentLayer({currentLayer: layer}));
    this.currentLayer$.next(layer);
  }
}
