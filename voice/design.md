# Design

Visual rules. These apply to interfaces, artifacts, demos, decks, and any image
or document produced for another person to look at.

## Hard rules

- **No decoration that was not asked for.** Specifically: accent bars, gradient
  fills, glows, and glassmorphism. If the brief did not call for it, it does not
  go in. Ornament added to fill a space is the visual form of filler prose.
- **No purple gradient on anything.** It is the single most recognizable tell of
  a generated interface.
- **No default Inter.** Not because Inter is bad, but because unexamined Inter
  signals that no type decision was made. Choose a typeface for a reason and be
  able to say the reason.
- **No uniform border radius across every element.** Radius should carry
  meaning: a pill button and a content card are not the same object.
- **No centered-everything layout.** Centering is a choice for a specific
  element, not a page-level default.

## Default direction

Unless the brief says otherwise, demos and one-off artifacts get the
**paper-and-ink editorial** look: high contrast, generous margins, real
typographic hierarchy, restraint with color, and the feel of something printed
rather than something rendered.

Deviate freely when the project has its own committed direction. A project
`DESIGN.md` outranks this default. So does an explicit request.

## Before shipping any interface

Ask the three questions that separate a designed thing from a generated thing:

1. What is the one element the eye should hit first, and does it actually win?
2. What did I remove? If nothing, look again.
3. Could this be any other product's page with the logo swapped? If yes, it is
   not done.

## Reaching for more

`upstream/taste/` holds thirteen direction-specific skills, including
`minimalist-skill`, `brutalist-skill`, `soft-skill`, and `brandkit`. Read the one
that matches the brief rather than averaging them.

`design-md-library` holds 74 `DESIGN.md` files extracted from real production
sites. When a brief says "make it feel like Linear" or "like Stripe," start from
the real extraction, not from memory of the site.
