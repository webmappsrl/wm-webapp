import { Component, Input, OnInit } from '@angular/core';
import { SearchResult } from 'src/app/classes/searchresult';

@Component({
  selector: 'webmapp-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss'],
})
export class ResultComponent implements OnInit {

  @Input('data') data: SearchResult;

  constructor() { }

  ngOnInit() { }

}
