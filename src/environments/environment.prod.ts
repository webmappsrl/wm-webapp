import {Environment} from '@wm-types/environment';

export const environment: Environment = {
  production: true,
  appId: 3,
  shardName: 'geohub',
  shards: {
    geohub: {
      origin: 'https://geohub.webmapp.it',
      elasticApi: 'https://elastic-json.webmapp.it/v2/search',
      graphhopperHost: 'https://graphhopper.webmapp.it/',
      awsApi: 'https://wmfe.s3.eu-central-1.amazonaws.com/geohub',
    },
    osm2cai: {
      origin: 'https://osm2cai.webmapp.it',
      elasticApi: 'https://elastic-json.webmapp.it/v2/search',
      graphhopperHost: 'https://graphhopper.webmapp.it/',
      awsApi: 'https://wmfe.s3.eu-central-1.amazonaws.com/geohub',
    },
    camminiditalia: {
      origin: 'https://camminiditalia.maphub.it',
      elasticApi: 'https://camminiditalia.maphub.it/api/v2/elasticsearch',
      graphhopperHost: 'https://graphhopper.webmapp.it/',
      awsApi: 'https://wmfe.s3.eu-central-1.amazonaws.com/camminiditalia',
    },
    carg: {
      origin: 'https://carg.webmapp.it',
      elasticApi: 'https://elastic-json.webmapp.it/v2/search',
      graphhopperHost: 'https://graphhopper.webmapp.it/',
      awsApi: 'https://wmfe.s3.eu-central-1.amazonaws.com/geohub',
    },
  },
  redirects: {
    'sentieri.caiparma.it': {
      shardName: 'geohub',
      appId: 33,
    },
    'motomappa.motoabbigliamento.it': {
      shardName: 'geohub',
      appId: 53,
    },
    'maps.parcoforestecasentinesi.it': {
      shardName: 'geohub',
      appId: 49,
    },
    'maps.parcopan.org': {
      shardName: 'geohub',
      appId: 63,
    },
    'maps.acquasorgente.cai.it': {
      shardName: 'geohub',
      appId: 58,
    },
    'maps.caipontedera.it': {
      shardName: 'geohub',
      appId: 59,
    },
    'maps.parcapuane.it': {
      shardName: 'geohub',
      appId: 62,
    },
    'fiemaps.it': {
      shardName: 'geohub',
      appId: 29,
    },
    'fiemaps.eu': {
      shardName: 'geohub',
      appId: 29,
    },
    'maps.sentierodeiducati.it': {
      shardName: 'geohub',
      appId: 60,
    },
  },
};
