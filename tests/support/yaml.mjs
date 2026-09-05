import { spawnSync } from 'node:child_process';

/** @param {string} path */
export function loadYaml(path) {
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
