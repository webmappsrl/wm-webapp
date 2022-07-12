import {ActivatedRoute, Router} from '@angular/router';
import {BehaviorSubject, Observable, merge, of} from 'rxjs';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import {startWith, tap} from 'rxjs/operators';

import {IConfRootState} from 'src/app/store/conf/conf.reducer';
import {IElasticSearchRootState} from 'src/app/store/elastic/elastic.reducer';
import {IUIRootState} from 'src/app/store/UI/UI.reducer';
import { InnerHtmlComponent } from '../project/project.page.component';
import { ModalController } from '@ionic/angular';
import {Store} from '@ngrx/store';
import {confHOME} from 'src/app/store/conf/conf.selector';
import {elasticSearch} from 'src/app/store/elastic/elastic.selector';
import {setCurrentLayer} from 'src/app/store/UI/UI.actions';

@Component({
  selector: 'webmapp-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent {
  @Output('searchId') searchIdEvent: EventEmitter<number> = new EventEmitter<number>();

  cards$: Observable<IHIT[]> = of([]);
  elasticSearch$: Observable<IHIT[]> = this._storeSearch.select(elasticSearch);
  confHOME$: Observable<IHOME[]> = this._storeConf.select(confHOME);
  isTyping$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  layerCards$: BehaviorSubject<IHIT[] | null> = new BehaviorSubject<IHIT[] | null>(null);
  currentLayer$: BehaviorSubject<ILAYER | null> = new BehaviorSubject<ILAYER | null>(null);

  public isBackAvailable: boolean = false;
  public showSearch: boolean = true;
  public title: string;
  public searchString: string;

  constructor(
    private _storeSearch: Store<IElasticSearchRootState>,
    private _storeConf: Store<IConfRootState>,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    private _StoreUi: Store<IUIRootState>,
    private _router: Router,
    private _route: ActivatedRoute,
    private _modalCtrl:ModalController
  ) {
    this.cards$ = merge(this.elasticSearch$, this.layerCards$).pipe(startWith([]));
  }

  searchCard(id: string | number) {
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: {track: id ? id : null},
      queryParamsHandling: 'merge',
    });
  }

  setLayer(layer: ILAYER | null | any) {
    if (layer != null) {
      const cards = layer.tracks[layer.id] ?? [];
      this.layerCards$.next(cards);
    } else {
      this.layerCards$.next(null);
    }
    this._StoreUi.dispatch(setCurrentLayer({currentLayer: layer}));
    this.currentLayer$.next(layer);
  }

  openSlug(slug:string): void {
    if(slug === 'project') {
      this._modalCtrl
      .create({
        component: InnerHtmlComponent,
        cssClass:'wm-modal',
        backdropDismiss:true,
        keyboardClose:true
      })
      .then(modal => {
        modal.present();
      });
    }
  }
}
