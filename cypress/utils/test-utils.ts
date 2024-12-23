import {FeatureCollection} from 'geojson';
import { environment } from 'src/environments/environment';

/**
 * Clears the test state.
 * This function uses Cypress to clear cookies and local storage.
 * It is useful for resetting the application state between end-to-end tests.
 */
export function clearTestState(): void {
  cy.clearCookies();
  cy.clearLocalStorage();
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
  const apiLogin = `${environment.api}/api/auth/login`;
  cy.intercept('POST', apiLogin).as('loginRequest');
  cy.get('.wm-profile-button').click();
  cy.get('.wm-profile-logged-out-login-button').click();
  cy.get('input[name="ion-input-0"]').type(email);
  cy.get('input[name="ion-input-1"]').type(password);
  cy.get('.wm-login-submit-button').click();
  return cy.wait('@loginRequest').its('response.body');
}
