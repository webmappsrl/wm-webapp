import {Component, Input, OnInit} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

@Component({
  standalone: false,
  selector: 'webmapp-track-description',
  templateUrl: './track-description.component.html',
  styleUrls: ['./track-description.component.scss'],
})
export class TrackDescriptionComponent implements OnInit {
  @Input('description') set description(value: string) {
    this._initializeSafeHtml(value);
  }

  public safeHtml: SafeHtml;
  public isExpanded: boolean;
  public isExpandable: boolean;

  constructor(private _domSanitizer: DomSanitizer) {
    this.isExpandable = true;
    this.isExpanded = false;
  }

  ngOnInit() {}

  toggleExpansion(): void {
    this.isExpanded = !this.isExpanded;
  }

  private _initializeSafeHtml(value: string): void {
    if (!!value && typeof value === 'string') {
      value = value.replace(/(href="[^\"]*")/gm, '$1 target="_system"');
      this.safeHtml = this._domSanitizer.bypassSecurityTrustHtml(value);

      const interval = setInterval(() => {
        const descriptionDiv: HTMLElement = document.getElementById(
          'webmapp-track-description-html',
        );

        this.isExpandable =
          descriptionDiv && descriptionDiv.scrollHeight > window.innerHeight * 0.4;
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
      }, 1000);
    }
  }
}
