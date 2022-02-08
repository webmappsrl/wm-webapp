import { Component, Input, OnInit } from '@angular/core';
import { CardData } from 'src/app/classes/cardata';

@Component({
  selector: 'webmapp-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {

  @Input('data') data: CardData;

  constructor() { }

  ngOnInit() {}

}
