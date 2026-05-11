# Product

## Register

product

## Users

Product designers tuning the feel of micro-interactions before they ship. They arrive
already comfortable with tween/spring vocabulary and want to compare configurations
side-by-side fast: pick a component, nudge a slider, swap presets, copy the result as
code, share a URL. They're not learning what stiffness means; they're deciding whether
this particular dropdown should pop or settle. Sessions are short, intent-driven, and
return-visit-heavy.

## Product Purpose

A single-page playground for tuning Motion (tween or spring) configurations against 17
shadcn/ui components, with side-by-side A/B comparison, per-component options, URL-
encoded shareable state, and copy-as-code output. It exists because there is no fast
way to feel the difference between two animation configs on a real component without
scaffolding a sandbox. Success: a designer can land on the page, pick a component,
arrive at a config they're happy with, and copy the code in under two minutes.

## Brand Personality

Calm, precise, restrained. Closer to Linear or Vercel docs than to Stripe or any
SaaS analytics product. The chrome is quiet; the motion is loud. Voice is plain and
direct, no marketing adjectives, no emoji, no exclamation points. Sentence-case labels,
honest numeric values shown in monospace where they live. The tool should feel like a
serious instrument designers reach for, not a demo or a novelty.

## Anti-references

- **Generic SaaS dashboards.** No gradient hero, no big-number metric cards, no blue-
  accent corporate template. Nothing that could be mistaken for an analytics product.
- **Heavy design-system documentation sites** (Material, Polaris-style docs). No deep
  nav trees, no long token tables, no encyclopedia chrome. The playground is direct,
  not exhaustive.
- **Toy / CodePen-fun aesthetic.** No bright novelty colors, no playful illustrations,
  no comic typography. This is an instrument, not a gimmick.

## Design Principles

1. **Practice what you preach.** The chrome itself uses tasteful, restrained motion.
   Buttons, toggles, focus rings, panel transitions all behave like the kind of
   micro-interactions the tool is designed to tune. The playground demonstrates good
   motion by being good motion.
2. **The canvas is the focal point.** Everything outside the demo panes is intentionally
   quiet, neutral, type-driven, low-contrast chrome. The user's attention belongs to
   the thing that's animating. Config panels exist to serve the canvas, not compete
   with it.
3. **Direct manipulation over navigation.** Sliders, toggles, and inline controls
   beat tabs, accordions, and overlays. Values should be visible and editable in place.
   When something must be hidden behind a tab, that's a design failure to revisit.
4. **Numbers are the truth.** Durations in ms, spring stiffness/damping/mass, cubic
   bezier handles, all visible at all times in monospace where the value lives. The
   tool is honest about the physics; nothing is dressed up behind a friendly label.
5. **URL is the source of truth.** Any state a user might want to share, bookmark, or
   return to lives in the URL. The page reloads to the exact same configuration. This
   keeps the tool stateless, shareable, and trustworthy.

## Accessibility & Inclusion

- **WCAG 2.2 AA** as the floor across all chrome (contrast, focus visible, keyboard
  reachable for every control).
- **`prefers-reduced-motion`** is respected for chrome (panel transitions, toggle
  animations, button feedback). Demo animations inside the canvas continue to play,
  because that's the product, but the rest of the interface stops moving.
- **Keyboard-first.** Every slider, toggle, dropdown, preset picker, and pane swap is
  reachable and operable via keyboard.
- **Color is never the only signal.** In side-by-side mode, pane A vs pane B identity
  carries position and labels in addition to any color tint, so color-blind users
  aren't disadvantaged. The same rule applies anywhere the UI needs to distinguish
  things (preset warning state, diverged values in a future diff panel, etc).
