import {ActivatedRoute, Router} from '@angular/router';
import {BehaviorSubject, Observable, merge, of, zip} from 'rxjs';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  ViewEncapsulation,
} from '@angular/core';
import {confHOME, confPOISFilter} from 'src/app/store/conf/conf.selector';
import {filter, map, shareReplay, startWith, switchMap, tap, withLatestFrom} from 'rxjs/operators';
import {setCurrentFilters, setCurrentLayer, setCurrentPoiId} from 'src/app/store/UI/UI.actions';

import {IConfRootState} from 'src/app/store/conf/conf.reducer';
import {IElasticSearchRootState} from 'src/app/store/elastic/elastic.reducer';
import {IUIRootState} from 'src/app/store/UI/UI.reducer';
import {InnerHtmlComponent} from '../project/project.page.component';
import {ModalController} from '@ionic/angular';
import {Store} from '@ngrx/store';
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
  confPOISFilter$: Observable<any> = this._storeConf.select(confPOISFilter);
  currentLayer$: BehaviorSubject<ILAYER | null> = new BehaviorSubject<ILAYER | null>(null);
  currentSearch$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  currentTab = 'tracks';
  elasticSearch$: Observable<IHIT[]> = this._storeSearch.select(elasticSearch);
  isTyping$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  layerCards$: BehaviorSubject<IHIT[] | null> = new BehaviorSubject<IHIT[] | null>(null);
  poiCards$: Observable<any[]>;
  selectedFilters$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  showSearch = true;
  title = '';

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
    const allPois: Observable<any[]> = this._storeUi.select(pois).pipe(
      filter(p => p != null),
      map(p => ((p as any).features || []).map(p => (p as any).properties || [])),
    );
    const selectedPois = zip(this.currentSearch$, allPois, this.selectedFilters$).pipe(
      map(([search, features, filters]) => {
        return features.filter(f => {
          const firstCondition = JSON.stringify(f.name)
            .toLowerCase()
            .includes(search.toLowerCase());
          let secondCondition = true;
          if (filters.length > 0) {
            secondCondition =
              f.taxonomyIdentifiers.filter(v => filters.indexOf(v) >= 0).length >= filters.length;
          }
          return firstCondition && secondCondition;
        }) as any[];
      }),
    );
    this.poiCards$ = merge(this.currentSearch$, this.selectedFilters$).pipe(
      switchMap(_ => selectedPois),
    );
  }

  openExternalUrl(url: string): void {
    window.open(url);
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

  segmentChanged(ev: any) {
    this.currentTab = ev.detail.value;
    this._cdr.markForCheck();
  }

  setCurrentFilters(filters: string[]): void {
    this._storeUi.dispatch(setCurrentFilters({currentFilters: filters}));
    console.log(filters);
    this.selectedFilters$.next(filters);
  }

  setLayer(layer: ILAYER | null | any): void {
    if (layer != null) {
      const cards = layer.tracks[layer.id] ?? [];
      this.layerCards$.next(cards);
      this._cdr.markForCheck();
    } else {
      this.layerCards$.next(null);
    }
    this._storeUi.dispatch(setCurrentLayer({currentLayer: layer}));
    this.currentLayer$.next(layer);
  }

  setPoi(id: number): void {
    this._storeUi.dispatch(setCurrentPoiId({currentPoiId: id}));
  }
}
