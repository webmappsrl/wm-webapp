import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawTrackComponent } from './draw-track.component';

describe('DrawTrackComponent', () => {
  let component: DrawTrackComponent;
  let fixture: ComponentFixture<DrawTrackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DrawTrackComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DrawTrackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
