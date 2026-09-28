/**
 * L'URL dell'editor di backend per una feature.
 *
 * Sta in una funzione perché era scritto due volte, con la stessa stringa: nel popup dei POI e in
 * `map.page.ts` per le tracce. Due copie della stessa cosa divergono alla prima modifica, e
 * nessuno strumento lo segnala (oc:8613).
 *
 * **L'host è fisso**, e vale la pena dirlo perché il commento accanto al pulsante lasciava intendere
 * il contrario: l'etichetta è generica — «Modifica», non «modifica geohub» — perché il nome del
 * backend non deve finire a schermo, ma l'editor è sempre `geohub.webmapp.it`, anche per gli shard
 * che hanno un dominio proprio. Il giorno in cui un'istanza avrà il suo, il parametro va aggiunto
 * qui, in un posto solo.
 */
export function geohubEditUrl(resource: 'ec-pois' | 'ec-tracks', id: number | string): string {
  return `https://geohub.webmapp.it/resources/${resource}/${id}/edit?viaResource&viaResourceId&viaRelationship`;
}
