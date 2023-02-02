import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';

import {BaseBoxComponent} from '../abstract/box';

@Component({
  selector: 'webmapp-box',
  templateUrl: './box.component.html',
  styleUrls: ['./box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BoxComponent extends BaseBoxComponent<IHOMEBASEITEM> {}
