# Final audit hook

Claude chooses whether to load a skill from its description. A hook is the
deterministic backstop when the final audit must not depend on that choice.

`no-slop` uses a prompt-based `Stop` hook. When Claude is about to finish a
turn, a fast model checks whether the result contains a public-facing
deliverable and whether the final response records a no-slop audit. If the
audit is missing, the hook prevents the turn from ending and tells Claude to
run the skill in embedded mode, fix the result, and try again.

## Install

```bash
node scripts/hook.mjs install
```

The installer merges one marked handler into `~/.claude/settings.json`, keeps
other hooks intact, and saves the prior file as `settings.json.no-slop.bak`.

Check or remove it:

```bash
node scripts/hook.mjs status
node scripts/hook.mjs remove
```

Restart Claude Code after installing or removing the hook.

## Why Stop

- `UserPromptSubmit` runs before the deliverable exists and would spend a model
  call classifying every prompt.
- `PostToolUse` sees individual file edits, not the finished deliverable.
- `Stop` sees the final response and can send Claude back for one last pass.

## Limits

This is a judgment gate, not a content scanner. The prompt hook primarily sees
Claude's final message, so the skill must finish public-facing work with a
short `No-slop audit passed` note. The hook does not prove that every claim is
true, and it does not replace tests, link checks, browser inspection, or the
mechanical `impeccable` detector for interfaces.

The hook runs on every attempted stop and uses a fast model call. Remove it if
the extra latency is not worth the enforcement. A heavier agent-based Stop hook
could inspect conversation files and deliverables directly, but that is more
costly and is intentionally not the default.
