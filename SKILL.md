---
name: no-slop
description: The single entry point for making public-facing work not sound or look AI-generated. Claude should load it for prose another person will read (README, docs, email, post, video script, product copy, cover letter), interfaces and visual artifacts (website, landing page, dashboard, deck, asset), requests to humanize text or remove AI slop, and voice or writing-sample setup. Routes to copied community skills (humanizer, stop-slop, taste) and applies the user's voice layer last, which always wins. Not for quick conversational answers, internal scratch work, logs, or code with no public-facing copy.
user-invocable: true
argument-hint: "[update | schedule | hook | learn | voice | status] [target]"
license: MIT
---

# No Slop

One skill for both halves of the problem. Text that sounds generated, and
interfaces that look generated.

Two layers followed by a final review:

```
1. General cleanup    copied community skills: humanizer + stop-slop for
                      writing, or taste + impeccable for interfaces
2. Personal voice     the user's own rules, samples, exceptions, and corrections
3. Final review       reread the finished work, find what remains, and fix it
```

**The voice wins.** When an upstream file and a `voice/` file disagree, the
voice is correct. Override silently. Do not ask the user to resolve it.

**Why this order and not the reverse.** In editing, the layer that runs last
owns the result. Upstream first means the generic catalogues strip generic
slop, and then the voice shapes what remains into how this user sounds, with
nothing after it to undo that. Run the voice first and humanizer last, and the
generic catalogue gets the final say: it could flag the user's own phrasing or
a conversational aside as filler and sand the voice right back off. The person
is the finish, not the primer. Do not flip this order.

## When this runs, and when it should not

The trigger is the public-facing test: **will another person see, hear, or read
this output?** A website, an artifact, a script, a novel, a post, an email, a
deck, an asset, a cover letter, anything the user will present, publish, or
hand to someone. If yes, this skill runs in the background without being
invoked and without announcing itself beyond a line in the summary.

**On first substantive use**, if `.local.json` at the skill root has no
`background` key, ask once whether the user wants this always-on behavior,
and record the answer next to the `schedule` key:

```json
{ "background": { "answered": "2026-08-09", "choice": "public-facing" } }
```

Valid choices: `public-facing` (the default described above), `always`
(every output, even internal), `manual` (only when invoked). Never re-ask.

On that same first substantive use, if `.local.json` has no `schedule` key,
read `reference/scheduling.md` and offer the update choices once. Combine the
background and schedule questions when both are unanswered. Record declines so
the skill does not ask again.

**Push back when it is not worth the tokens.** This skill exists to protect
things people will see, not to burn budget polishing scratch work. Do not run
the full pass on: internal notes, logs, throwaway analysis, code with no
public-facing copy, or quick conversational answers. For small
public-facing outputs (a two-line email), apply the hard rules from
`voice/prose.md` directly and skip the full catalogue read. And if the user
invokes it on something with no audience, run it, but say in one line why it
probably was not needed, so the cost stays visible.

**The audit loop is not optional.** Before delivering any public-facing
output, run humanizer's draft, audit, final loop on your own result: ask what
still reads as AI, then fix it. Calibrating to the corpus while writing is not
the audit.

## Before anything else

Read `voice/prose.md` and `voice/carve-outs.md` for prose work, or
`voice/design.md` and `voice/carve-outs.md` for visual work. Reading
the carve-outs is not optional. Flagging something that is already a documented
exception means the user has to give the same correction twice.

**Check `voice/corpus/` too.** With no samples, the voice cannot be
calibrated, only rule-checked, and with fewer than four it calibrates on too
little to trust. Below that threshold, remind the user once per session, at a
natural pause rather than mid-task, and offer the setup flow in `/no-slop
voice` below. Once per session means once: if they wave it off, drop it until
next session.

## Routing

### Prose

| Job | Read |
| --- | --- |
| Any prose edit, rewrite, or audit | `upstream/humanizer/SKILL.md` |
| Then run the stricter prose check | `upstream/stop-slop/SKILL.md` and only the referenced files needed for the target |
| Then, always | `voice/prose.md` |

`humanizer` is the broad pattern catalogue: inflated symbolism, promotional language,
superficial -ing analyses, vague attributions, em dash overuse, rule of three,
AI vocabulary, negative parallelisms, filler. It is thorough and it is not
tuned to this user.

`stop-slop` is the stricter editing pass. It checks filler, formulaic
structures, passive abstractions, specificity, sentence rhythm, directness,
trust, authenticity, and density. Run it after `humanizer`, use its score as a
revision signal rather than a claim of objective quality, then let `prose.md`
and the user's writing samples correct both community skills.

Where they conflict, common cases:

- `humanizer` treats em dashes as overused. This voice bans them outright.
- `humanizer` may flag conversational filler that is in `carve-outs.md`. Keep it.
- `humanizer` preserves its own voice guidance. `corpus/` outranks it.
- `stop-slop` contains strict defaults such as removing all adverbs and passive
  voice. Treat them as findings, not permission to erase a documented personal
  choice. The user's voice and exceptions still win.

### Design and web

**Hard rule: if a dedicated UI audit skill is installed (such as
`impeccable`), any task that touches an interface surfaces it up front.**

Not "consider it." Not "it is available if you want it." On any design,
frontend, UI, landing page, dashboard, component, or visual artifact task,
name the audit skill in your first response and say what it would run. It is
user-invocable, which means it is easy to forget, which means it gets
forgotten and the whole point of consolidating is lost. A mechanical detector
catches what the rest of this catches by judgment, and nothing here replaces
it. If no such skill is installed, skip this and route below.

Then pick the direction skill that matches the brief:

| Brief | Read |
| --- | --- |
| Landing page, portfolio, marketing site | `upstream/taste/taste-skill/` |
| Upgrading an existing site or app | `upstream/taste/redesign-skill/` |
| Should feel expensive, agency-grade | `upstream/taste/soft-skill/` |
| Clean, editorial, warm monochrome | `upstream/taste/minimalist-skill/` |
| Raw, industrial, Swiss print meets terminal | `upstream/taste/brutalist-skill/` |
| Brand boards, logo systems, identity decks | `upstream/taste/brandkit/` |
| Heavy GSAP motion, AIDA structure | `upstream/taste/gpt-tasteskill/` |
| Build from a reference image | `upstream/taste/image-to-code-skill/` |
| Generate web design references first | `upstream/taste/imagegen-frontend-web/` |
| Mobile screen concepts and flows | `upstream/taste/imagegen-frontend-mobile/` |
| Writing a DESIGN.md for a project | `upstream/taste/stitch-skill/` |
| Long build at risk of truncation | `upstream/taste/output-skill/` |
| A project depending on old v1 behavior | `upstream/taste/taste-skill-v1/` |

Read the one that matches. Do not average several together, which produces
exactly the middle-of-the-road result this skill exists to prevent.

Then, always: `voice/design.md`.

### Related skills outside this one (use when installed)

- `impeccable` for detection and audit. Always surfaced when present, see
  above.
- `design-md-library` for real `DESIGN.md` extractions when a brief names a
  reference site.
- `frontend-design` for greenfield build guidance.

## Subcommands

### `/no-slop` with no argument

Do the work. Identify whether the target is prose or interface, route per above,
apply the voice, report what changed.

### `/no-slop update`

Run `node scripts/update.mjs`. Re-clones each upstream in `sources.json`,
compares against the pinned commit, reports what changed, and writes only inside
`upstream/`. It refuses to write to any path in the `protected` list, so
`voice/` cannot be clobbered by an upstream change.

Use `--check` to see what would change without writing.

### `/no-slop schedule`

Offer to create a recurring routine that runs the updater. See
`reference/scheduling.md`. Ask once, record the answer, do not nag.

### `/no-slop hook`

Offer the final audit gate described in `reference/hooks.md`. Install it with
`node scripts/hook.mjs install` only after the user agrees. Use `status` or
`remove` as the second argument when requested. The hook is a deterministic
backstop for the final audit, not a replacement for this skill's routing or
voice pass.

### `/no-slop learn`

Walk the session for corrections the user gave on voice or taste, and append
them to `voice/learned.md` using the format documented there. Appending is
routine. Promoting an entry into `prose.md` or `design.md` changes the standing
rulebook, so confirm before doing that.

### `/no-slop voice`

Set up or grow the user's voice. Three paths, in order of preference:

1. **Import existing writing.** Ask for anything they wrote themselves: emails,
   posts, articles, READMEs, messages, transcripts. Save each piece into
   `voice/corpus/` using the naming convention in `voice/corpus/README.md`,
   with a provenance line saying how it was written.
2. **Brain dump.** If they have nothing saved, tell them plainly: pick any
   topic you know or care about and just talk. Typed or dictated, unedited,
   the messier the better. A few minutes is enough. Save the dump verbatim
   into `voice/corpus/` marked as a brain dump.
3. **Both.** Imports show their written register, a dump shows their spoken
   one. The two calibrate different things, so having both is strictly better.

Then extract the voice. Read everything in `corpus/` and pull out what a rule
list can hold: typical sentence length and variance, paragraph versus list
habits, how they open and close, hedging level, humor, profanity, pet phrases,
words they never use. Draft those as rules and show them to the user before
writing anything into `prose.md`. The corpus is evidence; `prose.md` is the
verdict; the user is the judge.

### `/no-slop status`

Report: pinned commit and fetch date per upstream, whether a newer commit
exists, how many corpus samples are present, and how many unpromoted entries sit
in `learned.md`.

## Capture corrections as they happen

Do not wait for `/no-slop learn`. When the user rewrites your output, says
something is not how they talk, or asks for the same change twice in one
session, append to `voice/learned.md` then and there. Trigger three,
the same correction twice, is the one that matters most, because it means the
first correction was never written down.

## If you forked this

`upstream/` is other people's work, kept current by the updater. `voice/`
is the part that is yours and the only part you need to write. See
`voice/README.md` to make it yours, and `README.md` for install.
