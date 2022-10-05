import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';

import {BehaviorSubject} from 'rxjs';
import {IonModal} from '@ionic/angular';

@Component({
  selector: 'webmapp-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class FilterComponent implements OnChanges {
  @Input() filters: {[filter: string]: any[]};
  @ViewChild(IonModal) modal: IonModal;
  @Output() selectedFilters: EventEmitter<string[]> = new EventEmitter<string[]>();

  currentFilters$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  currentTab$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  tabs$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.filters.currentValue != null) {
      const keys = Object.keys(this.filters);
      this.tabs$.next(keys);
      this.currentTab$.next(keys[0]);
    }
  }
  addFilter(filter: string): void {
    let currentFilters = this.currentFilters$.value;
    const indexOfFilter = currentFilters.indexOf(filter);
    if (indexOfFilter >= 0) {
      this.currentFilters$.next(currentFilters.filter(e => e !== filter));
    } else {
      this.currentFilters$.next([...this.currentFilters$.value, filter]);
    }
    this.selectedFilters.emit(this.currentFilters$.value);
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(this.currentFilters$.value, 'confirm');
  }

  reset(): void {
    this.currentFilters$.next([]);
    this.selectedFilters.emit(this.currentFilters$.value);
  }

  segmentChanged(event: any): void {
    this.currentTab$.next(event);
  }
}
