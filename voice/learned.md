# Learned

Rules that came from real corrections. Append only. Newest at the bottom.

This file is the part of the skill that gets better with use. Nothing in it
should be designed in advance. Every entry exists because something shipped
wrong once.

## Why this is separate from prose.md

`prose.md` is the considered rulebook. This is the log. Entries start here, and
once one has held up across several sessions it gets promoted into `prose.md` or
`design.md` and marked promoted below. That keeps the rulebook short enough to
actually be read while nothing gets lost.

## Capture protocol

Be honest about the mechanism: this skill does not learn on its own. It learns
because the agent writes entries. So the trigger has to be explicit.

**Append an entry whenever any of these happens:**

1. The user rewrites something you wrote, rather than accepting it.
2. The user says a word, phrase, or visual choice is wrong, off, or not them.
3. The user says "I don't say it like that" or corrects tone rather than fact.
4. The user asks for the same change a second time in a session.

Trigger 4 is the important one. A repeat request means the first correction was
not captured.

**Do not append** for factual corrections, bug reports, or scope changes. This
file is about voice and taste only.

**Ask before promoting.** Adding to `learned.md` is routine and needs no
permission. Promoting into `prose.md` changes the standing rulebook, so confirm
first.

## Entry format

```
### YYYY-MM-DD  short label

**Wrote:** the thing that was wrong
**Wanted:** the thing that was right
**Rule:** the generalized version, one sentence
**Scope:** everywhere | prose | design | <project name>
```

Keep `Rule` general enough to apply next time and specific enough to check. "Be
more natural" is not a rule. "Do not open a reply by restating the question" is.

---

## Entries

(none yet)
