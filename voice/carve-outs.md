# Carve-outs

Two kinds of entry live here. **Exceptions** are phrases that trip a slop rule
but stay anyway. **Project rules** are extra constraints that apply only in one
place.

Check this file before flagging anything. A carve-out that gets ignored is worse
than no carve-out, because it means the same correction has to be given twice.

## Exceptions

None yet. The first one usually appears within a week of real use: a phrase the
detector flags that turns out to be genuinely yours. When that happens, record
it like this:

```
### "<the phrase>" in <where it appears>

Looks like <the pattern it trips>. It is not. This is my own phrasing.
Preserve it exactly. Do not soften it, do not flag it, do not suggest an
alternative.

Applies to: <scope>
```

## Project rules

None yet. Use this section for constraints that only make sense in one project,
for example a product whose public copy must never name a competitor. Write the
scope down next to the rule.

## Adding a carve-out

When a correction is a genuine exception rather than a new general rule, it goes
here rather than in `learned.md`. The test: would this rule make sense to
somebody working on a different project? If yes, it is a general rule. If it
only makes sense in one context, it is a carve-out and needs its scope written
down next to it.

## One built-in carve-out

`prose.md` and `design.md` contain banned words as literal text. When running a
search to verify no banned words remain in a repository, exclude
`no-slop/voice/` and `no-slop/upstream/` from the count. Otherwise every scan
reports false positives against the rulebook itself.
