# Voice

The user's own layer. It wins.

Everything under `upstream/` describes how to avoid sounding and looking like an
AI in general. This directory describes how one specific person sounds and what
they like, and by definition that outranks the general advice. If an upstream
skill says one thing and a file in here says another, the file in here is what
ships.

## Precedence

```
voice/     →  always applied last, always wins
upstream/  →  applied first, provides the pattern catalogue
```

An upstream skill can tell you to do something. If a file in here contradicts
it, the file in here is correct and the upstream is overridden silently. Do not
surface the conflict to the user as a question. Just follow the voice.

## The files

| File            | Holds                                                            |
| --------------- | ---------------------------------------------------------------- |
| `prose.md`      | Writing rules. How prose should read.                             |
| `design.md`     | Visual rules. How interfaces and artifacts should look.           |
| `carve-outs.md` | Exceptions. Phrases and patterns that look like slop but stay.    |
| `learned.md`    | Rules derived from real corrections, appended over time.          |
| `corpus/`       | Samples of the user's actual writing and speech, for calibration. |

## If you forked this

Everything under `upstream/` is someone else's work, kept current
automatically. This directory is the part that is yours, and it is the only
part you need to write. Nothing in `upstream/` will ever overwrite it, and
`scripts/update.mjs` refuses to write to this path.

Two ways to make it yours:

- **You have writing somewhere.** Drop four or five real pieces into `corpus/`
  and delete the rules in `prose.md` and `design.md` that do not sound like
  you. See `corpus/README.md` for what counts as a good sample.
- **You have nothing saved.** Run `/no-slop voice` and brain dump: pick any
  topic you know and just talk, typed or dictated, unedited. The agent pulls
  your cadence, phrasing, and habits out of how you speak and drafts your
  voice from that. You approve the rules before they land.

Either way, `learned.md` starts empty and fills itself as you correct things.
