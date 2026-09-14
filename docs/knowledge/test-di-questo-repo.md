# I test di questa webapp

> L'isolamento del `TestBed` fra spec file è dominio della libreria:
> `src/app/shared/wm-core/docs/knowledge/testbed-isolamento.md`.

## Come funziona oggi

Girano solo gli spec di questo repo: quelli dei submodule sotto `src/app/shared/**` **non vengono
eseguiti da qui**, perché ogni submodule ha il proprio setup nel proprio repo.

Quali spec girino lo decide `angular.json` (`test.options.include`), non `tsconfig`.

## Perché così

- **`angular.json` è il punto di controllo della discovery** (oc:7989): Angular CLI ignora
  l'`exclude` del tsconfig per la scansione degli spec e usa il proprio scanner. Per decidere cosa
  gira si passa da `include` in `angular.json`.
- **`src/app/shared/` è il confine** che esclude i submodule: un submodule montato fuori da quel
  percorso sfuggirebbe all'esclusione e i suoi spec verrebbero eseguiti da qui.
- **Il `MockStore` di `AppComponent` vuole `initialState: { conf: {} }`** (oc:7989): il componente
  si iscrive a `confTHEMEVariables$` nel costruttore, che legge `state.conf.THEME`. Senza initial
  state il mock restituisce `undefined` per `state.conf` e si ottiene un `TypeError` in `afterAll`,
  cioè lontano dal punto che lo causa.

## La trappola della doppia registrazione

Un nuovo spec fuori da `src/app/shared/` va registrato **in due posti**, `tsconfig.spec.json` e
`angular.json`: sta in [.claude/rules/test-e-spec.md](../../.claude/rules/test-e-spec.md).
