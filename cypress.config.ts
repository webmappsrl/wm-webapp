import {defineConfig} from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8100',
    defaultCommandTimeout: 5000,
    testIsolation: false,
    video: true,
  },
});
