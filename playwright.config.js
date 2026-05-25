/** @type {import('@playwright/test').PlaywrightTestConfig} */
export default {
  testDir: 'tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    channel: process.env.PW_CHROME ? 'chrome' : undefined,
    headless: true,
    launchOptions: {
      args: ['--disable-gpu', '--no-sandbox'],
    },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  ...(process.env.SKIP_VRD_WEBSERVER
    ? {}
    : {
        webServer: {
          command: 'npm run preview -- --port 4173 --host 127.0.0.1',
          port: 4173,
          reuseExistingServer: true,
          timeout: 60_000,
        },
      }),
};
