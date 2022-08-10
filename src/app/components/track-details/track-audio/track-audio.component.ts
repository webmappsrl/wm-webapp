import {BehaviorSubject, Observable} from 'rxjs';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {map, withLatestFrom} from 'rxjs/operators';

@Component({
  selector: 'webmapp-track-audio',
  templateUrl: './track-audio.component.html',
  styleUrls: ['./track-audio.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackAudioComponent {
  langs$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>(['it']);
  currentLang$: BehaviorSubject<string> = new BehaviorSubject<string>('it');
  @ViewChild('player') player: ElementRef;
  private _audio$: BehaviorSubject<{[lang: string]: string}> = new BehaviorSubject<{
    [lang: string]: string;
  }>({it: ''});
  audio$: Observable<string | null> = this.currentLang$.pipe(
    map(lang => {
      const audio = this._audio$.value;
      return audio[lang] || null;
    }),
  );
  @Input() set audio(audio: {[lang: string]: string}) {
    const langs = Object.keys(audio);
    this.langs$.next(langs);
    this._audio$.next(audio);
  }
  changeLang(ev: any): void {
    const playerElem = this.player.nativeElement as HTMLAudioElement;
    this.currentLang$.next(ev.detail.value);
    const audio = this._audio$.value;
    playerElem.src = audio[ev.detail.value];
    playerElem.load();
    playerElem.play();
  }
  constructor() {}
}
