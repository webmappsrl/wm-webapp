import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackRelatedUrlsComponent } from './track-related-urls.component';

describe('TrackRelatedUrlsComponent', () => {
  let component: TrackRelatedUrlsComponent;
  let fixture: ComponentFixture<TrackRelatedUrlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrackRelatedUrlsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrackRelatedUrlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
