> Ticket: oc:8406

# Dettaglio EcPoi unificato in wm-webapp — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Far consumare a `poi-popup` il componente condiviso `<wm-poi-properties>` per i POI EC, mantenendo il ramo UGC invariato, così che il gap di `wm-config-detail` (oc:8181) sia chiuso anche sul web.

**Architecture:** `poi-popup` diventa un contenitore che conserva il proprio chrome (titolo, chiusura, navigazione POI correlati, "edit geohub", scorciatoie da tastiera) e instrada il corpo: `poiProperties.uuid` presente → ramo UGC col markup attuale; assente → `<wm-poi-properties>` di wm-core. Il componente condiviso è store-only (nessun `@Input`), quindi il contenitore non gli passa dati. Gli stili di posizionamento che il condiviso dichiara globalmente vengono neutralizzati da un override locale a specificità maggiore, come già fa il consumer mobile.

**Tech Stack:** Angular 20, Ionic 8, NgRx, Karma + Jasmine, Node 22 (via nvm).

**Spec:** `docs/features/8406-unificare-componenti-dettaglio-ecpoi/overview.md`

## Global Constraints

- **Solo POI EC.** Il ramo UGC del popup resta invariato: `isEditing$`, `wm-form`, save/cancel/edit/delete, `wm-ugc-medias`, e i tre dispatch `startDrawUgcPoi`/`stopDrawUgcPoi` a `poi-popup.component.ts:108`, `:113`, `:177`.
- **Scritture su `src/app/shared/wm-core` limitate a quattro file** (autorizzazione del dev, branch condiviso `feature/oc-8406-unificare-componenti-dettaglio-ecpoi`, agente su webmapp-app avvisato e senza obiezioni): `related-urls/related-urls.component.ts`, `feature-useful-urls/feature-useful-urls.component.html`, `tab-description/tab-description.component.ts`, `store/features/ec/ec.selector.ts`. Tutto il resto di wm-core, **wm-types** e **map-core** restano invariati — le altre correzioni sono follow-up (F1, F3, F5, F6, F7).
- **`wm-core` ha due checkout indipendenti** sullo stesso branch: il mio (`wm-webapp/src/app/shared/wm-core`) e quello dell'agente mobile (`webmapp-app/core/src/app/shared/wm-core`). I working tree non si vedono tra loro; il coordinamento serve su **push e pull**, non sui file locali. Prima di pushare wm-core, fare `git pull --rebase` e avvisare l'altro agente.
- **I 288 spec di wm-core vanno eseguiti prima e dopo** le modifiche: `cd src/app/shared/wm-core && nvm use 22 && CI=true npx ng test wm-core --configuration=ci`. Se un fix fa cadere uno spec, **non indebolire il test**: segnalarlo all'agente mobile — in fase A due casi analoghi si sono rivelati test che avevano ragione.
- **Nessun commit e nessun branch automatico.** Gli step "Commit" sono istruzioni testuali per il developer. Il branch `feature/oc-8406-unificare-componenti-dettaglio-ecpoi` esiste già.
- **Commit convention:** `feat(oc:8406): …`, `fix(oc:8406): …`, `refactor(oc:8406): …`.
- **Conservare la classe `.webmapp-poi-popup-title`**: `cypress/e2e/url-with-parameters.cy.ts:21,39` vi asserisce (test skippato oggi, riattivato da oc:8022).
- **Comandi di test:** `nvm use 22 && CHROME_HEADLESS=1 npx ng test --configuration=ci --watch=false`
- **Dev server:** già attivo su `http://localhost:4300` in watch mode (la 4200 è occupata da un altro progetto). Non riavviarlo.
- **`environment.ts`** è temporaneamente su `appId: 29` + `shardName: 'geohub'` per il QA. Backup dell'originale (`appId: 1` + `camminiditalia`) in `/private/tmp/claude-501/-Users-rubensgarofalo-Sites-Webmapp-wm-webapp/49aec1b0-9e78-4cc2-aab0-059044d9ea51/scratchpad/environment.ts.orig`.

---

### Task 1: Infrastruttura di test e spec di instradamento (rosso)

Primo spec in `src/app/components/`: la registrazione va fatta in **due** file (vedi `CLAUDE.md` → "Aggiungere nuovi spec file"). Questo task viene per primo di proposito: se la doppia registrazione non funziona, si scopre subito e non a lavoro finito.

**Files:**
- Create: `src/app/components/poi-popup/poi-popup.component.spec.ts`
- Modify: `angular.json` (`projects.app.architect.test.options.include`)
- Modify: `tsconfig.spec.json` (`include`)

**Interfaces:**
- Consumes: `PoiPopupComponent` da `./poi-popup.component`.
- Produces: `PoiPropertiesStubComponent` (selector `wm-poi-properties`) e `WmTransStubPipe` (name `wmtrans`), riusati dal Task 2 per l'assert sul ramo EC.

- [ ] **Step 1: Registra la directory in `angular.json`**

In `projects.app.architect.test.options.include`, aggiungi la terza voce:

```json
"include": [
  "src/app/app.component.spec.ts",
  "src/app/classes",
  "src/app/components"
]
```

- [ ] **Step 2: Registra il glob in `tsconfig.spec.json`**

Nella sezione `include`, aggiungi la voce prima di `src/**/*.d.ts`:

```json
"include": [
  "src/app/app.component.spec.ts",
  "src/app/classes/**/*.spec.ts",
  "src/app/components/**/*.spec.ts",
  "src/**/*.d.ts"
]
```

- [ ] **Step 3: Scrivi lo spec che fallisce**

Nota sul perché `CUSTOM_ELEMENTS_SCHEMA` e non `NO_ERRORS_SCHEMA`: è il pattern già usato da `src/app/app.component.spec.ts`, ignora gli elementi con dash nel nome (`ion-*`, `wm-*`, `webmapp-*`) senza disattivare la verifica sui componenti **dichiarati**. `PoiPropertiesStubComponent` è dichiarato, quindi Angular lo istanzia davvero e `By.directive(...)` trova l'istanza: l'assert non è soddisfacibile in modo vacuo. Non importiamo `WmCoreModule`, così evitiamo l'`NG0201` su `APP_TRANSLATION` documentato nel `CLAUDE.md` di wm-core.

```typescript
import {Component, CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {AlertController} from '@ionic/angular';
import {provideMockStore} from '@ngrx/store/testing';
import {LangService} from '@wm-core/localization/lang.service';
import {UrlHandlerService} from '@wm-core/services/url-handler.service';

import {PoiPopupComponent} from './poi-popup.component';

@Component({standalone: false, selector: 'wm-poi-properties', template: ''})
class PoiPropertiesStubComponent {}

@Component({standalone: false, selector: 'wm-ugc-medias', template: ''})
class UgcMediasStubComponent {}

@Pipe({standalone: false, name: 'wmtrans'})
class WmTransStubPipe implements PipeTransform {
  transform(value: unknown): unknown {
    return value;
  }
}

@Pipe({standalone: false, name: 'toArray'})
class ToArrayStubPipe implements PipeTransform {
  transform(value: string): string[] {
    return value ? [value] : [];
  }
}

const EC_POI = {
  type: 'Feature',
  geometry: {type: 'Point', coordinates: [10, 43]},
  properties: {id: 42535, name: 'Rifugio Telegrafo'},
};

const UGC_POI = {
  type: 'Feature',
  geometry: {type: 'Point', coordinates: [10, 43]},
  properties: {uuid: 'abc-123', name: 'Segnalazione'},
};

describe('PoiPopupComponent — instradamento EC/UGC', () => {
  let fixture: ComponentFixture<PoiPopupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: [
        PoiPopupComponent,
        PoiPropertiesStubComponent,
        UgcMediasStubComponent,
        WmTransStubPipe,
        ToArrayStubPipe,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        provideMockStore({initialState: {conf: {}, ec: {}, ugc: {}}}),
        {provide: AlertController, useValue: {create: () => Promise.resolve({present: () => {}})}},
        {provide: LangService, useValue: {instant: (k: string) => k}},
        {provide: UrlHandlerService, useValue: {updateURL: () => {}}},
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PoiPopupComponent);
  }));

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('monta wm-poi-properties per un POI EC', () => {
    fixture.componentInstance.setPoi = EC_POI;
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.directive(PoiPropertiesStubComponent)))
      .withContext('il ramo EC deve montare wm-poi-properties')
      .not.toBeNull();
  });

  it('non monta wm-poi-properties per un POI UGC', () => {
    fixture.componentInstance.setPoi = UGC_POI;
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.directive(PoiPropertiesStubComponent)))
      .withContext('il ramo UGC non deve montare il componente condiviso')
      .toBeNull();
  });

  it('monta wm-ugc-medias per un POI UGC', () => {
    fixture.componentInstance.setPoi = UGC_POI;
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.directive(UgcMediasStubComponent)))
      .withContext('il ramo UGC deve conservare wm-ugc-medias')
      .not.toBeNull();
  });
});
```

- [ ] **Step 4: Esegui i test e verifica che il primo fallisca**

Run: `nvm use 22 && CHROME_HEADLESS=1 npx ng test --configuration=ci --watch=false`

Expected: 3 spec eseguiti. `monta wm-poi-properties per un POI EC` **FALLISCE** ("il ramo EC deve montare wm-poi-properties" — il template non instrada ancora). Gli altri due passano già, perché oggi il template non monta mai `wm-poi-properties` e monta sempre `wm-ugc-medias`.

Se invece compare `missing from TypeScript compilation` o lo spec non viene raccolto, la doppia registrazione degli Step 1-2 non è allineata: rileggi `CLAUDE.md` → "Perché due posti".

- [ ] **Step 5: Commit**

```bash
git add src/app/components/poi-popup/poi-popup.component.spec.ts angular.json tsconfig.spec.json
git commit -m "test(oc:8406): spec di instradamento EC/UGC per poi-popup"
```

---

### Task 2: Ramo EC nel template (verde)

> ⚠️ L'implementazione ha deviato da questo task: [notes.md](notes.md#task-2--chrome-del-popup)

**Files:**
- Modify: `src/app/components/poi-popup/poi-popup.component.html` (intero file)
- Test: `src/app/components/poi-popup/poi-popup.component.spec.ts` (già scritto nel Task 1)

**Interfaces:**
- Consumes: `PoiPropertiesStubComponent` dal Task 1.
- Produces: nel template esistono il ramo `#ecBody` (che monta `<wm-poi-properties>`) e il ramo UGC; `poi-popup.component.ts` continua a esporre `poiProperties`, `isEditing$`, `enableEditingInline$`, `confPOIFORMS$`, `fg`, `closeEVT`, `openGeohub()`, `editUgcPoi()`, `cancelEditUgcPoi()`, `deleteUgcPoi()`, `updatePoi()`.

**Decisione di scope da conoscere prima di scrivere:** la `.row.category` del chrome viene mostrata **solo** nel ramo UGC. Sul ramo EC la categoria arriva dal corpo condiviso tramite `wm-poi-types-badges`, quindi tenerla anche nel chrome la mostrerebbe due volte. È anche il comportamento mobile: il suo header porta il solo nome, i badge stanno nel corpo.

- [ ] **Step 1: Sostituisci il contenuto di `poi-popup.component.html`**

```html
<ng-container *ngIf="poiProperties!= null">
  <ng-container *ngIf="isEditing$|async; else viewData">
    <wm-form
      [confPOIFORMS]="confPOIFORMS$|async"
      [init]="poi?.properties?.form"
      (formGroupEvt)="fg = $event"
    ></wm-form>
    <div class="edit-container">
      <ion-button
        [disabled]="!fg.dirty || !fg.valid"
        (click)="updatePoi()"
        >{{"save" | wmtrans}}</ion-button
      >
      <ion-button (click)="cancelEditUgcPoi()">{{"cancel" | wmtrans}}</ion-button>
    </div>
  </ng-container>

  <ng-template #viewData>
    <div class="row">
      <button class="webmapp-poi-popup-close" (click)="closeEVT.emit()">
        <i class="icon-outline-close"></i>
      </button>
    </div>
    <ng-container *ngIf="poiProperties?.uuid">
      <ng-container
        *ngIf="poiProperties.taxonomy && poiProperties.taxonomy.poi_types as poiTypes;else poiType"
        ><ng-container *ngFor="let poiType of poiTypes">
          <div class="row category" *ngIf="poiType" [innerHTML]="poiType.name|wmtrans"></div>
        </ng-container>
      </ng-container>
      <ng-template #poiType>
        <div
          class="row category"
          *ngIf="poiProperties.taxonomy && poiProperties.taxonomy.poi_type as poiType"
          [innerHTML]="poiType.name|wmtrans"
        ></div>
      </ng-template>
    </ng-container>
    <div class="title">
      <p class="webmapp-poi-popup-title">{{poiProperties.name|wmtrans}}</p>
    </div>
    <wm-related-pois-navigator></wm-related-pois-navigator>
    <ion-content>
      <ng-container *ngIf="poiProperties?.uuid; else ecBody">
        <div class="row">
          <wm-inner-component-html
            [enableDismiss]="false"
            class="wm-excerpt"
            *ngIf="poiProperties?.excerpt as excerpt"
            [html]="excerpt|wmtrans"
          >
          </wm-inner-component-html>
        </div>
        <wm-ugc-medias [showArrows]="true"></wm-ugc-medias>
        <wm-txn-where
          *ngIf="poiProperties?.taxonomy_where as txnWhere"
          [taxonomyWheres]="txnWhere"
        ></wm-txn-where>
        <div class="webmapp-poi-popup-btns">
          <div class="webmapp-poi-popup-btn" *ngIf="poiProperties.address">
            <i class="wm-icn icon-fill-pin"></i>
            <a [href]="ugcMapsHref" target="_blank">
              {{poiProperties.address}}
            </a>
          </div>
          <ng-container *ngIf="poiProperties.contact_phone|toArray as arrayOfPhones">
            <div
              class="webmapp-poi-popup-btn webmapp-poi-popup-phone"
              *ngFor="let cphone of arrayOfPhones"
            >
              <i class="wm-icn icon-fill-phone"></i>
              <p>
                <a href="tel:{{cphone}}">
                  {{cphone}}
                </a>
              </p>
            </div>
          </ng-container>
          <div
            class="webmapp-poi-popup-btn webmapp-poi-popup-mail"
            *ngIf="poiProperties.contact_email"
          >
            <i class="wm-icn icon-fill-mail"></i>
            <a [href]="'mailto:' + poiProperties.contact_email">
              {{poiProperties.contact_email}}
            </a>
          </div>
          <div
            class="webmapp-poi-popup-btn webmapp-poi-popup-urls"
            *ngIf="hasRelatedUrls"
          >
            <i class="wm-icn icon-fill-globe"></i>
            <webmapp-related-urls [relatedUrls]="poiProperties.related_url"></webmapp-related-urls>
          </div>
        </div>
        <ng-container *ngIf="poiProperties?.audio">
          <div class="webmapp-title">{{'Descrizione Audio'|wmtrans}}</div>
          <webmapp-track-audio [audio]="poiProperties?.audio"></webmapp-track-audio>
        </ng-container>
        <div *ngIf="poiProperties?.form">
          <wm-form
            class="readonly-form"
            [disabled]="true"
            [confPOIFORMS]="confPOIFORMS$|async"
            [init]="poi?.properties?.form"
          ></wm-form>
        </div>
        <div class="edit-container">
          <ion-button class="edit" (click)="editUgcPoi()"> {{"edit" |wmtrans}}</ion-button>
          <ion-button color="danger" (click)="deleteUgcPoi()"> {{"delete" | wmtrans}}</ion-button>
        </div>
      </ng-container>

      <ng-template #ecBody>
        <wm-poi-properties></wm-poi-properties>
        <div class="edit-container">
          <ion-button class="edit" *ngIf="enableEditingInline$|async" (click)="openGeohub()">
            {{"edit geohub" | wmtrans}}</ion-button
          >
        </div>
      </ng-template>
    </ion-content>
  </ng-template>
</ng-container>
```

Cosa è cambiato rispetto a prima, punto per punto:
- Il `TODO` di riga 1 è rimosso: chiuso per il caso EC.
- La categoria (`.row.category` e il `#poiType` di fallback) è ora dentro `*ngIf="poiProperties?.uuid"`, cioè solo UGC.
- I due pulsanti `.webmapp-poi-popup-left`/`right` con `prevEVT`/`nextEVT` sono sostituiti da `<wm-related-pois-navigator>`.
- L'`<ion-content>` si divide: ramo UGC (markup precedente) e `#ecBody` (`<wm-poi-properties>` + "edit geohub").
- Il link Maps del ramo UGC usa `ugcMapsHref` invece dell'interpolazione inline: elimina il bug della graffa in eccesso (`{{...}}}` produceva `daddr=…}&navigate=yes`). Il getter arriva nel Task 3.
- Il blocco `related_url` usa `hasRelatedUrls` invece di `related_url != null`: sostituisce il cleanup che spariva. Il getter arriva nel Task 3.
- `poiProperties.ele`, `osm_url` e la descrizione `webmapp-poi-popup-text` sono rimossi dal ramo EC (li rende il condiviso via `wm-tab-detail`, il link OSM e `wm-tab-description`). Nel ramo UGC non c'erano dati per `ele`/`osm_url` e la descrizione UGC passa da `wm-form` readonly, quindi non vengono reintrodotti.
- `webmapp-track-audio` resta **solo** nel ramo UGC; sul ramo EC l'audio lo rende `wm-track-audio` dentro il condiviso.

- [ ] **Step 2: Esegui i test e verifica che passino**

Run: `nvm use 22 && CHROME_HEADLESS=1 npx ng test --configuration=ci --watch=false`

Expected: PASS su tutti e 3 gli spec del Task 1. Se `monta wm-ugc-medias per un POI UGC` fallisce, `wm-ugc-medias` è finito per errore nel ramo `#ecBody`.

- [ ] **Step 3: Verifica che il dev server compili**

Il server è in watch mode. Controlla il log:

```bash
tail -5 /private/tmp/claude-501/-Users-rubensgarofalo-Sites-Webmapp-wm-webapp/49aec1b0-9e78-4cc2-aab0-059044d9ea51/scratchpad/ng-serve.log
```

Expected: `✔ Compiled successfully.` A questo punto ci si aspettano **errori di compilazione** su `ugcMapsHref` e `hasRelatedUrls`, che non esistono ancora: è normale, li introduce il Task 3. Se preferisci un albero sempre verde, esegui il Task 3 prima di questo step.

- [ ] **Step 4: Commit**

```bash
git add src/app/components/poi-popup/poi-popup.component.html
git commit -m "feat(oc:8406): instrada i POI EC su wm-poi-properties nel popup"
```

---

### Task 3: Pulizia del componente e scorciatoie da tastiera

**Files:**
- Modify: `src/app/components/poi-popup/poi-popup.component.ts`

**Interfaces:**
- Consumes: `nextRelatedPoiId`, `prevRelatedPoiId` da `@wm-core/store/features/ec/ec.selector`; `UrlHandlerService` da `@wm-core/services/url-handler.service`.
- Produces: getter `ugcMapsHref: string` e `hasRelatedUrls: boolean` (usati dal template del Task 2); `handleArrowLeft()`/`handleArrowRight()` navigano tra i POI correlati; `prevEVT`/`nextEVT` **rimossi** dagli `@Output`.

**Perché il dispatch diretto e non un `@ViewChild`:** `WmRelatedPoisNavigatorComponent.poiNext()` legge il selettore `nextRelatedPoiId$` e chiama `UrlHandlerService.updateURL({ec_related_poi: id})`. La logica di "quale è il prossimo POI" vive nel **selettore**, non nel componente. Il contenitore consuma lo stesso selettore: non duplica logica, la riusa — ed evita un `@ViewChild` da wm-webapp su un componente di libreria.

⚠️ **Ma serve una guardia, altrimenti questo task introduce un crash.** `nextRelatedPoiId` e `prevRelatedPoiId` (`ec.selector.ts:267,278`) fanno `relatedPois.findIndex(...)` **senza controllare null**, mentre `currentEcRelatedPois` restituisce `?? null` (riga 190) e i selettori vicini (`currentEcRelatedPoi` riga 197, `currentRelatedPoiIndex` riga 253) hanno invece la guardia `if (relatedPois != null)`.

Oggi non esplode perché i pulsanti del navigator sono dentro un doppio `*ngIf` su `currentRelatedPoisCount` e non si renderizzano quando non ci sono POI correlati. Le scorciatoie sono invece `@HostListener('document:keydown…')`, quindi **globali**: premere ArrowLeft su un POI aperto direttamente (`?poi=<id>`, senza track in stato — il caso normale: `related` è `false` su tutti e 3.721 i POI dell'app 29) leggerebbe un selettore che lancia `TypeError`. La guardia passa da `currentRelatedPoisCount`, che è null-safe (`?? 0`). Questo è anche il motivo per cui il follow-up F8 esiste.

- [ ] **Step 1: Rimuovi la normalizzazione dell'indirizzo e il codice morto**

Nel setter `@Input('poi') set setPoi(poi: any)`, elimina i tre blocchi `try/catch` su `prop.address`, `prop.address_link` e il blocco `if (poi.properties.related_url != null) { … }`, insieme alla variabile `prop` e a `enableGallery$`. Il setter diventa:

```typescript
  @Input('poi') public set setPoi(poi: any) {
    if (poi != null && poi.properties != null) {
      this.poi = poi;
      this.poiProperties = {...poi.properties};
    }
  }
```

Elimina inoltre queste proprietà, che non hanno alcuna occorrenza nel template (verificato: zero match):

```typescript
  public defaultPhotoPath = '/assets/icon/no-photo.svg';   // rimuovi
  enableGallery$: BehaviorSubject<boolean> = ...            // rimuovi
  isEnd$: Observable<boolean>;                              // rimuovi
  medias$: Observable<Media[]>;                             // rimuovi
  public slideOptions = { ... };                            // rimuovi (10 righe)
  @ViewChild('gallery') public slider: any;                 // rimuovi
```

E i due `@Output` sostituiti dal navigator:

```typescript
  @Output() public nextEVT: EventEmitter<void> = new EventEmitter<void>();  // rimuovi
  @Output() public prevEVT: EventEmitter<void> = new EventEmitter<void>();  // rimuovi
```

Aggiorna gli import di conseguenza: togli `ViewChild` da `@angular/core`, `Media` da `@wm-types/feature`, e `Observable` se non più usato (resta usato da `confPOIFORMS$` e `currentUgcPoiDrawnGeometry$`, quindi va tenuto).

- [ ] **Step 2: Aggiungi i due getter usati dal template**

```typescript
  /**
   * Link Google Maps per il ramo UGC. Sostituisce l'interpolazione inline che aveva una graffa
   * di chiusura in eccesso (`{{...}}}`), la quale finiva letteralmente nell'URL come
   * `daddr=…}&navigate=yes`. Per i POI EC il link lo produce `wm-address` in wm-core.
   */
  get ugcMapsHref(): string {
    const destination = this.poiProperties?.address ?? '';
    return `https://www.google.com/maps?daddr=${encodeURIComponent(destination)}&navigate=yes`;
  }

  /**
   * `true` solo se `related_url` porta almeno un link utilizzabile. Sostituisce la
   * normalizzazione che il setter faceva prima (cancellava la chiave `''` e forzava `null`
   * sull'oggetto vuoto) **mutando un oggetto dello store**: qui la stessa decisione è presa in
   * lettura, senza toccare lo stato.
   *
   * Il campo arriva dal backend in tre forme diverse — misurate sull'app 29: 752 POI con un
   * oggetto `{label: url}`, 76 con una **stringa** (URL nudo, es. POI 41608), 3 con un array.
   * `Object.entries` su una stringa produrrebbe coppie indice/carattere e restituirebbe `true`
   * per caso, quindi le tre forme sono distinte esplicitamente.
   */
  get hasRelatedUrls(): boolean {
    const urls = this.poiProperties?.related_url;
    if (urls == null) {
      return false;
    }
    if (typeof urls === 'string') {
      return urls.trim() !== '';
    }
    if (Array.isArray(urls)) {
      return urls.some(url => !!url);
    }
    return Object.entries(urls).some(([label, url]) => !!label && !!url);
  }
```

- [ ] **Step 3: Ricollega le scorciatoie da tastiera al navigator**

Sostituisci `handleArrowLeft()` e `handleArrowRight()` con queste, e aggiungi `UrlHandlerService` al costruttore:

```typescript
  @HostListener('document:keydown.ArrowLeft')
  handleArrowLeft(): void {
    this._goToRelatedPoi(prevRelatedPoiId);
  }

  @HostListener('document:keydown.ArrowRight')
  handleArrowRight(): void {
    this._goToRelatedPoi(nextRelatedPoiId);
  }

  /**
   * Naviga al POI correlato indicato dal selettore passato, con la stessa semantica di
   * `WmRelatedPoisNavigatorComponent.poiNext()`/`poiPrev()`: la logica di "quale è il prossimo"
   * vive nel selettore, quindi qui viene riusata e non riscritta.
   *
   * Il gate su `currentRelatedPoisCount` non è ridondante: `nextRelatedPoiId`/`prevRelatedPoiId`
   * chiamano `findIndex` su `currentEcRelatedPois`, che può essere `null`, e non hanno guardia
   * (`ec.selector.ts:267,278` — vedi follow-up F8). Senza questo gate, una freccia premuta su un
   * POI aperto senza track in stato lancerebbe `TypeError`. `currentRelatedPoisCount` è
   * null-safe (`?? 0`), quindi è sicuro leggerlo per primo.
   */
  private _goToRelatedPoi(selector: MemoizedSelector<object, number | null>): void {
    this._store
      .select(currentRelatedPoisCount)
      .pipe(
        take(1),
        filter(count => count > 1),
        switchMap(() => this._store.select(selector).pipe(take(1))),
      )
      .subscribe(id => {
        if (id != null) {
          this._urlHandlerSvc.updateURL({ec_related_poi: id});
        }
      });
  }
```

Import da aggiungere:

```typescript
import {MemoizedSelector} from '@ngrx/store';
import {
  currentRelatedPoisCount,
  nextRelatedPoiId,
  prevRelatedPoiId,
} from '@wm-core/store/features/ec/ec.selector';
import {UrlHandlerService} from '@wm-core/services/url-handler.service';
import {filter, switchMap, take} from 'rxjs/operators';
```

`switchMap` e `take` sono già importati da `rxjs/operators` nel file; aggiungi solo `filter`. Se il tipo `MemoizedSelector<object, number | null>` non combacia con quello inferito dai due selettori, usa `Selector<object, number | null>` oppure lascia il parametro come `any` con un commento — l'obiettivo del tipo è solo impedire di passare per errore un selettore che non restituisce un id.

E nel costruttore:

```typescript
  constructor(
    private _store: Store,
    private _alertCtrl: AlertController,
    private _langSvc: LangService,
    private _cdr: ChangeDetectorRef,
    private _urlHandlerSvc: UrlHandlerService,
  ) {}
```

`take` è già importato da `rxjs/operators` (usato in `deleteUgcPoi`).

- [ ] **Step 4: Esegui i test**

Run: `nvm use 22 && CHROME_HEADLESS=1 npx ng test --configuration=ci --watch=false`

Expected: PASS su tutti e 3 gli spec. Lo spec fornisce già `UrlHandlerService` come provider mock, quindi il costruttore allargato non lo rompe.

- [ ] **Step 5: Verifica la compilazione**

```bash
tail -5 /private/tmp/claude-501/-Users-rubensgarofalo-Sites-Webmapp-wm-webapp/49aec1b0-9e78-4cc2-aab0-059044d9ea51/scratchpad/ng-serve.log
```

Expected: `✔ Compiled successfully.`, senza errori su `ugcMapsHref`/`hasRelatedUrls`.

- [ ] **Step 6: Commit**

```bash
git add src/app/components/poi-popup/poi-popup.component.ts
git commit -m "refactor(oc:8406): rimuovi normalizzazione indirizzo e codice morto da poi-popup"
```

---

### Task 4: Override degli stili e verifica ai breakpoint

**Files:**
- Modify: `src/app/components/poi-popup/poi-popup.component.scss`

**Interfaces:**
- Consumes: le classi rimaste nel template dopo il Task 2.
- Produces: nessuna interfaccia TS.

**Il problema:** `poi-properties.component.scss:1-10` (wm-core, `ViewEncapsulation.None`, quindi **globale**) dichiara su `wm-poi-properties`: `position: absolute; bottom: 0; height: 100%; width: 100%; z-index: 2; background: white; border-radius: 15px`. Dentro `webmapp-poi-popup`, che è già `position: absolute` e quindi containing block valido, il figlio si stenderebbe su tutta l'area del popup a `z-index: 2`, coprendo titolo e navigatore. Il consumer mobile fa già la stessa neutralizzazione in `map-details.component.scss:127-129`.

- [ ] **Step 1: Aggiungi l'override in fondo al blocco `webmapp-poi-popup`**

Inserisci prima della chiusura del selettore `webmapp-poi-popup` (dopo il blocco `wm-txn-where`):

```scss
  // Neutralizza il posizionamento che wm-core dichiara globalmente su wm-poi-properties
  // (poi-properties.component.scss:1-10, ViewEncapsulation.None): quelle regole descrivono il
  // pannello mobile a tutta area, non un corpo dentro un popup. Stesso approccio del consumer
  // mobile (webmapp-app map-details.component.scss:127-129), che neutralizza `position`.
  // Specificità (0,0,2) contro (0,0,1) del selettore di libreria: vince a prescindere
  // dall'ordine di caricamento.
  wm-poi-properties {
    position: relative;
    bottom: auto;
    width: auto;
    height: auto;
    z-index: auto;
    background: transparent;
    border-radius: 0;

    // Il popup è flex column: il corpo deve poter crescere e scrollare per conto proprio
    // invece di ereditare l'altezza piena.
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
  }
```

`background: transparent` è deliberato: il popup ha già `background-color: white` (riga 3) e il valore hardcoded in libreria ignorerebbe comunque il theming `--wm-color-*`.

- [ ] **Step 2: Rimuovi le regole per il markup eliminato**

Elimina i blocchi che non hanno più un elemento corrispondente nel template:

```scss
  .title { ... .webmapp-poi-popup-left, .webmapp-poi-popup-right { ... } }  // conserva .title, rimuovi i due figli
  .circle { ... }                                                           // rimuovi: era solo dei pulsanti prev/next
  .webmapp-poi-popup-text { ... }                                           // rimuovi: descrizione ora nel condiviso
```

In `.webmapp-poi-popup-close, .webmapp-poi-popup-left, .webmapp-poi-popup-right { … }` togli i due selettori `left`/`right`, lasciando solo `.webmapp-poi-popup-close`.

Conserva invariati: `.wm-excerpt`, `.row`, `.category`, `.webmapp-poi-popup-title`, `.readonly-form`, `.webmapp-poi-popup-btns` e figli, `.webmapp-poi-popup-phone`, `.webmapp-poi-popup-mail`, `.webmapp-poi-popup-urls`, `.edit-container`, `wm-txn-where` — tutti ancora usati dal ramo UGC o dal chrome.

- [ ] **Step 3: Verifica visiva ai quattro breakpoint**

Il popup è `width: 20%`, quindi la sua larghezza dipende dal viewport. Verifica che non ci sia scroll orizzontale e che titolo e navigatore restino visibili sopra il corpo:

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
SP=/private/tmp/claude-501/-Users-rubensgarofalo-Sites-Webmapp-wm-webapp/49aec1b0-9e78-4cc2-aab0-059044d9ea51/scratchpad
for w in 1024 1280 1920 2560; do
  "$CHROME" --headless=new --disable-gpu --no-sandbox --window-size=$w,900 \
    --virtual-time-budget=25000 --screenshot="$SP/poi-42535-$w.png" \
    "http://localhost:4300/?poi=42535" 2>/dev/null
done
ls -la $SP/poi-42535-*.png
```

Poi **guarda le immagini** (leggile una per una). Cosa cercare, in ordine: (1) il titolo "Rifugio Telegrafo Gaetano Barana" è visibile e non coperto; (2) nessuna barra di scroll orizzontale nel popup; (3) le righe di `wm-tab-detail` (label a sinistra, valore a destra) non si sovrappongono — a 1024px il popup è ~205px, più stretto di qualsiasi telefono, ed è il caso peggiore.

Se le righe label+valore non tengono a 205px, impilale **nel contesto webapp** senza toccare il componente condiviso:

```scss
  wm-tab-detail ion-item {
    --inner-padding-start: 0;
    flex-direction: column;
    align-items: flex-start;
  }
```

- [ ] **Step 4: Commit**

```bash
git add src/app/components/poi-popup/poi-popup.component.scss
git commit -m "fix(oc:8406): neutralizza il posizionamento di wm-poi-properties nel popup"
```

---

### Task 5: Rimozione degli handler vuoti da MapPage

**Files:**
- Modify: `src/app/pages/map/map.page.ts` (righe 65 e 81)
- Modify: `src/app/pages/map/map.page.html` (righe 54-60)

**Interfaces:**
- Consumes: `PoiPopupComponent` senza più `prevEVT`/`nextEVT` (Task 3).
- Produces: nessuna.

- [ ] **Step 1: Elimina i due metodi vuoti**

In `map.page.ts` rimuovi:

```typescript
  next(): void {}    // riga 65
  prev(): void {}    // riga 81
```

Erano corpi vuoti: i pulsanti del popup vi erano collegati e non facevano nulla. La navigazione ora la fa `wm-related-pois-navigator` via `UrlHandlerService`.

- [ ] **Step 2: Aggiorna il binding nel template**

In `map.page.html`, il blocco del popup diventa:

```html
<webmapp-poi-popup
  *ngIf="poi$|async as poi"
  [poi]="poi"
  (closeEVT)="unselectPOI()"
></webmapp-poi-popup>
```

- [ ] **Step 3: Verifica compilazione e test**

Run: `nvm use 22 && CHROME_HEADLESS=1 npx ng test --configuration=ci --watch=false`

Expected: PASS. Poi controlla il log del dev server: `✔ Compiled successfully.` Se compare un errore su `next`/`prev` non esiste, è rimasto un binding nel template.

- [ ] **Step 4: Commit**

```bash
git add src/app/pages/map/map.page.ts src/app/pages/map/map.page.html
git commit -m "fix(oc:8406): rimuovi gli handler vuoti next()/prev() da MapPage"
```

---

### Task 6: Ripristino della configurazione e bump dei pin

**Files:**
- Modify: `src/environments/environment.ts`
- Modify: gitlink `src/app/shared/wm-core`, `src/app/shared/wm-types`, `src/app/shared/map-core`

**Interfaces:** nessuna.

⚠️ **Esegui questo task solo dopo che il developer ha completato il test manuale**, che richiede `appId: 29` + `shardName: 'geohub'`. Ripristinare prima gli toglie l'ambiente da sotto i piedi.

- [ ] **Step 1: Ripristina `environment.ts`**

```bash
cd /Users/rubensgarofalo/Sites/Webmapp/wm-webapp
cp /private/tmp/claude-501/-Users-rubensgarofalo-Sites-Webmapp-wm-webapp/49aec1b0-9e78-4cc2-aab0-059044d9ea51/scratchpad/environment.ts.orig src/environments/environment.ts
git diff src/environments/environment.ts
```

Expected: `git diff` **vuoto**. I valori corretti per questo branch sono `appId: 1` e `shardName: 'camminiditalia'` — non quelli di `main` (`appId: 52` + `geohub`).

- [ ] **Step 2: Verifica lo stato dei submodule**

```bash
git submodule status
```

Expected: `wm-core` su `5190949`, `wm-types` su `b97e400`, `map-core` su `7b12c599`, tutti con il prefisso `+` (checkout diverso dal gitlink registrato).

- [ ] **Step 3: Bump dei pin**

```bash
git add src/app/shared/wm-core src/app/shared/wm-types src/app/shared/map-core
git status --short
```

Expected: le tre voci passano da ` M` a `M `.

⚠️ Il bump di `wm-core` non è granulare: tra il gitlink precedente e `5190949` entrano anche `oc:8458` (apertura multipla di `wm-config-detail`) e `oc:8414` (filtri iOS/Safari), non collegati a questo ticket. Non esiste un bump che isoli la sola fase C. Vale la pena scriverlo nel messaggio di commit.

- [ ] **Step 4: Commit**

```bash
git commit -m "chore(oc:8406): bump pin submodule e ripristina environment di sviluppo

Il pin di wm-core include anche oc:8458 e oc:8414, non collegati a questo
ticket: il bump non è isolabile alla sola fase C."
```

---

### Task 7 (wm-core): baseline degli spec e guardia dei selettori (F8)

> ⚠️ L'implementazione ha deviato da questo task: [notes.md](notes.md#task-7-10--scope-allargato-a-wm-core)

Da qui in poi si lavora in `src/app/shared/wm-core`. Primo passo: sapere da dove si parte, così un
fallimento successivo è attribuibile.

**Files:**
- Modify: `src/app/shared/wm-core/projects/wm-core/src/store/features/ec/ec.selector.ts:267-288`

- [ ] **Step 1: Baseline degli spec di wm-core**

```bash
cd /Users/rubensgarofalo/Sites/Webmapp/wm-webapp/src/app/shared/wm-core
nvm use 22 && CI=true npx ng test wm-core --configuration=ci 2>&1 | tail -15
```

Expected: 288 spec verdi. Annota il numero esatto: serve per confrontare dopo.

- [ ] **Step 2: Aggiungi la guardia mancante ai due selettori**

`nextRelatedPoiId` e `prevRelatedPoiId` chiamano `findIndex` su `currentEcRelatedPois`, che
restituisce `?? null` (riga 190), senza controllarlo — mentre `currentEcRelatedPoi` (riga 197) e
`currentRelatedPoiIndex` (riga 253) hanno la guardia. Allineali ai loro vicini:

```typescript
export const nextRelatedPoiId = createSelector(
  currentEcRelatedPois,
  currentEcRelatedPoiId,
  (relatedPois, relatedPoiId) => {
    if (relatedPois == null) {
      return null;
    }
    const index = relatedPois.findIndex(
      (p: WmFeature<Point>) => +p?.properties?.id === +relatedPoiId,
    );
    return relatedPois[index + 1]?.properties?.id ?? null;
  },
);

export const prevRelatedPoiId = createSelector(
  currentEcRelatedPois,
  currentEcRelatedPoiId,
  (relatedPois, relatedPoiId) => {
    if (relatedPois == null) {
      return null;
    }
    const index = relatedPois.findIndex(
      (p: WmFeature<Point>) => +p?.properties?.id === +relatedPoiId,
    );
    return relatedPois[index - 1]?.properties?.id ?? null;
  },
);
```

- [ ] **Step 3: Esegui gli spec di wm-core**

Expected: stesso numero di verdi dello Step 1. La modifica è additiva su un percorso che prima
lanciava.

- [ ] **Step 4: Semplifica il gate nel contenitore**

Ora che i selettori sono null-safe, il gate su `currentRelatedPoisCount` in
`poi-popup.component.ts` (Task 3) non serve più come protezione da eccezione. Resta comunque utile
come guardia semantica ("naviga solo se ci sono almeno due POI correlati"), quindi **tienilo**, ma
aggiorna il commento: non è più difensivo verso un selettore che lancia, è una condizione di
dominio.

- [ ] **Step 5: Commit (nel submodule)**

```bash
cd /Users/rubensgarofalo/Sites/Webmapp/wm-webapp/src/app/shared/wm-core
git add projects/wm-core/src/store/features/ec/ec.selector.ts
git commit -m "fix(oc:8406): guardia null su nextRelatedPoiId e prevRelatedPoiId"
```

---

### Task 8 (wm-core): "Link utili" non compare vuoto (F4)

**Files:**
- Modify: `src/app/shared/wm-core/projects/wm-core/src/feature-useful-urls/feature-useful-urls.component.html:1`
- Modify: `src/app/shared/wm-core/projects/wm-core/src/poi-properties/poi-properties.component.ts` (`showUsefulUrls$`)

⚠️ **Il caso reale è `[]`, non `{}`.** Misurato su `db_prod`: `related_url = '{}'` esiste su **0**
POI e **0** track; `'[]'` su **2.572** POI e **2.796** track; e **100** POI hanno una chiave `""`
che produrrebbe una voce con etichetta vuota. Una guardia scritta contro l'oggetto vuoto non
coprirebbe nulla.

- [ ] **Step 1: Rendi il titolo condizionale**

`feature-useful-urls.component.html` riga 1 è `<div class="webmapp-title">{{'Link utili'|wmtrans}}</div>`
senza `*ngIf`, quindi compare anche quando la lista sotto è vuota. Il componente riceve contenuto
per content projection (`<ng-content>`) oltre a `osm`/`track`, quindi non può decidere da sé se ha
righe: la condizione va sul consumer. Lascia il titolo dov'è e agisci sullo Step 2 — modificare
questo file serve solo se, dopo lo Step 2, resta un caso in cui il componente è montato senza
righe. Verificalo prima:

```bash
cd /Users/rubensgarofalo/Sites/Webmapp/wm-webapp/src/app/shared/wm-core
grep -rn "wm-feature-useful-urls" --include="*.html" projects/wm-core/src/
```

Expected: due consumer, `poi-properties.component.html:63` e `track-properties.component.html:71`.
Il secondo lo monta dentro `*ngIf="confOPTIONS.download_track_enable === true"` e gli passa
`[track]`, quindi ha sempre almeno le righe di download: non va toccato.

- [ ] **Step 2: Rendi `showUsefulUrls$` sensibile al contenuto, non alla presenza**

In `poi-properties.component.ts`, dentro il `tap` di `currentPoiProperties$`, sostituisci:

```typescript
      this.showUsefulUrls$.next(!!properties?.related_url);
```

con:

```typescript
      this.showUsefulUrls$.next(hasUsableRelatedUrls(properties?.related_url));
```

e aggiungi la funzione pura in fondo al file, fuori dalla classe:

```typescript
/**
 * `true` solo se `related_url` porta almeno un link mostrabile.
 *
 * `!!related_url` non basta: il backend invia `[]` su 2.572 POI e 2.796 EcTrack (misurato su
 * db_prod), e `![]` è `false`, quindi il blocco "Link utili" compariva col solo titolo e nessuna
 * riga. L'oggetto vuoto `{}` invece non esiste nei dati (0 record), quindi non è quello il caso da
 * coprire.
 *
 * Il campo arriva in tre forme, conseguenza deterministica di `EcPoi::getJson()`
 * (`geohub/app/Models/EcPoi.php:282`), che rimuove il campo solo se `!is_array && empty`: `false` e
 * `""` sparaiscono dal payload, una stringa non vuota sopravvive. Da qui i 76 POI dell'app 29 con
 * `related_url` stringa. Le 100 chiavi vuote vengono scartate perché produrrebbero una voce con
 * etichetta vuota.
 */
export function hasUsableRelatedUrls(relatedUrl: unknown): boolean {
  if (relatedUrl == null) {
    return false;
  }
  if (typeof relatedUrl === 'string') {
    return relatedUrl.trim() !== '';
  }
  if (Array.isArray(relatedUrl)) {
    return relatedUrl.some(url => typeof url === 'string' && url.trim() !== '');
  }
  if (typeof relatedUrl === 'object') {
    return Object.entries(relatedUrl as Record<string, unknown>).some(
      ([label, url]) => label.trim() !== '' && typeof url === 'string' && url.trim() !== '',
    );
  }
  return false;
}
```

- [ ] **Step 3: Scrivi lo spec della funzione pura**

Create: `src/app/shared/wm-core/projects/wm-core/src/poi-properties/has-usable-related-urls.spec.ts`

```typescript
import {hasUsableRelatedUrls} from './poi-properties.component';

describe('hasUsableRelatedUrls', () => {
  it('è false per null e undefined', () => {
    expect(hasUsableRelatedUrls(null)).toBe(false);
    expect(hasUsableRelatedUrls(undefined)).toBe(false);
  });

  it('è false per array vuoto — il caso più frequente nei dati (2.572 POI)', () => {
    expect(hasUsableRelatedUrls([])).toBe(false);
  });

  it('è false per oggetto vuoto', () => {
    expect(hasUsableRelatedUrls({})).toBe(false);
  });

  it('è false per un oggetto con la sola chiave vuota (100 POI nei dati)', () => {
    expect(hasUsableRelatedUrls({'': 'https://example.org'})).toBe(false);
  });

  it('è false per stringa vuota o di soli spazi', () => {
    expect(hasUsableRelatedUrls('')).toBe(false);
    expect(hasUsableRelatedUrls('   ')).toBe(false);
  });

  it('è true per una stringa URL — 76 POI sull app 29', () => {
    expect(hasUsableRelatedUrls('http://www.turismosanbenedettopo.it/')).toBe(true);
  });

  it('è true per un oggetto con etichetta e url validi', () => {
    expect(hasUsableRelatedUrls({'Comune di Pizzighettone': 'https://www.comune.pizzighettone.cr.it/it'}))
      .toBe(true);
  });

  it('è true per un array con almeno un url', () => {
    expect(hasUsableRelatedUrls(['https://example.org'])).toBe(true);
  });

  it('è false per un booleano — il backend lo rimuove, ma non fidarsi', () => {
    expect(hasUsableRelatedUrls(false)).toBe(false);
  });
});
```

- [ ] **Step 4: Esegui gli spec di wm-core**

Expected: baseline + 9 nuovi spec, tutti verdi.

- [ ] **Step 5: Commit (nel submodule)**

```bash
git add projects/wm-core/src/poi-properties/poi-properties.component.ts \
        projects/wm-core/src/poi-properties/has-usable-related-urls.spec.ts
git commit -m "fix(oc:8406): non mostrare Link utili quando related_url non ha link usabili"
```

---

### Task 9 (wm-core): `wm-tab-description` — timer e stato di troncamento (F2)

**Files:**
- Modify: `src/app/shared/wm-core/projects/wm-core/src/tab-description/tab-description.component.ts`

Questo task copre il requisito 14 dell'overview. Due difetti indipendenti, il secondo visibile
**anche sul mobile** navigando tra POI correlati.

- [ ] **Step 1: Aggiungi `OnDestroy` e rendi il timer cancellabile**

Cambia la dichiarazione di classe e aggiungi il campo:

```typescript
export class WmTabDescriptionComponent implements AfterViewInit, OnDestroy {
  private _truncationCheckInterval: ReturnType<typeof setInterval> | null = null;
```

Sostituisci `_checkIfContentIsTruncated()`:

```typescript
  /**
   * L'interval si azzerava solo quando `scrollHeight > 0`: se il componente veniva distrutto
   * prima della misura (nel popup web è dentro un `*ngIf` con una transizione da 500ms), restava
   * un timer a 20 Hz che chiama `getComputedStyle` — un reflow forzato — per ogni istanza mai
   * misurata. Su mobile l'app si riavvia; una webapp su tablet/kiosk non ricarica mai la pagina.
   */
  private _checkIfContentIsTruncated() {
    this._clearTruncationCheck();
    this._truncationCheckInterval = setInterval(() => {
      const element = this.descriptionElement?.nativeElement;
      const scrollHeight = element?.scrollHeight;
      if (scrollHeight && scrollHeight > 0) {
        this._clearTruncationCheck();
        const lineHeight = parseInt(window.getComputedStyle(element).lineHeight);
        const maxHeight = lineHeight * MAX_LINES;

        this.showExpandButton$.next(scrollHeight > maxHeight);
      }
    }, 50);
  }

  private _clearTruncationCheck(): void {
    if (this._truncationCheckInterval != null) {
      clearInterval(this._truncationCheckInterval);
      this._truncationCheckInterval = null;
    }
  }

  ngOnDestroy(): void {
    this._clearTruncationCheck();
  }
```

Aggiungi `OnDestroy` all'import da `@angular/core`.

- [ ] **Step 2: Resetta lo stato di troncamento al cambio descrizione**

L'istanza non viene distrutta quando cambia il POI (cambia solo il valore di `[description]`),
quindi `showExpandButton$` e `isExpanded$` conservavano lo stato del POI precedente: "Mostra altro"
su una descrizione da una riga, o nessun "Mostra altro" su una lunga.

In fondo al setter `description`, dopo il ramo `if/else if/else` che chiama `htmlDescription$.next(...)`,
aggiungi:

```typescript
    // Il POI successivo eredita altrimenti lo stato del precedente: l'istanza è riusata, non
    // ricreata, quando cambia solo il binding. La rimisura parte dal prossimo ciclo di view.
    this.isExpanded$.next(false);
    this.showExpandButton$.next(false);
    this._checkIfContentIsTruncated();
```

Nota: `_checkIfContentIsTruncated()` è sicuro da chiamare dal setter anche prima di
`ngAfterViewInit`, perché legge `this.descriptionElement?.nativeElement` con optional chaining e
riprova ogni 50ms finché l'elemento non esiste; e ora si auto-cancella prima di riarmarsi, quindi
non si accumulano timer al cambio POI.

- [ ] **Step 3: Esegui gli spec di wm-core**

Expected: baseline verde. Se uno spec di `tab-description` o dei suoi consumer cade, **non
indebolirlo**: leggilo e verifica se asseriva il comportamento vecchio a ragione. Segnala
all'agente mobile.

- [ ] **Step 4: Commit (nel submodule)**

```bash
git add projects/wm-core/src/tab-description/tab-description.component.ts
git commit -m "fix(oc:8406): cancella il timer di troncamento e resetta lo stato al cambio descrizione"
```

---

### Task 10 (wm-core): `wm-related-urls` — link reali e tre forme del campo (F9 + fix http→https)

**Files:**
- Modify: `src/app/shared/wm-core/projects/wm-core/src/related-urls/related-urls.component.ts`

Due difetti nello stesso componente:
1. `href="#"` + `(click)="url(...)"` + `window.open()`, e `url.replace(/^https?:\/\//, '')` con
   riprefisso `https://` → impossibile aprire in nuova scheda o copiare l'indirizzo, e **ogni URL
   `http://` viene forzato a https**. Impatto misurato: **1.013 POI** e **1.127 EcTrack**.
2. `relatedUrls|keyvalue` assume un oggetto, ma il campo arriva anche come **stringa** (76 POI
   sull'app 29, conseguenza di `EcPoi.php:282`) e come array: su una stringa `keyvalue` itera i
   **caratteri**.

- [ ] **Step 1: Riscrivi il componente**

```typescript
/* eslint-disable @angular-eslint/template/eqeqeq */
import {Component, ChangeDetectionStrategy, Input} from '@angular/core';

/** Una voce pronta per il rendering: etichetta visibile e URL di destinazione. */
interface RelatedUrlEntry {
  label: string;
  url: string;
}

@Component({
  standalone: false,
  selector: 'wm-related-urls',
  template: `
    <ion-list *ngIf="entries.length > 0">
      <ion-item
        *ngFor="let entry of entries"
        [href]="entry.url"
        target="_blank"
        rel="noopener noreferrer"
      >
        <i class="icon-outline-globe" slot="start"></i>
        <ion-label>{{entry.label}}</ion-label>
      </ion-item>
    </ion-list>
  `,
  styles: [`
    ion-list {
      padding: 0;
      ion-item {
        i{
          color: var(--wm-color-icon, var(--ion-color-primary));
        }
        ion-label {
          font-weight: 600;
          color: var(wm-feature-details-description-color), var(--wm-color-dark);
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WmRelatedUrlsComponent {
  entries: RelatedUrlEntry[] = [];

  /**
   * Il campo arriva dal backend in tre forme, conseguenza di `EcPoi::getJson()`
   * (`geohub/app/Models/EcPoi.php:282`), che lo rimuove solo se `!is_array && empty`: oggetto
   * `{label: url}` (752 POI sull'app 29), **stringa** con un URL nudo (76 POI), array (3).
   * Il precedente `relatedUrls|keyvalue` in template assumeva sempre l'oggetto: su una stringa
   * iterava i singoli caratteri.
   */
  @Input('relatedUrls') set relatedUrls(value: unknown) {
    this.entries = normalizeRelatedUrls(value);
  }
}

/**
 * Normalizza `related_url` in voci mostrabili. Scarta URL vuoti e voci con etichetta vuota (100
 * POI nei dati hanno una chiave `""`), e per stringa/array usa l'URL stesso come etichetta.
 *
 * Nessun `replace` sullo schema: la versione precedente rimuoveva `http://` o `https://` e
 * riprefissava sempre `https://`, rompendo i link dei siti che non supportano TLS — 1.013 POI e
 * 1.127 EcTrack hanno almeno un URL `http://` puro.
 */
export function normalizeRelatedUrls(value: unknown): RelatedUrlEntry[] {
  if (value == null) {
    return [];
  }
  if (typeof value === 'string') {
    const url = value.trim();
    return url === '' ? [] : [{label: url, url}];
  }
  if (Array.isArray(value)) {
    return value
      .filter((url): url is string => typeof url === 'string' && url.trim() !== '')
      .map(url => ({label: url.trim(), url: url.trim()}));
  }
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .filter(
        ([label, url]) =>
          label.trim() !== '' && typeof url === 'string' && url.trim() !== '',
      )
      .map(([label, url]) => ({label: label.trim(), url: (url as string).trim()}));
  }
  return [];
}
```

- [ ] **Step 2: Scrivi lo spec**

Create: `src/app/shared/wm-core/projects/wm-core/src/related-urls/normalize-related-urls.spec.ts`

```typescript
import {normalizeRelatedUrls} from './related-urls.component';

describe('normalizeRelatedUrls', () => {
  it('preserva lo schema http:// senza forzare https', () => {
    const entries = normalizeRelatedUrls({'Pro Loco': 'http://www.prolococassanodadda.com/'});
    expect(entries).toEqual([
      {label: 'Pro Loco', url: 'http://www.prolococassanodadda.com/'},
    ]);
  });

  it('accetta una stringa nuda e la usa anche come etichetta', () => {
    expect(normalizeRelatedUrls('http://www.turismosanbenedettopo.it/')).toEqual([
      {label: 'http://www.turismosanbenedettopo.it/', url: 'http://www.turismosanbenedettopo.it/'},
    ]);
  });

  it('non itera i caratteri di una stringa', () => {
    expect(normalizeRelatedUrls('https://example.org').length).toBe(1);
  });

  it('accetta un array di url', () => {
    expect(normalizeRelatedUrls(['https://a.org', 'http://b.org']).length).toBe(2);
  });

  it('scarta array e oggetti vuoti', () => {
    expect(normalizeRelatedUrls([])).toEqual([]);
    expect(normalizeRelatedUrls({})).toEqual([]);
  });

  it('scarta le voci con etichetta vuota', () => {
    expect(normalizeRelatedUrls({'': 'https://example.org'})).toEqual([]);
  });

  it('scarta le voci con url vuoto', () => {
    expect(normalizeRelatedUrls({'Sito': '   '})).toEqual([]);
  });

  it('è vuoto per null, undefined e false', () => {
    expect(normalizeRelatedUrls(null)).toEqual([]);
    expect(normalizeRelatedUrls(undefined)).toEqual([]);
    expect(normalizeRelatedUrls(false)).toEqual([]);
  });

  it('conserva più voci di un oggetto', () => {
    const entries = normalizeRelatedUrls({
      'Comune di Pizzighettone': 'https://www.comune.pizzighettone.cr.it/it',
      'Pizzighettone (da Wikipedia)': 'https://it.wikipedia.org/wiki/Pizzighettone',
    });
    expect(entries.length).toBe(2);
  });
});
```

- [ ] **Step 3: Esegui gli spec di wm-core**

Expected: baseline + 9 nuovi. ⚠️ Questo è il task con più probabilità di far cadere uno spec
esistente: `wm-related-urls` è usato anche da `track-properties`. Se cade, leggi l'assert prima di
toccarlo.

- [ ] **Step 4: Verifica sul POI 53037, che ha un `related_url` in `http://` puro**

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless=new --disable-gpu --no-sandbox --virtual-time-budget=25000 \
  --dump-dom "http://localhost:4300/?poi=53037" 2>/dev/null | grep -o 'href="http://[^"]*prolococassano[^"]*"'
```

Expected: `href="http://www.prolococassanodadda.com/"` — schema preservato, e ora è un `href` reale
apribile in nuova scheda.

- [ ] **Step 5: Commit (nel submodule)**

```bash
git add projects/wm-core/src/related-urls/related-urls.component.ts \
        projects/wm-core/src/related-urls/normalize-related-urls.spec.ts
git commit -m "fix(oc:8406): link reali in wm-related-urls, preserva http e gestisce le tre forme del campo"
```

---

### Task 11: bump dei pin dopo i fix in wm-core

**Files:**
- Modify: gitlink `src/app/shared/wm-core`

- [ ] **Step 1: Coordina il push con l'agente mobile**

```bash
cd /Users/rubensgarofalo/Sites/Webmapp/wm-webapp/src/app/shared/wm-core
git pull --rebase origin feature/oc-8406-unificare-componenti-dettaglio-ecpoi
nvm use 22 && CI=true npx ng test wm-core --configuration=ci 2>&1 | tail -5
```

Il `pull --rebase` è necessario: l'altro agente ha un checkout indipendente dello stesso branch e
ha almeno un file in attesa di commit (`docs/features/8406-.../notes.md`). Avvisalo prima di
pushare.

- [ ] **Step 2: Push e bump del pin**

```bash
git push origin feature/oc-8406-unificare-componenti-dettaglio-ecpoi
cd /Users/rubensgarofalo/Sites/Webmapp/wm-webapp
git add src/app/shared/wm-core
git commit -m "chore(oc:8406): bump pin wm-core con i fix a related-urls, tab-description e selettori"
```

---

### Task 12 (ULTIMO): il ponte locale non serve più

Nella prima versione di questo piano il fix di `wm-related-urls` era fuori scope e questo task
prevedeva un ponte: mantenere `webmapp-related-urls` nel ramo EC e nascondere via CSS quello del
condiviso. Con l'autorizzazione a modificare wm-core, il fix è entrato nel **Task 10** e il ponte è
diventato inutile. Questo task ne verifica solo l'assenza.

**Files:** nessuno da modificare, se le verifiche passano.

- [ ] **Step 1: Verifica che nessun ponte sia stato introdotto**

```bash
cd /Users/rubensgarofalo/Sites/Webmapp/wm-webapp
grep -n "webmapp-related-urls" src/app/components/poi-popup/poi-popup.component.html
grep -n "wm-feature-useful-urls" src/app/components/poi-popup/poi-popup.component.scss
```

Expected: la prima restituisce **una sola** occorrenza, nel ramo UGC. La seconda **non restituisce
nulla**: se trova un `display: none`, è il ponte, e va rimosso ora che il fix c'è.

- [ ] **Step 2: Verifica che il componente locale sia ancora giustificato**

```bash
grep -rn "webmapp-related-urls\|RelatedUrlsComponent" src/app --include="*.html" --include="*.ts" | grep -v shared/
```

Expected: il ramo UGC del popup più la dichiarazione nel modulo. Il componente **resta nel repo**:
serve al ramo UGC, che questo ticket non tocca. Non rimuoverlo.

Nota: dopo il Task 10 i due componenti fanno cose equivalenti, quindi far usare al ramo UGC quello
di wm-core sarebbe una semplificazione — ma è fuori scope (il ramo UGC è invariato per decisione
del dev) e va con lo split UGC, follow-up F1.

- [ ] **Step 3: Nessun commit**

Se le verifiche passano non c'è nulla da committare. Se hai rimosso un ponte:

```bash
git add src/app/components/poi-popup/poi-popup.component.html src/app/components/poi-popup/poi-popup.component.scss
git commit -m "refactor(oc:8406): rimuovi il ponte locale, il fix wm-core lo rende inutile"
```

---

## Nota sui dati di `related_url`, da leggere prima dei Task 8 e 10

I due task che toccano questo campo si basano su misure fatte su `db_prod` e sul geojson servito
dell'app 29. Il punto che conta: **la forma vuota reale è `[]`, non `{}`.**

| Forma | ec_pois | ec_tracks | Dove si vede |
|---|---|---|---|
| `{}` oggetto vuoto | **0** | **0** | mai — una guardia scritta su questo non copre nulla |
| `[]` array vuoto | **2.572** | **2.796** | è il caso che produce il blocco "Link utili" vuoto |
| `false` | 4.153 | — | rimosso dal payload dal backend, non arriva al client |
| chiave `""` | **100** | — | produce una voce con etichetta vuota |
| stringa (URL nudo) | 76 sull'app 29 | — | `\|keyvalue` ne itera i **caratteri** |
| oggetto `{label: url}` | 752 sull'app 29 | — | il caso normale |
| almeno un `http://` puro | **1.013** | **1.127** | forzati a `https` dal `replace` |

Le tre forme sono una conseguenza deterministica del backend, non un incidente dei dati.
`geohub/app/Models/EcPoi.php:282`:

```php
if (array_key_exists('related_url', $array) && ! is_array($array['related_url']) && empty($array['related_url'])) {
    unset($array['related_url']);
}
```

Il campo viene rimosso solo se **non è array E è vuoto**: quindi `false` e `""` sparaiscono dal
payload, ma una stringa non vuota sopravvive e arriva al client come stringa. Qualunque app con POI
di quel tipo la riceve.

Sull'app 29 gli array sono 3 e **nessuno è vuoto**, quindi il caso `[]` non è osservabile in quel
QA pur essendo il più frequente sul db. Da tenere presente leggendo i risultati del test manuale.

---

## Verifica finale (prima della PR)

- [ ] `nvm use 22 && CHROME_HEADLESS=1 npx ng test --configuration=ci --watch=false` → tutti verdi
- [ ] `cd src/app/shared/wm-core && nvm use 22 && CI=true npx ng test wm-core --configuration=ci` → baseline (288) + 18 nuovi spec, tutti verdi
- [ ] `git -C src/app/shared/wm-core status --short` → working tree pulito e commit pushati
- [ ] `git -C src/app/shared/wm-types status --short` → **invariato**: wm-types non è stato toccato
- [ ] Log del dev server: `✔ Compiled successfully.`, nessun errore
- [ ] `git diff main --stat -- src/environments/environment.ts` non mostra modifiche non intenzionali
- [ ] `grep -rn "webmapp-poi-popup-title" src/app/components/poi-popup/` conferma che la classe esiste ancora (`cypress/e2e/url-with-parameters.cy.ts:21,39`)
- [ ] `grep -rn "startDrawUgcPoi\|stopDrawUgcPoi" src/app/components/poi-popup/poi-popup.component.ts` restituisce **3** occorrenze — il ridisegno geometria dei POI UGC è intatto
- [ ] `notes.md` compilato
- [ ] PR aperta verso **`develop`** (non `main`)

## Cosa il developer deve verificare a mano (dopo l'esecuzione)

Il test manuale è a carico del developer, dopo il completamento del piano. Ambiente già pronto: `appId: 29`, `shardName: 'geohub'`, `http://localhost:4300`.

| POI | Cosa guardare |
|---|---|
| 42535 | 3 telefoni, ciascuno con `tel:` valido. L'indirizzo `,,` **non** deve comparire. 8 immagini in galleria |
| 42533 | Indirizzo senza virgole ai bordi. 13 immagini. Descrizione lunga: "Mostra altro" presente e funzionante |
| 42417 | Due link con etichetta leggibile, non l'URL grezzo |
| 53037 | Link `http://` puro — vedi Task 7 |
| 97598 | Un solo telefono: le due etichette vuote non devono produrre righe |
| 12842 (o 16570 / 5314) | Ha `ele`: **è l'unico modo di vedere `wm-tab-detail`**, che sui 5 POI sopra non compare mai |
| un track con `related_pois` | **Unico modo di esercitare `wm-related-pois-navigator`**: i POI aperti diretti hanno `related: false` su tutti e 3.721 dell'app 29. Verificare anche `ArrowLeft`/`ArrowRight` |

**Limite noto:** `config_detail` è assente su tutti i POI dell'app 29, quindi `wm-config-detail` — il gap che ha originato il ticket — **non è verificabile con dati reali** su questo ambiente. La verifica resta strutturale.

**Da verificare in QA perché sospetto, non confermato:** il pulsante di `wm-get-directions` potrebbe non fare nulla se la geolocalizzazione del browser non è attiva (`startGetDirections$` usa `withLatestFrom` su `onLocationChange$`, un `ReplaySubject` senza valore iniziale). Il link indirizzo→Maps non si perde comunque, perché lo produce `wm-address`. Se confermato → follow-up F3.
