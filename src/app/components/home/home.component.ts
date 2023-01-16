import {ActivatedRoute, Router} from '@angular/router';
import {BehaviorSubject, Observable, merge, of, zip} from 'rxjs';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import {confHOME, confPOISFilter} from 'src/app/store/conf/conf.selector';
import {filter, map, shareReplay, startWith, switchMap, tap} from 'rxjs/operators';
import {setCurrentFilters, setCurrentLayer, setCurrentPoi} from 'src/app/store/UI/UI.actions';

import {IConfRootState} from 'src/app/store/conf/conf.reducer';
import {IElasticSearchRootState} from 'src/app/store/elastic/elastic.reducer';
import {IUIRootState} from 'src/app/store/UI/UI.reducer';
import {InnerHtmlComponent} from '../project/project.page.component';
import {ModalController, NavController} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {elasticLayerTracks, elasticSearch} from 'src/app/store/elastic/elastic.selector';
import {pois} from 'src/app/store/pois/pois.selector';
import {fromHEXToColor} from 'src/app/shared/map-core/utils/styles';
import {layerTracksElastic, searchElastic} from 'src/app/store/elastic/elastic.actions';
import {UICurrentLAyer} from 'src/app/store/UI/UI.selector';

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
  confPOISFilter$: Observable<any> = this._storeConf.select(confPOISFilter).pipe(
    map(p => {
      if (p.poi_type != null) {
        let poi_type = p.poi_type.map(p => {
          if (p.icon != null && p.color != null) {
            const namedPoiColor = fromHEXToColor[p.color] || 'darkorange';
            return {...p, ...{icon: p.icon.replaceAll('darkorange', namedPoiColor)}};
          }
          return p;
        });
        return {where: p.where, poi_type};
      }
      return p;
    }),
  );
  currentLayer$ = this._storeUi.select(UICurrentLAyer);
  currentSearch$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  currentTab$: BehaviorSubject<string> = new BehaviorSubject<string>('tracks');
  elasticSearch$: Observable<IHIT[]> = this._storeSearch.select(elasticSearch);
  isTyping$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  layerCards$: Observable<IHIT[]> = this._storeConf.select(elasticLayerTracks);
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
    private _navCtrl: NavController,
  ) {
    this.cards$ = merge(this.elasticSearch$, this.layerCards$).pipe(startWith([]), shareReplay(1));
    const allPois: Observable<any[]> = this._storeUi.select(pois).pipe(
      filter(p => p != null),
      map(p => ((p as any).features || []).map(p => (p as any).properties || [])),
    );
    const selectedPois = zip(this.currentSearch$, allPois, this.selectedFilters$).pipe(
      map(([search, features, filters]) => {
        const isSearch = search.length > 0 || filters.length > 0;
        const whereFilters = filters.filter(f => f.indexOf('where_') >= 0);
        const poiTypeFilters = filters.filter(f => f.indexOf('poi_type_') >= 0);
        let whereCondition = true;
        let poiTypeCondition = true;
        return features.filter(f => {
          const nameCondition = JSON.stringify(f.name).toLowerCase().includes(search.toLowerCase());
          if (filters.length > 0) {
            whereCondition =
              whereFilters.length > 0
                ? f.taxonomyIdentifiers.filter(v => whereFilters.indexOf(v) >= 0).length > 0
                : true;
            poiTypeCondition =
              poiTypeFilters.length > 0
                ? f.taxonomyIdentifiers.filter(v => poiTypeFilters.indexOf(v) >= 0).length > 0
                : true;
          }
          return nameCondition && whereCondition && poiTypeCondition && isSearch;
        }) as any[];
      }),
      tap(pois => {
        if (pois.length === 0) {
          this.currentTab$.next('tracks');
        }
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
    } else {
      this._navCtrl.navigateForward(slug);
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
    this.currentTab$.next(ev.detail.value);
  }

  setCurrentFilters(filters: string[]): void {
    this._storeUi.dispatch(setCurrentFilters({currentFilters: filters}));
    this.selectedFilters$.next(filters);
    this.currentTab$.next('pois');
  }

  setLayer(layer: ILAYER | null | any): void {
    this._storeUi.dispatch(setCurrentLayer({currentLayer: layer}));
    if (typeof layer === 'number') {
      this._storeSearch.dispatch(layerTracksElastic({layer, inputTyped: ''}));
    }
    if (layer != null && layer.id != null) {
      this._storeSearch.dispatch(layerTracksElastic({layer: layer.id, inputTyped: ''}));
    }
    if (layer == null) {
      this._storeSearch.dispatch(searchElastic({inputTyped: ''}));
    }
  }

  setPoi(currentPoi: any): void {
    this._storeUi.dispatch(setCurrentPoi({currentPoi}));
  }
}
