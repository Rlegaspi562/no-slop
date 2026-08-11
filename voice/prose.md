# Prose

Write like a person who understands the subject and has something specific to
say. Prefer plain facts, concrete instructions, and honest limits.

## Hard rules

These are not preferences. They are never violated, including in headings, code
comments, commit messages, and chat replies.

- **No em dashes.** Anywhere. Replace with a period, comma, colon, parentheses,
  or a rewritten sentence.
- **Never the word "actually."** It is filler in nearly every position it
  appears, and it reads as condescending in the rest.
- **No unverified claims.** If a guide, source, test, benchmark, or integration
  was not checked, do not say it was.
- **No privacy-sensitive facts in public copy.**
- **Keep portable behavior agent-agnostic.** Say "your agent" or "whatever
  LLM-powered agent you use" for core behavior. Name Claude Code only for an
  exact Claude Code-only path, hook, setting, or install step.

## Defaults

- Direct, plain language.
- Sentences that read easily without every line being a slogan.
- Concrete nouns: commands, files, costs, outcomes.
- State conditions and limits where they matter.
- Preserve the author's meaning and their level of confidence. Do not upgrade a
  hedge into a certainty or downgrade a certainty into a hedge.
- Preserve technical names, commands, paths, URLs, code, and frontmatter exactly.

## Pass 1: obvious AI copy

Remove or rewrite:

- Generic openings: "Certainly," "Absolutely," "Great question," "Let's dive in."
- Filler endings: "Hope this helps," "Happy to help," "Let me know if you need
  anything else."
- AI vocabulary: unlock, leverage, utilize, delve, robust, seamless, elevate,
  supercharge, cutting-edge, revolutionary, game-changer.
- Empty praise: powerful, transformative, next-level, best-in-class, world-class.
- Unsupported universals: everyone, always, never, any, guaranteed.
- Competitor claims that were not checked.
- The word "hype" in public copy. Name the specific noise, claim, or trend.

## Pass 2: structural slop

Rewrite passages containing:

- Several polished but abstract sentences in a row.
- Repeated "this is not X, it is Y" constructions.
- Short slogan fragments standing in for an explanation.
- Neat groups of three that add rhythm but not information.
- Vague metaphors (glue, magic, brain, engine, operating system) where the text
  never explains the mechanism.
- Claims that a tool acts automatically when it actually depends on access,
  sync, configuration, or user behavior.
- Dramatic language: "session killer," "the whole promise," "the highest-value
  part."
- Corporate headings: "Key takeaways," "What's in the box," "Unlocking value."
  Use a literal heading instead.
- The same point repeated in the heading, the paragraph, the bullets, and the
  closing.

Do not remove personality. Keep useful opinions, humor, cultural references, and
conversational grammar when they sound like the author.

## Accuracy pass

1. Separate observed facts from assumptions and recommendations.
2. Check whether each broad claim states its requirements.
3. Do not describe saved files as automatic model memory.
4. Do not imply read access includes commit or push permission.
5. Do not imply committed work is available elsewhere before it is pushed and
   fetched.

## Method

1. Read the whole document before rewriting any line.
2. Identify the audience and the action the document should help them take.
3. Delete sentences that change neither meaning nor action.
4. Rewrite what remains in the author's voice, calibrated against `corpus/`.
5. Preserve code blocks, commands, links, identifiers, and file structure.
6. Final scan for em dashes, banned words, overclaims, and repeated sentence
   patterns. Exclude this file's own rule lists when counting matches.
7. Read it aloud. Fix stiff cadence, stacked fragments, and sentences written
   for a slide rather than a person.

## Repository work

1. Read the repo's instructions and `STATE.md` first.
2. Audit all public Markdown, not only the README.
3. Verify by search that no em dashes or banned words remain.
4. Validate links, skill frontmatter, templates, and formatting after edits.
5. Update `STATE.md` with the decision and the next action.
6. Commit and push on a branch when access permits.

## Output

With file-editing tools available, edit files directly and return a short
summary of what changed and what was verified.

If the user asked for copy only, return the finished copy first. Do not wrap it
in an explanation of the editing process.
