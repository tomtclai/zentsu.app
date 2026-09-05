import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/** @type {{ id: string; selector: string; reason: string }[]} */
export const knownViolations = [];

const locales = ['en', 'ar', 'ja'];
const schemes = [
  { name: 'light', colorScheme: 'light' },
  { name: 'dark', colorScheme: 'dark' },
];

for (const lang of locales) {
  for (const scheme of schemes) {
    test(`axe ${lang} ${scheme.name}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme.colorScheme });
      await page.addInitScript((language) => {
        localStorage.setItem('zentsu-locale', language);
      }, lang);

      const path = lang === 'en' ? '/dial/' : `/${lang}/dial/`;
      await page.goto(path, { waitUntil: 'networkidle' });

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      const knownIds = new Set(knownViolations.map((entry) => entry.id));
      const violations = results.violations.filter(
        (violation) =>
          (violation.impact === 'serious' || violation.impact === 'critical') &&
          !knownIds.has(violation.id),
      );

      if (violations.length > 0) {
        const summary = violations
          .map(
            (violation) =>
              `${violation.id} (${violation.impact}): ${violation.nodes.map((node) => node.target.join(' ')).join('; ')}`,
          )
          .join('\n');
        expect(violations, summary).toEqual([]);
      }
    });
  }
}
