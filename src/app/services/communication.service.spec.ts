import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { CommunicationService } from './communication.service';

describe('CommunicationService', () => {
  const DEF_URL: string = 'DEF_URL',
    DEF_DATA: string = 'DEF_DATA',
    DEF_OPTIONS: string = 'DEF_OPTIONS',
    DEF_RESULT: any = 'DEF_RESULT',
    DEF_ERROR: any = 'DEF_ERROR';

  let httpClientSpy, communicationService: CommunicationService;
  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post']);
    TestBed.configureTestingModule({
      providers: [
        CommunicationService,
        { provide: HttpClient, useValue: httpClientSpy },
      ],
    });

    communicationService = TestBed.inject(CommunicationService);
  });

  it('should be created', () => {
    expect(communicationService).toBeTruthy();
  });

  describe('get', () => {
    it('should resolve when there is no error', (done) => {
      httpClientSpy.get.and.callFake(
        (url: string, options?: any) =>
          new Observable((observer) => {
            observer.next(DEF_RESULT);
          })
      );
      communicationService.get(DEF_URL, DEF_OPTIONS).subscribe(
        (result) => {
          expect(httpClientSpy.get).toHaveBeenCalledTimes(1);
          expect(httpClientSpy.get).toHaveBeenCalledWith(DEF_URL, DEF_OPTIONS);
          expect(result).toEqual(DEF_RESULT);
          done();
        },
        (err) => {
          fail(err);
          done();
        }
      );
    });

    it('should trigger error when there is an error', (done) => {
      httpClientSpy.get.and.callFake((url: string, options?: any) => {
        return new Observable((observer) => {
          observer.error(DEF_ERROR);
        });
      });
      communicationService.get(DEF_URL, DEF_OPTIONS).subscribe(
        (result) => {
          fail('should trigger error');
          done();
        },
        (err) => {
          expect(httpClientSpy.get).toHaveBeenCalledWith(DEF_URL, DEF_OPTIONS);
          expect(httpClientSpy.get).toHaveBeenCalledTimes(1);
          expect(err).toEqual(DEF_ERROR);
          done();
        }
      );
    });
  });

  describe('post', () => {
    it('should resolve when there is no error', (done) => {
      httpClientSpy.post.and.callFake(
        (url: string, data: any, options?: any) => {
          return new Observable((observer) => {
            observer.next(DEF_RESULT);
          });
        }
      );
      communicationService.post(DEF_URL, DEF_DATA, DEF_OPTIONS).subscribe(
        (result) => {
          expect(httpClientSpy.post).toHaveBeenCalledTimes(1);
          expect(httpClientSpy.post).toHaveBeenCalledWith(
            DEF_URL,
            DEF_DATA,
            DEF_OPTIONS
          );
          expect(result).toEqual(DEF_RESULT);
          done();
        },
        (err) => {
          fail(err);
          done();
        }
      );
    });

    it('should trigger error when there is an error', (done) => {
      httpClientSpy.post.and.callFake((url: string, options?: any) => {
        return new Observable((observer) => {
          observer.error(DEF_ERROR);
        });
      });
      communicationService.post(DEF_URL, DEF_DATA, DEF_OPTIONS).subscribe(
        (result) => {
          fail('should trigger error');
          done();
        },
        (err) => {
          expect(httpClientSpy.post).toHaveBeenCalledTimes(1);
          expect(httpClientSpy.post).toHaveBeenCalledWith(
            DEF_URL,
            DEF_DATA,
            DEF_OPTIONS
          );
          expect(err).toEqual(DEF_ERROR);
          done();
        }
      );
    });
  });
});
