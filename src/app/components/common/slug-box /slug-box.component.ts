import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';

import {BaseBoxComponent} from '../abstract/box';

@Component({
  selector: 'webmapp-slug-box',
  templateUrl: './slug-box.component.html',
  styleUrls: ['./slug-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class SlugBoxComponent extends BaseBoxComponent<ISLUGBOX> {}
