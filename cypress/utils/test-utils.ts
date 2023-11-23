import {FeatureCollection} from 'geojson';

/**
 * Clears the test state.
 * This function uses Cypress to clear cookies and local storage.
 * It is useful for resetting the application state between end-to-end tests.
 */
export function clearTestState(): void {
  cy.clearCookies();
  cy.clearLocalStorage();
}
