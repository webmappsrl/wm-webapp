// src/app/services/posthog.service.ts
import {DestroyRef, Injectable, NgZone} from '@angular/core';
import {Posthog} from '@capawesome/capacitor-posthog';
import {Router} from '@angular/router';
import posthogConfig from '../config/posthog.json';

@Injectable({providedIn: 'root'})
export class PosthogService {
  constructor(private ngZone: NgZone, private router: Router, private destroyRef: DestroyRef) {
    this.initPostHog();
  }
  private async initPostHog() {
    this.ngZone.runOutsideAngular(async () => {
      if (posthogConfig.POSTHOG_KEY && posthogConfig.POSTHOG_HOST) {
        await Posthog.setup({
          apiKey: posthogConfig.POSTHOG_KEY,
          host: posthogConfig.POSTHOG_HOST,
        });
      }
    });
  }
}
