import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('./hook.mjs', import.meta.url));

function run(action, settings) {
  return spawnSync(process.execPath, [SCRIPT, action, '--settings', settings], { encoding: 'utf8' });
}

test('installs, updates without duplication, and removes the Stop hook', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'no-slop-hook-'));
  const settingsPath = path.join(dir, 'settings.json');
  fs.writeFileSync(settingsPath, `${JSON.stringify({ hooks: { Stop: [{ hooks: [{ type: 'command', command: 'keep-me' }] }] } }, null, 2)}\n`);

  const original = fs.readFileSync(settingsPath, 'utf8');
  assert.equal(run('install', settingsPath).status, 0);
  assert.equal(run('install', settingsPath).status, 0);
  assert.equal(fs.readFileSync(`${settingsPath}.no-slop.bak`, 'utf8'), original);

  const installed = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  const handlers = installed.hooks.Stop.flatMap((group) => group.hooks);
  assert.equal(handlers.filter((handler) => handler.prompt?.includes('[no-slop-stop-gate-v1]')).length, 1);
  assert.equal(handlers.filter((handler) => handler.command === 'keep-me').length, 1);
  assert.match(run('status', settingsPath).stdout, /^installed:/);

  assert.equal(run('remove', settingsPath).status, 0);
  const removed = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  assert.equal(removed.hooks.Stop.flatMap((group) => group.hooks).some((handler) => handler.prompt?.includes('[no-slop-stop-gate-v1]')), false);
  assert.equal(removed.hooks.Stop[0].hooks[0].command, 'keep-me');
});

test('refuses to overwrite invalid settings JSON', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'no-slop-hook-invalid-'));
  const settingsPath = path.join(dir, 'settings.json');
  fs.writeFileSync(settingsPath, '{ invalid');
  const result = run('install', settingsPath);
  assert.equal(result.status, 1);
  assert.equal(fs.readFileSync(settingsPath, 'utf8'), '{ invalid');
});

test('prints a portable completion-hook prompt', () => {
  const result = spawnSync(process.execPath, [SCRIPT, 'prompt'], { encoding: 'utf8' });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /whatever LLM-powered agent/i);
  assert.match(result.stdout, /stop or completion hook input/);
  assert.doesNotMatch(result.stdout, /Claude Code/);
});
