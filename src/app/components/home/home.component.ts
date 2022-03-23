import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {Observable, of} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {CardData} from 'src/app/classes/cardata';
import {SearchResult} from 'src/app/classes/searchresult';
import {GeohubService} from 'src/app/services/geohub.service';
import {IElasticRootState} from 'src/app/store/elastic/elastic.reducer';
import {elasticHits} from 'src/app/store/elastic/elastic.selector';

@Component({
  selector: 'webmapp-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  @Output('searchId') searchIdEvent: EventEmitter<number> = new EventEmitter<number>();

  public cards: CardData[] = [
    {
      name: 'Percorsi',
      img: 'https://picsum.photos/300/200',
      description: "I percorsi dell'app",
      searchString: 'percorsi',
    },
    {
      name: 'Itinerari',
      img: 'https://picsum.photos/300/200',
      description: "Gli itinerari dell'app",
      searchString: 'itinerari',
    },
    {
      name: 'Viaggi',
      img: 'https://picsum.photos/300/200',
      description: "I viaggi dell'app",
      searchString: 'viaggi',
    },
    {
      name: 'Idee',
      img: 'https://picsum.photos/300/200',
      description: "Le idee dell'app",
      searchString: 'idee',
    },
  ];
  cards$: Observable<SearchResult[]> = of([]);
  elasticHits$: Observable<IHIT[]> = this._store.select(elasticHits);

  public isBackAvailable: boolean = false;
  public showSearch: boolean = true;
  public title: string;
  public searchString: string;
  public searchresults: SearchResult[];

  constructor(
    private _geoHubService: GeohubService,
    private _store: Store<IElasticRootState>,
    private _router: Router,
    private _route: ActivatedRoute,
  ) {
    this.elasticHits$.subscribe(sad => console.log(sad));
    this.cards$ = this.elasticHits$.pipe(
      map(hits => {
        const cards: SearchResult[] = [];
        hits.forEach(hit => {
          cards.push({
            name: hit.name,
            img: hit.feature_image,
            description: '',
            km: +hit.distance,
            id: hit.id,
          });
        });
        return cards;
      }),
      startWith([]),
    );
  }

  ngOnInit() {}

  goBack() {
    console.log('------- ~ HomeComponent ~ goBack ~ goBack');
  }

  async searchBarChanged() {
    if (this.searchString) {
      this.searchresults = await this._geoHubService.search(this.searchString);
    } else {
      this.searchBarCleared();
    }
  }

  searchBarCleared() {
    this.searchresults = [];
  }

  select(result: SearchResult) {
    this.searchIdEvent.emit(result.id);
  }

  searchCard(card: CardData) {
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: {track: card.id ? card.id : null},
      queryParamsHandling: 'merge',
    });
  }
}
