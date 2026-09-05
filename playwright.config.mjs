import { defineConfig, devices } from '@playwright/test';

const sitePort = process.env.SITE_PORT ?? '8788';
const siteDir = process.env.SITE_DIR ?? `${process.cwd()}/_site`;
const baseURL = `http://127.0.0.1:${sitePort}`;

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
  },
  webServer: {
    command: `npx wrangler pages dev "${siteDir}" --port ${sitePort} --ip 127.0.0.1`,
    url: `${baseURL}/dial/`,
    reuseExistingServer: !process.env.CI,
    timeout: 90_000,
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
      caret: 'hide',
    },
  },
  snapshotPathTemplate:
    '{testDir}/visual/__screenshots__/{testFilePath}/{arg}-{projectName}-{platform}{ext}',
  projects: [
    {
      name: 'desktop-chromium',
      testMatch: 'tests/e2e/**',
      use: {
        browserName: 'chromium',
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'mobile-webkit',
      testMatch: 'tests/e2e/**',
      use: {
        ...devices['iPhone 14'],
      },
    },
    {
      name: 'visual-desktop',
      testMatch: 'tests/visual/**',
      use: {
        browserName: 'chromium',
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'visual-mobile',
      testMatch: 'tests/visual/**',
      use: {
        browserName: 'chromium',
        viewport: { width: 375, height: 812 },
      },
    },
  ],
});
