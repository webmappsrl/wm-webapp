import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {select, Store} from '@ngrx/store';
import {BehaviorSubject, from, Observable, of} from 'rxjs';
import {concatMap, switchMap, take} from 'rxjs/operators';
import {ProfileAuthComponent} from 'wm-core/profile/profile-auth/profile-auth.component';
import {DeviceService} from 'wm-core/services/device.service';
import {loadSignOuts} from 'wm-core/store/auth/auth.actions';
import {isLogged} from 'wm-core/store/auth/auth.selectors';
import {confAUTHEnable} from 'wm-core/store/conf/conf.selector';

@Component({
  selector: 'wm-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ProfileComponent {
  authEnable$: Observable<boolean> = this._store.select(confAUTHEnable);
  isLogged$: Observable<boolean> = this._store.pipe(select(isLogged));
  toggle$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isBrowser$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this._deviceSvc.isBrowser);

  constructor(
    private _store: Store,
    private _modalCtrl: ModalController,
    private _deviceSvc: DeviceService,
  ) {}

  profileBtnClick(): void {
    this.isLogged$
      .pipe(
        take(1),
        switchMap(isLogged => {
          if (isLogged) {
            this.toggle$.next(!this.toggle$.value);
            return of(null);
          } else {
            return from(
              this._modalCtrl.create({
                component: ProfileAuthComponent,
                componentProps: {
                  slide1: 'assets/images/profile/logged_out_slide_1.svg',
                  slide2: 'assets/images/profile/logged_out_slide_2.svg',
                },
                id: 'wm-profile-auth-modal',
              }),
            ).pipe(concatMap(modal => from(modal.present())));
          }
        }),
      )
      .subscribe();
  }

  logout(): void {
    this.toggle$.next(false);
    this._store.dispatch(loadSignOuts());
  }
}
