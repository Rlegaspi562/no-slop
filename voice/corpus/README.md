# Corpus

Samples of how the owner of this voice actually writes and speaks.

Rules describe a voice from the outside. A corpus shows it from the inside, and
it catches things no rule list can state: sentence length distribution, how
often questions get used, whether lists or paragraphs dominate, where profanity
or humor sits, how much hedging is normal.

## Starting from nothing

An empty corpus is not a dead end. Run `/no-slop voice` and take whichever path
fits:

**Have writing somewhere?** Pull it in. Emails, posts, articles, READMEs,
messages, comments, proposals. Anything written by hand, before any AI touched
it.

**Have nothing saved?** Brain dump. Pick any topic you know or care about, your
work, a hobby, a strong opinion, and just talk. Typed or dictated, unedited,
the messier the better. A few minutes of unfiltered talk carries more voice
than a page of careful writing, because nobody performs a brain dump. The agent
reads it and pulls out how you speak: cadence, phrasing, what you reach for
when you explain something. That becomes the first draft of your voice.

Do both if you can. Writing shows your written register, a dump shows your
spoken one, and they calibrate different things.

If you publish videos or podcasts, transcripts of your own speech are the
richest source of all. Pull the captions, mark them as spoken register, and
drop them in verbatim, caption errors and all. The cadence is the point, not
the spelling.

## What makes a good sample

- Messages and emails written quickly, with no editing pass.
- A README or doc written before any AI was involved.
- A post, a pitch, a proposal, a comment thread.
- Transcribed or dictated speech. Highest value of all, least performed.

Four or five pieces is enough to calibrate against. Fifty is not better than
five if the five are representative.

## What not to put here

- Anything an AI drafted, even if it was edited afterward. It poisons the
  reference.
- Formal writing that does not sound like the person, such as legal text or a
  form letter.

## Naming

`YYYY-MM-DD-short-label.md`, with a first line noting what it is and how it was
produced:

```
2026-08-09-client-reply-dictated.md
> Dictated reply to a client, unedited.

2026-08-09-braindump-woodworking.md
> Brain dump, spoken, transcribed verbatim.
```

The provenance line matters. Dictated text, typed text, and brain dumps
calibrate differently.

## How it gets used

When editing prose, read two or three samples before rewriting anything, and
match cadence rather than just avoiding banned words. Prose that passes every
rule in `prose.md` and still does not sound like the corpus has failed.

## Roadmap: audio (not built)

Text captures what you say. It cannot capture how you sound: pitch, pace,
emphasis, where you pause. A future `voice/audio/` library of clean recordings
could serve as a tonality reference for scripts meant to be spoken aloud, and
eventually as a voice-clone library for TTS drafts. If you build it, use the
same date-plus-provenance naming as the text samples.
