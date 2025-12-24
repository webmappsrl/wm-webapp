// src/app/services/posthog.service.ts
import {DestroyRef, Injectable, NgZone} from '@angular/core';
import posthog from 'posthog-js';
import {Router} from '@angular/router';
import posthogConfig from '../config/posthog.json';

@Injectable({providedIn: 'root'})
export class PosthogService {
  constructor(private ngZone: NgZone, private router: Router, private destroyRef: DestroyRef) {
    this.initPostHog();
  }
  private initPostHog() {
    this.ngZone.runOutsideAngular(() => {
      if (posthogConfig.POSTHOG_KEY && posthogConfig.POSTHOG_HOST) {
        posthog.init(posthogConfig.POSTHOG_KEY, {
          api_host: posthogConfig.POSTHOG_HOST,
          defaults: '2025-11-30',
        });
      }
    });
  }
}
