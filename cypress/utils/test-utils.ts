import {clearUgcDeviceData, clearUgcSynchronizedData, removeAuth} from '@wm-core/utils/localForage';
import {environment} from 'src/environments/environment';

/**
 * Clears the test state.
 * This function uses Cypress to clear cookies and local storage.
 * It is useful for resetting the application state between end-to-end tests.
 */
export function clearTestState(): void {
  cy.clearLocalStorage();
  cy.clearCookies();
  clearUgcSynchronizedData();
  clearUgcDeviceData();
  removeAuth();
}

/**
 * Logs into the application.
 * @param email - User's email address.
 * @param password - User's password.
 */
export function e2eLogin(
  email: string = Cypress.env('email'),
  password: string = Cypress.env('password'),
): Cypress.Chainable {
  const apiLogin = `${environment.shards.geohub.origin}/api/auth/login`;
  cy.intercept('POST', apiLogin).as('loginRequest');
  cy.get('.wm-profile-button').click();
  cy.get('.wm-profile-logged-out-login-button').click();
  cy.get('ion-input[formcontrolname="email"] input').should('have.focus').clear().type(email);
  cy.get('ion-input[formcontrolname="password"] input').focus().clear().type(password);
  cy.get('.wm-login-submit-button').click();
  return cy.wait('@loginRequest').its('response.body');
}

/**
 * Wait max 5s for map ready
 * @returns
 */
export function waitMapReady(): Cypress.Chainable {
  return cy.get('body', {timeout: 5000}).should('have.attr', 'e2e-map-ready', 'true');
}

/**
 * Opens the UGC box.
 */
export function openUgcBox() {
  cy.get('wm-ugc-box').click();
}

export const originUrl = environment.shards.geohub.origin;
export const meUrl = `${environment.shards.geohub.origin}/api/auth/me`;
export const confURL = `${environment.shards.geohub.awsApi}/conf/52.json`;
export const elasticUrl = `${environment.shards.geohub.elasticApi}`;
export const data = {
  layers: {
    ecTrack: {title: 'Tracks test e2e', id: 504},
    ecPoi: {title: 'Poi test e2e', id: 506},
    ecTracksEdge: {title: 'Edge Layer Test e2e', id: 593},
  },
  tracks: {
    exampleOne: {title: 'Track example one', id: 86095},
    exampleTwo: {title: 'Track example two', id: 86094},
    exampleTwoRelatedPoi: {title: 'related poi example', id: 42514},
    exampleFirstEdge: {title: 'Track Edge Example 01', id: 88585},
  },
  pois: {
    exampleOne: {title: 'Poi example one', id: 42346},
  },
};
