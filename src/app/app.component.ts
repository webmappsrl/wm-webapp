import { Component } from '@angular/core';
import { LanguagesService } from './services/languages.service';

@Component({
  selector: 'webmapp-app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private _languagesService: LanguagesService) {
    this._languagesService.initialize();
  }
}
