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
    ecTrack: 'Tracks test e2e',
    ecPoi: 'Poi test e2e',
    ecTracksEdge: 'Edge Layer Test e2e',
  },
  tracks: {
    exampleOne: 'Track example one',
    exampleTwo: 'Track example two',
    exampleTwoRelatedPoi: 'related poi example',
    exampleFirstEdge: 'Track Edge Example 01',
  },
  pois: {
    exampleOne: 'Poi example one',
  },
};
