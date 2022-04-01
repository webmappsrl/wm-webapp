import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Store} from '@ngrx/store';
import {debounceTime, filter} from 'rxjs/operators';
import {searchElastic} from 'src/app/store/elastic/elastic.actions';
import {IElasticSearchRootState} from 'src/app/store/elastic/elastic.reducer';

@Component({
  selector: 'webmapp-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class SearchComponent {
  @Output('words') wordsEVT: EventEmitter<boolean> = new EventEmitter<boolean>(false);
  public searchForm: FormGroup;

  constructor(fb: FormBuilder, store: Store<IElasticSearchRootState>) {
    this.searchForm = fb.group({
      search: [''],
    });

    this.searchForm.valueChanges.pipe(debounceTime(500)).subscribe(words => {
      if (words && words.search != null && words.search !== '') {
        store.dispatch(searchElastic(words));
        this.wordsEVT.emit(true);
      } else {
        this.wordsEVT.emit(false);
      }
    });
  }

  @Input('initSearch') public set setSearch(init: string) {
    this.searchForm.controls.search.setValue(init);
  }
}
