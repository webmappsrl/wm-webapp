import { TestBed } from '@angular/core/testing';

import { GeohubService } from './geohub.service';

describe('GeohubService', () => {
  let service: GeohubService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeohubService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
