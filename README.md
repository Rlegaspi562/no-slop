# no-slop

One Claude Code skill for both halves of the AI slop problem: text that sounds
generated, and interfaces that look generated. Install it once. It works in the
background, updates itself from the source repos, and learns your voice over
time.

It is a wrapper, not a rewrite. The detection work belongs to other people's
skills, vendored here and kept current automatically. What this adds is a
router that picks the right one, and a voice layer that sits on top and wins.

## Why a wrapper

Anti-slop skills are easy to collect and hard to use. You end up with five that
overlap, no rule for which to reach for, and a personal set of preferences
living in your head instead of in a file. Meanwhile the good ones drift out of
date, because vendoring is a one-time copy that nobody repeats.

This fixes those three things and nothing else.

## Layers

```
voice/         yours, hand-maintained, applied last, always wins
upstream/      other people's, auto-updated, never hand-edited
```

The precedence matters. An upstream skill can be excellent and still be wrong
for you. Rather than forking it and losing updates forever, you write the
disagreement down in `voice/` and let it override.

## Install

Clone into your Claude Code skills directory:

```bash
git clone https://github.com/Rlegaspi562/no-slop.git ~/.claude/skills/no-slop
```

On Windows (PowerShell):

```powershell
git clone https://github.com/Rlegaspi562/no-slop.git "$env:USERPROFILE\.claude\skills\no-slop"
```

It needs Node 18 or later for the updater, and `git` on PATH. Nothing else.
After that it triggers on its own whenever you ask for writing or UI work, or
invoke it directly as `/no-slop`.

## Make it yours

The whole point of the split is that you only have to write one directory.

1. Give it your voice. Run `/no-slop voice` and either drop four or five
   things you have written into `voice/corpus/` (dictated or fired-off text
   beats polished text, because it is the least performed), or, if you have
   nothing saved, brain dump: talk about any topic for a few minutes and the
   agent drafts your voice from how you speak. You approve every rule before
   it lands.
2. Open `voice/prose.md` and delete every rule that is not yours. The defaults
   are one person's preferences, including a hard ban on em dashes. Yours will
   differ.
3. Do the same for `voice/design.md`.
4. Leave `voice/learned.md` alone. It fills itself as you correct things.

Nothing in `upstream/` needs your attention, now or later.

## Updating

The included GitHub Action refreshes the vendored skills weekly and opens a
pull request when something moved upstream. Enable it once: repo Settings >
Actions > General > Workflow permissions > allow Actions to create pull
requests. Or run it by hand:

```bash
node scripts/update.mjs           # pull anything that moved
node scripts/update.mjs --check   # report only, write nothing
```

The updater re-clones each source in `sources.json`, compares against the
pinned commit, copies what changed, prints a per-file diff summary, and repins.
It refuses to write to any protected path, so `voice/` cannot be clobbered by
an upstream change. That refusal is enforced in the script at the path level,
not just documented here.

## Vendored upstreams

| Source | Author | License | Covers |
| ------ | ------ | ------- | ------ |
| [blader/humanizer](https://github.com/blader/humanizer) | Siqi Chen | MIT | Prose. Pattern catalogue derived from Wikipedia's "Signs of AI writing." |
| [leonxlnx/taste-skill](https://github.com/leonxlnx/taste-skill) | leonxlnx | MIT | Design. Thirteen skills covering direction, brand, image-to-code, and redesign. |

Both are vendored verbatim with their licenses. Pinned commits and fetch dates
are in `sources.json` and in each `SOURCE.md`.

## License

MIT for the wrapper: `SKILL.md`, `voice/`, `scripts/`, `reference/`. Vendored
code under `upstream/` keeps its own license, included alongside it.
