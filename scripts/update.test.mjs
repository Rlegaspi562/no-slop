import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const UPDATER = fileURLToPath(new URL('./update.mjs', import.meta.url));

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8' });
  if (result.error) throw result.error;
  return result;
}

function write(root, rel, content) {
  const target = path.join(root, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function makeRemote(initial, changed) {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'no-slop-remote-'));
  assert.equal(run('git', ['init', '-b', 'main'], repo).status, 0);
  run('git', ['config', 'user.email', 'test@example.com'], repo);
  run('git', ['config', 'user.name', 'No Slop Test'], repo);
  for (const [rel, content] of Object.entries(initial)) write(repo, rel, content);
  assert.equal(run('git', ['add', '.'], repo).status, 0);
  assert.equal(run('git', ['commit', '-m', 'initial'], repo).status, 0);
  const old = run('git', ['rev-parse', 'HEAD'], repo).stdout.trim();
  for (const [rel, content] of Object.entries(changed)) {
    const target = path.join(repo, rel);
    if (content === null) fs.rmSync(target, { force: true });
    else write(repo, rel, content);
  }
  assert.equal(run('git', ['add', '-A'], repo).status, 0);
  assert.equal(run('git', ['commit', '-m', 'changed'], repo).status, 0);
  const head = run('git', ['rev-parse', 'HEAD'], repo).stdout.trim();
  return { repo, old, head };
}

function makeSkill(manifest, files = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'no-slop-skill-'));
  write(root, 'scripts/update.mjs', fs.readFileSync(UPDATER, 'utf8'));
  write(root, 'sources.json', `${JSON.stringify(manifest, null, 2)}\n`);
  for (const [rel, content] of Object.entries(files)) write(root, rel, content);
  return root;
}

function manifestFor(source, copy, extra = {}) {
  return {
    protected: ['voice/', 'SKILL.md', 'README.md', 'sources.json', 'scripts/', 'reference/'],
    sources: [{ id: 'fixture', title: 'Fixture', repo: source.repo, ref: 'main', pinned: source.old, fetched: '2026-01-01', copy, ...extra }],
  };
}

const note = (sha) => `# Source\n\n<!-- no-slop-source:start -->\nSource: old\nRef: main\nPinned commit: \`${sha}\`\nFetched: 2026-01-01\n<!-- no-slop-source:end -->\n\nPrivate notes stay.\n`;

test('updates, prunes removed files, preserves local files, and refreshes source metadata', () => {
  const source = makeRemote(
    { 'skills/old.md': 'old', LICENSE: 'license one' },
    { 'skills/old.md': null, 'skills/new.md': 'new', LICENSE: 'license two' },
  );
  const copy = [
    { from: 'skills', to: 'upstream/taste', recursive: true, preserve: ['SOURCE.md', 'LICENSE'] },
    { from: 'LICENSE', to: 'upstream/taste/LICENSE' },
  ];
  const root = makeSkill(manifestFor(source, copy, { source_note: 'upstream/taste/SOURCE.md' }), {
    'upstream/taste/old.md': 'old',
    'upstream/taste/LICENSE': 'license one',
    'upstream/taste/SOURCE.md': note(source.old),
  });

  const result = run(process.execPath, ['scripts/update.mjs'], root);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(fs.existsSync(path.join(root, 'upstream/taste/old.md')), false);
  assert.equal(fs.readFileSync(path.join(root, 'upstream/taste/new.md'), 'utf8'), 'new');
  assert.equal(fs.readFileSync(path.join(root, 'upstream/taste/LICENSE'), 'utf8'), 'license two');
  const sourceNote = fs.readFileSync(path.join(root, 'upstream/taste/SOURCE.md'), 'utf8');
  assert.match(sourceNote, new RegExp(source.head));
  assert.match(sourceNote, /Private notes stay\./);
  assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'sources.json'), 'utf8')).sources[0].pinned, source.head);
});

test('protected destinations fail without changing the file or repinning', () => {
  const source = makeRemote({ payload: 'one' }, { payload: 'two' });
  const root = makeSkill(manifestFor(source, [{ from: 'payload', to: 'voice/prose.md' }]), { 'voice/prose.md': 'mine' });
  const result = run(process.execPath, ['scripts/update.mjs'], root);
  assert.equal(result.status, 1);
  assert.equal(fs.readFileSync(path.join(root, 'voice/prose.md'), 'utf8'), 'mine');
  assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'sources.json'), 'utf8')).sources[0].pinned, source.old);
});

test('destinations outside the skill are rejected', () => {
  const source = makeRemote({ payload: 'one' }, { payload: 'two' });
  const root = makeSkill(manifestFor(source, [{ from: 'payload', to: '../escape.txt' }]));
  const escaped = path.resolve(root, '..', 'escape.txt');
  fs.rmSync(escaped, { force: true });
  const result = run(process.execPath, ['scripts/update.mjs'], root);
  assert.equal(result.status, 1);
  assert.equal(fs.existsSync(escaped), false);
  assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'sources.json'), 'utf8')).sources[0].pinned, source.old);
});

test('validates every upstream path before making any copy', () => {
  const source = makeRemote({ payload: 'one' }, { payload: 'two' });
  const copy = [{ from: 'payload', to: 'upstream/one' }, { from: 'missing', to: 'upstream/two' }];
  const root = makeSkill(manifestFor(source, copy), { 'upstream/one': 'original' });
  const result = run(process.execPath, ['scripts/update.mjs'], root);
  assert.equal(result.status, 1);
  assert.equal(fs.readFileSync(path.join(root, 'upstream/one'), 'utf8'), 'original');
  assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'sources.json'), 'utf8')).sources[0].pinned, source.old);
});

test('--check reports movement without writing', () => {
  const source = makeRemote({ payload: 'one' }, { payload: 'two' });
  const root = makeSkill(manifestFor(source, [{ from: 'payload', to: 'upstream/payload' }]), { 'upstream/payload': 'one' });
  const before = fs.readFileSync(path.join(root, 'sources.json'), 'utf8');
  const result = run(process.execPath, ['scripts/update.mjs', '--check'], root);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /upstream moved/);
  assert.equal(fs.readFileSync(path.join(root, 'upstream/payload'), 'utf8'), 'one');
  assert.equal(fs.readFileSync(path.join(root, 'sources.json'), 'utf8'), before);
});
