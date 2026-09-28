import {Point} from 'geojson';
import {BehaviorSubject, Observable, from} from 'rxjs';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import {UntypedFormGroup} from '@angular/forms';
import {AlertController} from '@ionic/angular';
import {MemoizedSelector, Store} from '@ngrx/store';
import {LangService} from '@wm-core/localization/lang.service';
import {confPOIFORMS, confShowEditingInline} from '@wm-core/store/conf/conf.selector';
import {deleteUgcPoi, updateUgcPoi} from '@wm-core/store/features/ugc/ugc.actions';
import {WmFeature, WmProperties} from '@wm-types/feature';
import {filter, switchMap, take} from 'rxjs/operators';
import {startDrawUgcPoi, stopDrawUgcPoi} from '@wm-core/store/user-activity/user-activity.action';
import {currentUgcPoiDrawnGeometry} from '@wm-core/store/features/ugc/ugc.selector';
import {
  canNavigateRelatedPois,
  nextRelatedPoiId,
  prevRelatedPoiId,
} from '@wm-core/store/features/ec/ec.selector';
import {UrlHandlerService} from '@wm-core/services/url-handler.service';
import {derivePoiAddress} from '@wm-core/utils/derive-poi-address';
import {buildMapsHref} from '@wm-core/address/maps-href';
import {normalizeRelatedUrls} from '@wm-core/related-urls/related-urls.component';

@Component({
  standalone: false,
  selector: 'webmapp-poi-popup',
  templateUrl: './poi-popup.component.html',
  styleUrls: ['./poi-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PoiPopupComponent {
  @Output() closeEVT: EventEmitter<void> = new EventEmitter<void>();
  confPOIFORMS$: Observable<any[]> = this._store.select(confPOIFORMS);
  currentUgcPoiDrawnGeometry$: Observable<Point> = this._store.select(currentUgcPoiDrawnGeometry);
  enableEditingInline$ = this._store.select(confShowEditingInline);
  public fg: UntypedFormGroup;
  isEditing$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public poi: WmFeature<Point> = null;
  public poiProperties: WmProperties = null;

  constructor(
    private _store: Store,
    private _alertCtrl: AlertController,
    private _langSvc: LangService,
    private _cdr: ChangeDetectorRef,
    private _urlHandlerSvc: UrlHandlerService,
  ) {}

  @Input('poi') public set setPoi(poi: any) {
    if (poi != null && poi.properties != null) {
      this.poi = poi;
      // L'indirizzo va derivato anche qui, non solo in `wm-poi-properties`: il ramo UGC non passa
      // dal componente condiviso, e su `develop` questo setter componeva `address` da
      // `addr_complete`/`addr_locality`/`addr_street` per **tutti** i POI. Senza, un POI UGC che
      // abbia solo i campi `addr_*` perderebbe la riga dell'indirizzo e il link a Maps.
      // `derivePoiAddress` è la stessa funzione che usa il condiviso: una sola implementazione,
      // non due che possono divergere.
      this._refreshProperties(poi);
    }
  }

  /**
   * L'unico punto in cui si costruisce `poiProperties`. Esiste perché la derivazione
   * dell'indirizzo va applicata **sempre**, e averla in un posto solo evita che i due percorsi
   * divergano: era già successo: il setter la faceva, `updatePoi()` no, e dopo un salvataggio
   * l'indirizzo di un POI UGC spariva.
   */
  private _refreshProperties(poi: WmFeature<Point>): void {
    const {address} = derivePoiAddress(poi?.properties as any);
    this.poiProperties = {...poi?.properties, address} as any;
  }

  /**
   * Link Google Maps per il ramo UGC. Sostituisce l'interpolazione inline che aveva una graffa di
   * chiusura in eccesso (`{{...}}}`): quella finiva letteralmente nell'URL, che nel DOM risultava
   * `daddr=…}&navigate=yes`. Per i POI EC il link lo produce `wm-address` in wm-core.
   *
   * L'URL lo costruisce `buildMapsHref` di wm-core, lo stesso che usa `wm-address`: la template
   * string era copiata qui e solo quella di wm-core aveva uno spec, quindi cambiare destinazione
   * avrebbe richiesto due modifiche e nessuno strumento avrebbe segnalato la seconda (oc:8613).
   */
  get ugcMapsHref(): string {
    return buildMapsHref(this.poiProperties?.address);
  }

  /**
   * `true` solo se `related_url` porta almeno un link utilizzabile. Sostituisce la normalizzazione
   * che il setter faceva prima — cancellava la chiave `''` e forzava `null` sull'oggetto vuoto
   * **mutando un oggetto dello store**: qui la stessa decisione è presa in lettura, senza toccare
   * lo stato.
   *
   * Le tre forme del campo — oggetto `{label: url}`, array, stringa — le riconosce
   * `normalizeRelatedUrls` di wm-core, la stessa funzione che disegna poi quei link e che
   * `PoiPropertiesComponent` usa per il proprio gate. Qui erano riscritte a mano: due gate
   * separati sullo stesso campo divergono alla prima forma nuova, ed è l'anti-pattern che questo
   * stesso file documenta per `canNavigateRelatedPois` (oc:8613).
   */
  get hasRelatedUrls(): boolean {
    return normalizeRelatedUrls(this.poiProperties?.related_url).length > 0;
  }

  editUgcPoi(): void {
    this.isEditing$.next(true);
    this._store.dispatch(startDrawUgcPoi({ugcPoi: this.poi}));
  }

  cancelEditUgcPoi(): void {
    this.isEditing$.next(false);
    this._store.dispatch(stopDrawUgcPoi());
  }

  deleteUgcPoi(): void {
    from(
      this._alertCtrl.create({
        message: this._langSvc.instant(
          "Sei sicuro di voler eliminare questo POI? L'operazione è irreversibile.",
        ),
        buttons: [
          {text: this._langSvc.instant('Annulla'), role: 'cancel'},
          {
            text: this._langSvc.instant('Elimina'),
            handler: () => {
              this._store.dispatch(deleteUgcPoi({poi: this.poi}));
              this.closeEVT.emit();
            },
          },
        ],
      }),
    )
      .pipe(
        switchMap(alert => alert.present()),
        take(1),
      )
      .subscribe();
  }

  @HostListener('document:keydown.ArrowLeft', ['$event'])
  handleArrowLeft(event: KeyboardEvent): void {
    if (this._isTypingOrAdjusting(event)) {
      return;
    }
    this._goToRelatedPoi(prevRelatedPoiId);
  }

  @HostListener('document:keydown.ArrowRight', ['$event'])
  handleArrowRight(event: KeyboardEvent): void {
    if (this._isTypingOrAdjusting(event)) {
      return;
    }
    this._goToRelatedPoi(nextRelatedPoiId);
  }

  /**
   * Elementi che con le frecce fanno qualcosa di proprio: i campi di testo muovono il cursore, i
   * selettori e i cursori cambiano valore. Gli `HostListener` ascoltano su `document`, quindi
   * ricevono anche i tasti premuti nella searchbar della home o nel form UGC, e far cambiare POI
   * sotto le mani sarebbe una sorpresa. `ion-input`, `ion-textarea` e `ion-searchbar` sono qui per
   * sicurezza: Ionic li rende `scoped`, quindi di solito `event.target` è l'`<input>` interno, ma
   * `ion-select` e `ion-segment` hanno come target il proprio host e senza questi nomi non
   * sarebbero coperti (oc:8613).
   */
  private static readonly TAGS_THAT_USE_ARROWS = [
    'input',
    'textarea',
    'select',
    'ion-input',
    'ion-textarea',
    'ion-searchbar',
    'ion-select',
    'ion-range',
    'ion-segment',
  ];

  /**
   * `true` se le frecce non devono navigare fra i POI: o perché si sta scrivendo o regolando un
   * controllo, o perché sopra il popup c'è un modale.
   *
   * Il caso del modale: aprendo una foto a schermo pieno `ModalImageComponent` si monta sopra, ma
   * gli handler del popup sottostante restano attivi. Premendo una freccia il POI cambiava sotto,
   * e il modale — che legge dallo stesso store con lo stesso `gallery_index` — passava a
   * un'immagine di un altro POI o restava vuoto se il nuovo ne aveva meno. Prima di oc:8406 non
   * succedeva perché `next()`/`prev()` erano metodi vuoti in `map.page.ts` (oc:8613).
   */
  private _isTypingOrAdjusting(event: KeyboardEvent): boolean {
    if (document.querySelector('ion-modal') != null) {
      return true;
    }
    const target = event?.target as HTMLElement | null;
    if (target == null) {
      return false;
    }
    if (target.isContentEditable === true) {
      return true;
    }
    const tag = target.tagName?.toLowerCase();
    return PoiPopupComponent.TAGS_THAT_USE_ARROWS.includes(tag);
  }

  /**
   * Naviga al POI correlato indicato dal selettore passato, con la stessa semantica di
   * `WmRelatedPoisNavigatorComponent.poiNext()`/`poiPrev()`: la logica di "quale è il prossimo"
   * vive nel selettore, quindi qui viene riusata e non riscritta — evitando sia la duplicazione
   * sia un `@ViewChild` su un componente di libreria.
   *
   * Il gate è `canNavigateRelatedPois`, **lo stesso selettore che usa il navigatore**: si sta
   * mostrando un POI correlato e ce n'è più di uno. Averne uno solo è il punto — due gate scritti
   * separatamente divergono, ed era già successo due volte: le frecce navigavano dove i pulsanti
   * erano nascosti, prima con l'indice negativo e poi con `ec_related_poi` rimasto nell'URL dopo
   * aver scelto un altro POI dalla mappa.
   */
  private _goToRelatedPoi(selector: MemoizedSelector<any, number | null>): void {
    this._store
      .select(canNavigateRelatedPois)
      .pipe(
        take(1),
        filter(canNavigate => canNavigate),
        switchMap(() => this._store.select(selector).pipe(take(1))),
      )
      .subscribe(id => {
        if (id != null) {
          this._urlHandlerSvc.updateURL({ec_related_poi: id});
        }
      });
  }

  @HostListener('document:keydown.Escape', ['$event'])
  handleEscape(event: KeyboardEvent): void {
    // Stessa guardia delle frecce: `Escape` dentro un campo di testo annulla l'input, non deve
    // chiudere il dettaglio — e sul ramo UGC chiuderlo mentre si compila il form butterebbe via
    // le modifiche.
    if (this._isTypingOrAdjusting(event)) {
      return;
    }
    this.closeEVT.emit();
  }

  openGeohub(): void {
    const id = this.poiProperties != null && this.poiProperties.id;
    if (id != null) {
      const url = `https://geohub.webmapp.it/resources/ec-pois/${id}/edit?viaResource&viaResourceId&viaRelationship`;
      window.open(url, '_blank').focus();
    }
  }

  updatePoi(): void {
    if (this.fg.valid) {
      const poi: WmFeature<Point> = {
        ...this.poi,
        properties: {
          ...this.poi?.properties,
          name: this.fg.value?.title,
          form: this.fg.value,
          updatedAt: new Date(),
        },
      };

      this._store.dispatch(updateUgcPoi({poi}));
      this._store.dispatch(stopDrawUgcPoi());
      this.isEditing$.next(false);
      this.poi = poi;
      this._refreshProperties(poi);
      this._cdr.detectChanges();
    }
  }
}
