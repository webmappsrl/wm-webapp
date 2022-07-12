import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';

import {DomSanitizer} from '@angular/platform-browser';
import {ModalController} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {confPROJECT} from 'src/app/store/conf/conf.selector';

@Component({
  selector: 'webmapp-project-page',
  templateUrl: './project.page.component.html',
  styleUrls: ['./project.page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class InnerHtmlComponent {
  html$ = this._store.select(confPROJECT);

  constructor(
    private _store: Store,
    private _modalCtrl: ModalController,
    public sanitizer: DomSanitizer,
  ) {}

  dismiss() {
    this._modalCtrl.dismiss();
  }
}
