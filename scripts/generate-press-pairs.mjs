// Writes the thin press/convert/<slug>.html stubs from _data/press_pairs.yml,
// so a pair is added or reordered by editing that YAML file, not by copying
// HTML. Each stub's front matter is exactly `pair: <slug>` and
// `layout: press-pair`; _layouts/press-pair.html does the rendering from the
// data file at build time. See SITE-PLAN.md section 3.
//
// Usage:
//   node scripts/generate-press-pairs.mjs               generate the stubs
//   node scripts/generate-press-pairs.mjs --check-prose  exit 1 if any pair
//                                                          has an empty prose
//                                                          field, without
//                                                          writing anything
//
// --check-prose is wired into `validate:press-preview`, not into the
// production `npm test`, because every prose field is intentionally empty
// until the wave B copy pass (SITE-PLAN.md section 5) fills it.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dataPath = '_data/press_pairs.yml';
const outputDir = 'press/convert';

function loadPairs(path) {
  const result = spawnSync(
    'ruby',
    ['-ryaml', '-rjson', '-e', 'puts YAML.load_file(ARGV[0]).to_json', path],
    { encoding: 'utf8' },
  );
  if (result.status !== 0) {
    throw new Error(`Failed to parse ${path}: ${result.stderr}`);
  }
  return JSON.parse(result.stdout);
}

function emptyProseFields(pair) {
  const issues = [];
  const isBlank = (value) => typeof value !== 'string' || value.trim() === '';

  for (const field of ['h1', 'description', 'native_gap']) {
    if (isBlank(pair[field])) issues.push(`${pair.slug}.${field}`);
  }
  (pair.steps ?? []).forEach((step, index) => {
    if (isBlank(step)) issues.push(`${pair.slug}.steps[${index}]`);
  });
  for (const field of ['container', 'codec', 'quality', 'metadata']) {
    if (isBlank(pair.result?.[field])) issues.push(`${pair.slug}.result.${field}`);
  }
  (pair.faq ?? []).forEach((entry, index) => {
    if (isBlank(entry.question)) issues.push(`${pair.slug}.faq[${index}].question`);
    if (isBlank(entry.answer)) issues.push(`${pair.slug}.faq[${index}].answer`);
  });

  return issues;
}

function stubContentsFor(slug) {
  // `published: false` is set here, not only via the `press/convert`
  // defaults scope in _config.yml, because Jekyll 3.10's publish filter
  // reads front matter with Hash#fetch, which never consults the
  // default_proc a defaults-scope value is wired through. Only a real key
  // in the page's own front matter actually keeps it out of a normal
  // build. See the comment above that scope in _config.yml.
  return `---\npair: ${slug}\nlayout: press-pair\npublished: false\n---\n`;
}

function generate(pairs) {
  mkdirSync(outputDir, { recursive: true });

  const expectedFiles = new Set(pairs.map((pair) => `${pair.slug}.html`));
  for (const existing of readdirSync(outputDir).filter((name) => name.endsWith('.html'))) {
    if (!expectedFiles.has(existing)) {
      rmSync(join(outputDir, existing));
      console.log(`Removed stale stub: ${outputDir}/${existing}`);
    }
  }

  for (const pair of pairs) {
    const path = join(outputDir, `${pair.slug}.html`);
    const contents = stubContentsFor(pair.slug);
    if (existsSync(path) && readFileSync(path, 'utf8') === contents) continue;
    writeFileSync(path, contents);
  }

  console.log(`Generated ${pairs.length} press/convert stubs from ${dataPath}.`);
}

function main() {
  const pairs = loadPairs(dataPath);
  const slugs = pairs.map((pair) => pair.slug);
  const duplicates = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
  if (duplicates.length > 0) {
    console.error(`Duplicate slugs in ${dataPath}: ${[...new Set(duplicates)].join(', ')}`);
    process.exitCode = 1;
    return;
  }

  if (process.argv.includes('--check-prose')) {
    const issues = pairs.flatMap(emptyProseFields);
    if (issues.length > 0) {
      console.error(`${issues.length} empty prose field(s) in ${dataPath}:`);
      console.error(issues.map((issue) => `- ${issue}`).join('\n'));
      process.exitCode = 1;
    } else {
      console.log(`All prose fields in ${dataPath} are filled for ${pairs.length} pairs.`);
    }
    return;
  }

  generate(pairs);
}

main();
