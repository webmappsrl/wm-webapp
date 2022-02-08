import { Component, OnInit } from '@angular/core';
import { CardData } from 'src/app/classes/cardata';

@Component({
  selector: 'webmapp-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {


  public cards: CardData[] = [
    {
      name: 'Percorsi',
      img: 'https://picsum.photos/300/200',
      description: 'I percorsi dell\'app'
    },
    {
      name: 'Itinerari',
      img: 'https://picsum.photos/300/201',
      description: 'Gli itinerari dell\'app'
    },
    {
      name: 'Viaggi',
      img: 'https://picsum.photos/301/200',
      description: 'I viaggi dell\'app'
    },
    {
      name: 'Idee',
      img: 'https://picsum.photos/301/201',
      description: 'Le idee dell\'app'
    }
  ];


  public isBackAvailable: boolean = false;
  public showSearch: boolean = true;
  public title: string;
  public searchString: string;

  constructor() { }

  ngOnInit() { }

  goBack() {
    console.log('------- ~ HomeComponent ~ goBack ~ goBack');

  }

  searchBarChanged() {
    console.log('------- ~ HomeComponent ~ searchBarChanged ~ searchBarChanged');

  }

  searchBarCleared() {
    console.log('------- ~ HomeComponent ~ searchBarCleared ~ searchBarCleared');
  }

}
