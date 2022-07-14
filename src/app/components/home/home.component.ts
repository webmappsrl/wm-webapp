import {ActivatedRoute, Router} from '@angular/router';
import {BehaviorSubject, Observable, merge, of} from 'rxjs';
import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';

import {IConfRootState} from 'src/app/store/conf/conf.reducer';
import {IElasticSearchRootState} from 'src/app/store/elastic/elastic.reducer';
import {IUIRootState} from 'src/app/store/UI/UI.reducer';
import {InnerHtmlComponent} from '../project/project.page.component';
import {ModalController} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {confHOME} from 'src/app/store/conf/conf.selector';
import {elasticSearch} from 'src/app/store/elastic/elastic.selector';
import {setCurrentLayer} from 'src/app/store/UI/UI.actions';
import {startWith} from 'rxjs/operators';

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
  currentLayer$: BehaviorSubject<ILAYER | null> = new BehaviorSubject<ILAYER | null>(null);
  elasticSearch$: Observable<IHIT[]> = this._storeSearch.select(elasticSearch);
  isTyping$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  layerCards$: BehaviorSubject<IHIT[] | null> = new BehaviorSubject<IHIT[] | null>(null);
  showSearch: boolean = true;
  title = '';

  constructor(
    private _storeSearch: Store<IElasticSearchRootState>,
    private _storeConf: Store<IConfRootState>,
    private _StoreUi: Store<IUIRootState>,
    private _router: Router,
    private _route: ActivatedRoute,
    private _modalCtrl: ModalController,
  ) {
    this.cards$ = merge(this.elasticSearch$, this.layerCards$).pipe(startWith([]));
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

  setLayer(layer: ILAYER | null | any): void {
    if (layer != null) {
      const cards = layer.tracks[layer.id] ?? [];
      this.layerCards$.next(cards);
    } else {
      this.layerCards$.next(null);
    }
    this._StoreUi.dispatch(setCurrentLayer({currentLayer: layer}));
    this.currentLayer$.next(layer);
  }
}
