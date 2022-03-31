import {ChangeDetectionStrategy, Component, Input, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {Store} from '@ngrx/store';
import {BehaviorSubject, Observable} from 'rxjs';
import {debounce, debounceTime} from 'rxjs/operators';
import {loadElastic} from 'src/app/store/elastic/elastic.actions';
import {IElasticRootState} from 'src/app/store/elastic/elastic.reducer';
import {elasticFeature, elasticHits} from 'src/app/store/elastic/elastic.selector';

@Component({
  selector: 'webmapp-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class SearchComponent {
  @Input('initSearch') public set setSearch(init: string) {
    this.searchForm.controls.search.setValue(init);
  }
  searchForm: FormGroup;
  constructor(fb: FormBuilder, store: Store<IElasticRootState>) {
    this.searchForm = fb.group({
      search: [''],
    });

    this.searchForm.valueChanges
      .pipe(debounceTime(500))
      .subscribe(asd => store.dispatch(loadElastic(asd)));
  }
}
