> Ticket: oc:8169

# Esperienze utente — piano webapp (allineamento)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Nessun commit automatico.** Le righe «Commit» sono istruzioni per il dev.

**Goal:** webapp con il wm-core delle esperienze (e quindi il Passaporto), varianti camminiditalia attive, pronta per la prova del dev.

**Architecture:** solo puntatori dei submodule e `fileReplacements`; nessun codice nuovo.

**Tech Stack:** Angular 20, submodule Git.

**Spec:** `docs/features/8169-esperienze-utente-cammino-foto-descrizione/overview.md`

## Global Constraints

- Dipende dal piano frontend di wm-core: si parte quando il branch `feature/oc-8169-esperienze-utente-cammino-foto-descrizione` di wm-core ha il codice.
- wm-types almeno a `cc301d2`.
- Le sostituzioni delle pagine dell'app (`profile`, `map`, `tabs`) non si copiano.
- Se si toccano `scripts/lib/run.js` o `scripts/serve.js`, allinearli agli omonimi dell'app.

## Review Focus

- Build con le varianti mancanti che passa lo stesso: verificare la variante nel bundle (Task 2).
- Utente non loggato sul cammino: nessun errore in console da `/api/passport` o `/api/experiences` (Task 3).
- Foto scelte da file sul browser: arrivano al backend e si vedono nel dettaglio (Task 3).

---

### Task 1: Submodule

- [ ] **Step 1:** `git -C src/app/shared/wm-core fetch && git -C src/app/shared/wm-core checkout feature/oc-8169-esperienze-utente-cammino-foto-descrizione`.
- [ ] **Step 2:** `git -C src/app/shared/wm-types fetch && git -C src/app/shared/wm-types checkout cc301d2` (o `develop` se più avanti); map-core aggiornato solo se la build lo richiede.
- [ ] **Step 3:** `npm run build` — se fallisce per import mancanti, annotare l'errore in `notes.md` e risolverlo con il bump del submodule che lo fornisce, non con codice nella webapp.

### Task 2: `fileReplacements` camminiditalia

**Files:** Modify: `angular.json:94-105` — aggiungere, copiati da `webmapp-app/core/angular.json:127-134` con i percorsi `src/app/shared/wm-core/...`:
- `box/layer-box/layer-box.component.ts` → `layer-box.component.camminiditalia.ts`
- `box/search-box/search-box.component.ts` → `search-box.component.camminiditalia.ts`
- `track-properties/track-properties.component.ts` → `track-properties.component.camminiditalia.ts` (esperienze della tappa)
- `ugc-track-properties/ugc-track-properties.component.ts` → `ugc-track-properties.component.camminiditalia.ts` (esperienze collegate)

- [ ] **Step 1:** voci aggiunte.
- [ ] **Step 2:** avvio con lo shard camminiditalia; `curl -s http://localhost:<porta>/main.js | grep -c wm-passport-logo-ring` > 0 e `grep -c "showExperiences = true"` = 2 (le due varianti con le esperienze accese; 0 nella build di default).
- [ ] **Step 3: Commit** `chore(oc:8169): wm-core con esperienze e passaporto nella webapp`

### Task 3: Prova del dev

- [ ] **Step 1:** consegnare al dev l'URL locale e l'elenco: cammino (sezione «Le tue esperienze»), tappa, creazione con foto da file, modifica, eliminazione, non loggato → login, badge e modale del Passaporto.
- [ ] **Step 2:** registrare l'esito in `notes.md`.
- [ ] **Step 3 (dopo il merge di wm-core):** puntatore di wm-core su `develop`; **Commit** `chore(oc:8169): wm-core su develop`.
