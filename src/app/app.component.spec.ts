import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {TestBed, waitForAsync} from '@angular/core/testing';
import {provideMockStore} from '@ngrx/store/testing';
import {ModalController} from '@ionic/angular';

import {AppComponent} from './app.component';

describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [provideMockStore({initialState: {conf: {}}}), {provide: ModalController, useValue: {}}],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
