const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://localhost:5173';

const routes = [
  '/',
  '/login',
  '/register',
  '/personal-info',
  '/pregnancy-details',
  '/pregnancy-profile',
  '/appointment',
  '/appointment-history',
  '/profile',
  '/baby-development',
  '/health-tracking',
  '/report',
  '/family-form',
  '/family-form-details',
  '/family-dashboard',
];

test.describe('NURTURE AI - Full Application Health Check', () => {

  test('Check all frontend pages, JavaScript errors and failed requests', async ({ page }) => {

    const consoleErrors = [];
    const pageErrors = [];
    const failedRequests = [];
    const badResponses = [];

    page.on('console', message => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });

    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });

    page.on('requestfailed', request => {
      failedRequests.push({
        url: request.url(),
        error: request.failure()?.errorText || 'Unknown error'
      });
    });

    page.on('response', response => {
      const status = response.status();

      if (status >= 400) {
        badResponses.push({
          status,
          url: response.url()
        });
      }
    });

    console.log('\n========================================');
    console.log(' NURTURE AI FULL APPLICATION TEST');
    console.log('========================================\n');

    for (const route of routes) {

      console.log(`Checking: ${route}`);

      const response = await page.goto(`${BASE_URL}${route}`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });

      expect(response).not.toBeNull();

      if (response) {
        expect(
          response.status(),
          `${route} returned HTTP ${response.status()}`
        ).toBeLessThan(400);
      }

      await page.waitForTimeout(1000);

      console.log(`PASS: ${route}`);
    }

    console.log('\n========================================');
    console.log(' TEST RESULTS');
    console.log('========================================');

    console.log(`Pages checked       : ${routes.length}`);
    console.log(`Console errors      : ${consoleErrors.length}`);
    console.log(`Page errors         : ${pageErrors.length}`);
    console.log(`Failed requests     : ${failedRequests.length}`);
    console.log(`Bad HTTP responses  : ${badResponses.length}`);

    if (consoleErrors.length > 0) {
      console.log('\n--- CONSOLE ERRORS ---');

      consoleErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    if (pageErrors.length > 0) {
      console.log('\n--- PAGE ERRORS ---');

      pageErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    if (failedRequests.length > 0) {
      console.log('\n--- FAILED REQUESTS ---');

      failedRequests.forEach((request, index) => {
        console.log(
          `${index + 1}. ${request.url} → ${request.error}`
        );
      });
    }

    if (badResponses.length > 0) {
      console.log('\n--- BAD HTTP RESPONSES ---');

      badResponses.forEach((response, index) => {
        console.log(
          `${index + 1}. ${response.status} → ${response.url}`
        );
      });
    }

    console.log('\n========================================');

    expect(
      pageErrors,
      'JavaScript page errors were detected'
    ).toEqual([]);

    expect(
      failedRequests,
      'Failed network requests were detected'
    ).toEqual([]);

    expect(
      badResponses,
      'HTTP 4xx/5xx responses were detected'
    ).toEqual([]);

    expect(
      consoleErrors,
      'Console errors were detected'
    ).toEqual([]);

    console.log(' NURTURE AI HEALTH CHECK PASSED');
    console.log('========================================\n');
  });
});