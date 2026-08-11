#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const MARKER = '[no-slop-stop-gate-v1]';
const PROMPT = `${MARKER}
You are the final no-slop quality gate for whatever LLM-powered agent is running. Inspect the stop or completion hook input, especially the agent's final message.

Return {"ok": true} when the turn is internal analysis, code-only work with no public-facing copy, logs, status, a quick conversational answer, or when the final response clearly says the public-facing deliverable received a no-slop audit after drafting.

Return {"ok": false, "reason": "Run the no-slop skill in embedded mode on every public-facing prose or interface deliverable, fix the findings, then finish with a brief 'No-slop audit passed' note."} when the agent is about to deliver or claim completion of prose, a document, a script, marketing copy, a presentation, a website, an interface, or another artifact meant for another person and there is no clear evidence of a final no-slop audit.

Do not demand the gate for internal scratch work. If the hook input says a prior stop check is already active, avoid a loop: allow stopping once the agent has addressed the prior reason or clearly states that the work is exempt.`;

const args = process.argv.slice(2);
const action = args[0] ?? 'status';
const settingsIndex = args.indexOf('--settings');
const settingsPath = settingsIndex === -1
  ? path.join(os.homedir(), '.claude', 'settings.json')
  : path.resolve(args[settingsIndex + 1]);

if (!['install', 'remove', 'status', 'prompt'].includes(action)) {
  console.error('Usage: node scripts/hook.mjs <install|remove|status|prompt> [--settings path]');
  process.exit(1);
}
if (settingsIndex !== -1 && !args[settingsIndex + 1]) {
  console.error('--settings requires a path');
  process.exit(1);
}

function readSettings() {
  if (!fs.existsSync(settingsPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  } catch (error) {
    throw new Error(`refusing to modify invalid JSON at ${settingsPath}: ${error.message}`);
  }
}

function isNoSlopHandler(handler) {
  return handler?.type === 'prompt' && typeof handler.prompt === 'string' && handler.prompt.includes(MARKER);
}

function hasHook(settings) {
  return (settings.hooks?.Stop ?? []).some((group) => (group.hooks ?? []).some(isNoSlopHandler));
}

function hasCurrentHook(settings) {
  return (settings.hooks?.Stop ?? []).some((group) => (group.hooks ?? []).some((handler) =>
    isNoSlopHandler(handler)
    && handler.prompt === PROMPT
    && handler.timeout === 30
    && handler.continueOnBlock === true));
}

function withoutHook(settings) {
  if (!settings.hooks?.Stop) return settings;
  const groups = settings.hooks.Stop
    .map((group) => ({ ...group, hooks: (group.hooks ?? []).filter((handler) => !isNoSlopHandler(handler)) }))
    .filter((group) => group.hooks.length > 0);
  const next = structuredClone(settings);
  if (groups.length) next.hooks.Stop = groups;
  else delete next.hooks.Stop;
  if (next.hooks && Object.keys(next.hooks).length === 0) delete next.hooks;
  return next;
}

function writeSettings(settings) {
  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
  const backup = `${settingsPath}.no-slop.bak`;
  if (fs.existsSync(settingsPath) && !fs.existsSync(backup)) fs.copyFileSync(settingsPath, backup);
  fs.writeFileSync(settingsPath, `${JSON.stringify(settings, null, 2)}\n`);
}

try {
  if (action === 'prompt') {
    console.log(PROMPT);
    process.exit(0);
  }
  const settings = readSettings();
  if (action === 'status') {
    console.log(hasHook(settings) ? `installed: ${settingsPath}` : `not installed: ${settingsPath}`);
  } else if (action === 'install') {
    if (hasCurrentHook(settings)) {
      console.log(`already installed: ${settingsPath}`);
      process.exit(0);
    }
    const next = withoutHook(settings);
    next.hooks ??= {};
    next.hooks.Stop ??= [];
    next.hooks.Stop.push({
      hooks: [{ type: 'prompt', prompt: PROMPT, timeout: 30, continueOnBlock: true }],
    });
    writeSettings(next);
    console.log(`installed: ${settingsPath}`);
  } else {
    if (!hasHook(settings)) {
      console.log(`not installed: ${settingsPath}`);
    } else {
      writeSettings(withoutHook(settings));
      console.log(`removed: ${settingsPath}`);
    }
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
