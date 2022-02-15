import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CardData } from 'src/app/classes/cardata';
import { SearchResult } from 'src/app/classes/searchresult';
import { GeohubService } from 'src/app/services/geohub.service';

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
      description: 'I percorsi dell\'app',
      searchString: 'percorsi'
    },
    {
      name: 'Itinerari',
      img: 'https://picsum.photos/300/200',
      description: 'Gli itinerari dell\'app',
      searchString: 'itinerari'
    },
    {
      name: 'Viaggi',
      img: 'https://picsum.photos/300/200',
      description: 'I viaggi dell\'app',
      searchString: 'viaggi'
    },
    {
      name: 'Idee',
      img: 'https://picsum.photos/300/200',
      description: 'Le idee dell\'app',
      searchString: 'idee'
    }
  ];


  public isBackAvailable: boolean = false;
  public showSearch: boolean = true;
  public title: string;
  public searchString: string;
  public searchresults: SearchResult[];

  constructor(
    private _geoHubService: GeohubService) { }

  ngOnInit() { }

  goBack() {
    console.log('------- ~ HomeComponent ~ goBack ~ goBack');
  }

  async searchBarChanged() {
    if (this.searchString) {
      this.searchresults = await this._geoHubService.search(this.searchString);
    }
    else { this.searchBarCleared(); }
  }

  searchBarCleared() {
    this.searchresults = [];
  }

  select(result: SearchResult) {
    this.searchIdEvent.emit(result.id);
  }

  searchCard(card: CardData) {
    this.searchString = card.searchString;
  }

}
