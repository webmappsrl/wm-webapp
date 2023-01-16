import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {debounceTime, filter} from 'rxjs/operators';

import {IElasticSearchRootState} from 'src/app/store/elastic/elastic.reducer';
import {Store} from '@ngrx/store';
import {searchElastic, layerTracksElastic} from 'src/app/store/elastic/elastic.actions';
@Component({
  selector: 'webmapp-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class SearchComponent {
  private _currentLayer: number;

  @Input('currentLayer') set setCurrentLayer(layer: ILAYER) {
    if (layer != null && layer.id != null) {
      this._currentLayer = +layer.id;
    }
  }

  @Input('initSearch') public set setSearch(init: string) {
    this.searchForm.controls.search.setValue(init);
  }

  @Output('isTypings') isTypingsEVT: EventEmitter<boolean> = new EventEmitter<boolean>(false);
  @Output('words') wordsEVT: EventEmitter<string> = new EventEmitter<string>(false);

  public searchForm: FormGroup;

  constructor(fb: FormBuilder, store: Store<IElasticSearchRootState>) {
    this.searchForm = fb.group({
      search: [''],
    });

    this.searchForm.valueChanges.pipe(debounceTime(500)).subscribe(words => {
      if (words && words.search != null && words.search !== '') {
        if (this._currentLayer != null) {
          store.dispatch(layerTracksElastic({layer: this._currentLayer, inputTyped: words}));
        } else {
          store.dispatch(searchElastic(words));
        }
        this.isTypingsEVT.emit(true);
        this.wordsEVT.emit(words.search);
      } else {
        this.isTypingsEVT.emit(false);
      }
    });
  }

  reset(): void {
    this.searchForm.reset();
    this.wordsEVT.emit('');
    this.isTypingsEVT.emit(false);
  }
}
