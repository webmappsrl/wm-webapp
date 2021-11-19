import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'webmapp-track-description',
  templateUrl: './track-description.component.html',
  styleUrls: ['./track-description.component.scss'],
})
export class TrackDescriptionComponent implements OnInit {
  @Input('description') set description(value: string) {
    this._initializeSafeHtml(value);
  }

  public safeHtml: SafeHtml;

  constructor(private _domSanitizer: DomSanitizer) {}

  ngOnInit() {}

  private _initializeSafeHtml(value: string): void {
    if (!!value && typeof value === 'string') {
      value = value.replace(/(href="[^\"]*")/gm, '$1 target="_system"');
      this.safeHtml = this._domSanitizer.bypassSecurityTrustHtml(value);

      // setTimeout(() => {
      //   let descriptionDiv: HTMLElement =
      //     document.getElementById('descriptionDetails');
      //   this._deviceService.onResize.pipe(take(1)).subscribe(
      //     (windowSize) => {
      //       this.isDescriptionExpandable =
      //         descriptionDiv.scrollHeight > windowSize.height * 0.4;
      //     },
      //     (err) => {
      //       console.warn(err);
      //     }
      //   );
      // }, 0); // Make this code execute after DOM render
    }
  }
}
