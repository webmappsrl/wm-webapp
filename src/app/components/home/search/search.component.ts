import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {debounceTime} from 'rxjs/operators';

import {Store} from '@ngrx/store';
import {ApiRootState} from '@wm-core/store/features/ec/ec.reducer';
import {inputTyped} from '@wm-core/store/user-activity/user-activity.action';
@Component({
  selector: 'webmapp-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class SearchComponent {
  private _currentLayer: number;

  @Input('initSearch') public set setSearch(init: string) {
    this.searchForm.controls.search.setValue(init);
  }

  @Output() isBlankEVT: EventEmitter<void> = new EventEmitter<void>();
  @Output('isTypings') isTypingsEVT: EventEmitter<boolean> = new EventEmitter<boolean>(false);
  @Output('words') wordsEVT: EventEmitter<string> = new EventEmitter<string>(false);

  public searchForm: UntypedFormGroup;

  constructor(fb: UntypedFormBuilder, store: Store<ApiRootState>) {
    this.searchForm = fb.group({
      search: [''],
    });

    this.searchForm.valueChanges.pipe(debounceTime(500)).subscribe(words => {
      if (words && words.search != null && words.search !== '') {
        store.dispatch(inputTyped({inputTyped: words.search}));
        this.isTypingsEVT.emit(true);
        this.wordsEVT.emit(words.search);
      } else {
        this.isTypingsEVT.emit(false);
      }
      if (words?.search === '') {
        this.isBlankEVT.emit();
      }
    });
  }

  reset(): void {
    this.searchForm.reset();
    this.wordsEVT.emit('');
    this.isTypingsEVT.emit(false);
  }
}
