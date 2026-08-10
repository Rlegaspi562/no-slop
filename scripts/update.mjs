#!/usr/bin/env node
// Updates the vendored upstream skills in no-slop from their source repos.
//
//   node scripts/update.mjs           update everything that moved
//   node scripts/update.mjs --check   report what would change, write nothing
//   node scripts/update.mjs --force   re-copy even if the commit has not moved
//   node scripts/update.mjs --only humanizer
//
// Never writes outside upstream/. Paths listed as "protected" in sources.json
// are refused even if a source tries to target them.

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = path.join(ROOT, 'sources.json');

const args = process.argv.slice(2);
const CHECK = args.includes('--check');
const FORCE = args.includes('--force');
const ONLY = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;

const c = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
};

function git(cwd, ...a) {
  return execFileSync('git', a, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function hash(file) {
  return createHash('sha1').update(fs.readFileSync(file)).digest('hex');
}

function walk(dir, base = dir, out = new Map()) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '.git') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, base, out);
    else out.set(path.relative(base, p).split(path.sep).join('/'), hash(p));
  }
  return out;
}

// A destination is legal only if it stays inside ROOT and does not fall under
// any protected prefix. This is the guard that keeps voice/ safe.
function assertWritable(dest, protectedList) {
  const rel = path.relative(ROOT, dest).split(path.sep).join('/');
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error(`refusing to write outside the skill: ${dest}`);
  }
  for (const p of protectedList) {
    const prefix = p.endsWith('/') ? p : `${p}/`;
    if (rel === p || rel.startsWith(prefix)) {
      throw new Error(`refusing to write to protected path: ${rel}`);
    }
  }
  return rel;
}

function copyInto(from, to, protectedList, recursive) {
  assertWritable(to, protectedList);
  if (recursive) {
    for (const e of fs.readdirSync(from, { withFileTypes: true })) {
      if (e.name === '.git') continue;
      const src = path.join(from, e.name);
      const dst = path.join(to, e.name);
      if (e.isDirectory()) {
        fs.mkdirSync(dst, { recursive: true });
        copyInto(src, dst, protectedList, true);
      } else {
        assertWritable(dst, protectedList);
        fs.copyFileSync(src, dst);
      }
    }
  } else {
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
  }
}

function diffReport(before, after) {
  const added = [], changed = [], removed = [];
  for (const [f, h] of after) {
    if (!before.has(f)) added.push(f);
    else if (before.get(f) !== h) changed.push(f);
  }
  for (const f of before.keys()) if (!after.has(f)) removed.push(f);
  return { added, changed, removed };
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const protectedList = manifest.protected ?? [];
const today = new Date().toISOString().slice(0, 10);

let anyChange = false;
let failures = 0;

for (const src of manifest.sources) {
  if (ONLY && src.id !== ONLY) continue;

  process.stdout.write(`${c.bold(src.id)} ${c.dim(src.repo)}\n`);

  let tmp;
  try {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), `no-slop-${src.id}-`));
    git(process.cwd(), 'clone', '--depth', '1', '--branch', src.ref ?? 'main', src.repo, tmp);
    const head = git(tmp, 'rev-parse', 'HEAD');

    if (head === src.pinned && !FORCE) {
      console.log(`  ${c.green('up to date')} ${c.dim(head.slice(0, 7))}\n`);
      continue;
    }

    console.log(`  ${c.yellow('upstream moved')} ${c.dim(`${(src.pinned ?? '').slice(0, 7)} -> ${head.slice(0, 7)}`)}`);

    // Snapshot every destination so the diff reflects real file changes,
    // not just a moved commit pointer.
    const before = new Map();
    for (const m of src.copy) {
      const dest = path.join(ROOT, m.to);
      if (m.recursive) for (const [f, h] of walk(dest)) before.set(`${m.to}/${f}`, h);
      else if (fs.existsSync(dest)) before.set(m.to, hash(dest));
    }

    if (CHECK) {
      console.log(`  ${c.dim('--check, nothing written')}\n`);
      anyChange = true;
      continue;
    }

    for (const m of src.copy) {
      const from = path.join(tmp, m.from);
      const to = path.join(ROOT, m.to);
      if (!fs.existsSync(from)) {
        console.log(`  ${c.red('missing upstream path')} ${m.from}`);
        failures++;
        continue;
      }
      if (m.recursive) fs.mkdirSync(to, { recursive: true });
      copyInto(from, to, protectedList, !!m.recursive);
    }

    const after = new Map();
    for (const m of src.copy) {
      const dest = path.join(ROOT, m.to);
      if (m.recursive) for (const [f, h] of walk(dest)) after.set(`${m.to}/${f}`, h);
      else if (fs.existsSync(dest)) after.set(m.to, hash(dest));
    }

    const { added, changed, removed } = diffReport(before, after);
    for (const f of added) console.log(`  ${c.green('+')} ${f}`);
    for (const f of changed) console.log(`  ${c.yellow('~')} ${f}`);
    for (const f of removed) console.log(`  ${c.dim('-')} ${f} ${c.dim('(gone upstream, still present locally)')}`);
    if (!added.length && !changed.length && !removed.length) {
      console.log(`  ${c.dim('commit moved but no vendored file changed')}`);
    }

    src.pinned = head;
    src.fetched = today;
    anyChange = true;
    console.log('');
  } catch (err) {
    console.log(`  ${c.red('failed')} ${err.message.split('\n')[0]}\n`);
    failures++;
  } finally {
    if (tmp) fs.rmSync(tmp, { recursive: true, force: true });
  }
}

if (anyChange && !CHECK) {
  fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(c.dim('sources.json repinned.'));
  console.log('Review the diff, then commit. voice/ was not touched.');
} else if (!anyChange && failures === 0) {
  console.log(c.green('Everything current.'));
}

if (failures > 0) {
  console.log(c.red(`${failures} source${failures === 1 ? '' : 's'} failed. Nothing was repinned for those.`));
}

process.exit(failures > 0 ? 1 : 0);
