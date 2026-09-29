# Tema e colori

Come il colore dell'istanza arriva ai componenti, e perché l'ordine degli import conta.

## Come funziona oggi

Il tema di ogni istanza vive in due famiglie di variabili CSS:

- **`--wm-color-*`** — le nostre, calcolate da `wm-core` e applicate qui a runtime su `:root` da
  `AppComponent._setGlobalCSS()` come stile inline. Come vengano calcolate e da dove arrivino è
  dominio del submodule.
- **`--ion-color-*`** — quelle di Ionic, lette dai suoi componenti (bottoni, `ion-item`, icone che
  usano `var(--wm-color-icon, var(--ion-color-primary))`).

Le seconde **derivano** dalle prime, dichiarate in `src/theme/variables.scss`:

```scss
--ion-color-primary: var(--wm-color-primary);
```

Perché quella derivazione regga, `variables.scss` è importato **due volte**: come primo entry di
`styles` in `angular.json`, e di nuovo **in fondo a `src/global.scss`**, dopo il core di Ionic.

Il secondo import sembra ridondante e non lo è: `@ionic/angular/css/core.css` dichiara le proprie
`--ion-color-*` su `:root` con la stessa specificità, quindi senza una dichiarazione successiva
vince lui e il primary dell'istanza non raggiunge i componenti Ionic.

Le variabili non sono però l'unica personalizzazione per istanza: alcune app hanno anche un foglio
di stile proprio, con selettori veri, iniettato a runtime — sta in
[css-custom-per-istanza.md](css-custom-per-istanza.md).

## Perché così

- **La derivazione sta nel foglio di stile, non nel codice** (oc:8406): `_setGlobalCSS` applica
  solo le `--wm-*`. Aggiungere lì anche le `--ion-*` funzionerebbe — sarebbero stili inline, che
  battono qualunque foglio — ma spargerebbe la definizione del tema fra due posti. L'ordine di
  import risolve lo stesso problema lasciando il tema in un file solo.

- **Il re-import in fondo a `global.scss`, non l'inversione dell'ordine in `angular.json`**
  (oc:8406): invertire i due entry (`global.scss` prima di `variables.scss`) otterrebbe lo stesso
  effetto sul primary, ma cambierebbe la cascata per ogni altro override del repo. Il re-import
  tocca solo ciò che serve.

- **Stessa soluzione di `webmapp-app`** (oc:8406): l'app ri-importa `variables.scss` in fondo al
  proprio `global.scss` da prima. Era l'unica differenza fra i due prodotti su questo punto, ed è
  il motivo per cui il difetto si vedeva solo sulla webapp.

## Come ci siamo arrivati

- **Nessun re-import di `variables.scss`** (oc:8406, superata): il file era caricato solo come
  entry di `angular.json`. Il sintomo era un tema a due colori, difficile da attribuire: le parti
  che leggono `--wm-color-*` seguivano il brand — la label della località nel dettaglio POI — e
  quelle che passano da Ionic restavano sul blu di default, cioè icone dei contatti, link utili e
  bottoni. Su un'istanza con primary blu non si notava nulla, e per questo è rimasto a lungo.
