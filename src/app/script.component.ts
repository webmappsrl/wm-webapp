import {Component} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {filter, take} from 'rxjs/operators';
import {confWEBAPP} from 'wm-core/store/conf/conf.selector';
@Component({
  selector: 'wm-script',
  template: ``,
})
export class ScriptComponent {
  confWEBAPP$: Observable<any> = this._store.select(confWEBAPP);

  constructor(private _store: Store<any>) {
    this.confWEBAPP$
      .pipe(
        filter(
          confWEBAPP =>
            confWEBAPP != null &&
            (confWEBAPP.embed_code_body != null || confWEBAPP.embed_code_head),
        ),
        take(1),
      )
      .subscribe(confWEBAPP => {
        if (confWEBAPP.embed_code_body != null) {
          this._loadScript('body', confWEBAPP.embed_code_body);
        }
        if (confWEBAPP.embed_code_head != null) {
          this._loadScript('head', confWEBAPP.embed_code_head);
        }
      });
  }

  private _loadScript(tag: 'head' | 'body', data: string): void {
    const htmlTag = tag === 'head' ? document.head : document.body;
    const dataDiv = document.createElement('div');
    dataDiv.innerHTML = data;
    Array.from(dataDiv.children).forEach((element: HTMLScriptElement) => {
      console.log(element);
      const scriptElement = document.createElement('script');
      scriptElement.type = 'text/javascript';
      if (element.textContent) {
        scriptElement.innerHTML = element.textContent;
      }
      if (element.src) {
        scriptElement.src = element.src;
      }
      if (element.charset) {
        scriptElement.charset = element.charset;
      }
      if (element.async != null) {
        scriptElement.async = element.async;
      }
      htmlTag.appendChild(scriptElement);
    });
  }
}
