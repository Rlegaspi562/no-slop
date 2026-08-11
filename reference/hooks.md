# Portable final-review completion hook

The hook is optional. `/no-slop` already tells the agent to perform a final
review. The hook is a safety net for cases where an agent tries to finish
without showing that the review happened.

## Use the same check with any compatible agent

Print the agent-agnostic checker prompt:

```bash
node scripts/hook.mjs prompt
```

If your agent supports a stop or completion hook that can send work back before
the turn ends:

1. Add the printed prompt using that agent's documented hook format.
2. Pass the agent's final message or completion event to the checker.
3. When the checker returns `{"ok": false, "reason": "..."}`, send the reason
   back to the agent and prevent completion until it responds.
4. When it returns `{"ok": true}`, allow the agent to finish.

Hook schemas and event names differ between agents. Use the agent's own
documentation rather than copying the Claude Code settings structure. If the
agent has no compatible completion hook, skip this setup. The skill still works
without it.

## Included Claude Code adapter

The included installer knows how to merge the prompt into Claude Code's
`~/.claude/settings.json` file:

```bash
node scripts/hook.mjs install
node scripts/hook.mjs status
node scripts/hook.mjs remove
```

It keeps other hooks intact and saves the original settings file as
`settings.json.no-slop.bak` before the first change. Restart Claude Code after
installing or removing it.

## What the checker does

The checker runs after drafting, when the agent tries to stop. It looks at the
final message for a public-facing deliverable and evidence that the
`/no-slop` review happened. If that evidence is missing, it asks the agent to
perform the review and try again.

It does not select skills, rewrite the deliverable, update source files, verify
facts, run tests, inspect links, or replace the Impeccable detector.

## Tradeoff

A prompt-based hook adds another model call and some latency whenever the agent
tries to finish. Use it when consistently completing the final review matters
more than the extra call. Skip it when the skill instructions alone are
reliable enough for your workflow.
