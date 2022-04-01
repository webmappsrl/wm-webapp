import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {BaseBoxComponent} from '../abstract/box';

@Component({
  selector: 'webmapp-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class SearchBoxComponent extends BaseBoxComponent<IHIT> {}
