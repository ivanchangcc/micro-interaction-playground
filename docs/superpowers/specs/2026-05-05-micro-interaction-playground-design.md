# Micro-Interaction Playground — Design

**Status:** Draft for review
**Date:** 2026-05-05

## Purpose

A web playground where designers and developers can tweak the animation properties of 17 common UI components (duration, easing, cubic-bezier, spring physics) and see the result live. The goal is learning: by playing with values and comparing curated presets — including intentionally bad ones — users build intuition for what makes a micro-interaction feel good or bad.

The playground is also a tool: every config produces a copyable code snippet, and any config is shareable via URL.

## Non-goals

- No user accounts, saved-presets-per-user, or any persistence beyond URL state.
- No code export beyond the live snippet (no Storybook generation, JSON export, etc.).
- No theming controls (light/dark, color tokens). v1 is a single theme.
- No mobile-optimized layout. Below ~768px, the playground is replaced with a "best viewed on desktop" notice. Between ~768–1024px, the config panel collapses into a bottom drawer.
- No animation timeline / scrubber / record-and-replay. Trigger and watch only.
- No analytics or telemetry.
- No keyboard shortcuts beyond what shadcn provides natively.
- No e2e tests in v1.

## Tech stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui as the base for all 15 demoed components
- **Animation engine**: CSS transitions for tween configs; Motion (motion.dev) for spring configs
- **Hosting**: Vercel
- **Persistence**: URL is the source of truth — no backend, no database

The playground is single-page and fully client-rendered. Next.js is chosen for DX, the shadcn ecosystem fit, and to keep the door open for additional routes later (e.g. `/about`, per-component dedicated routes).

## File structure

```
app/
  page.tsx                         # the playground page
  layout.tsx
components/
  playground/
    PlaygroundShell.tsx            # top bar + canvas + panel layout
    ComponentPicker.tsx            # dropdown selector
    Canvas.tsx                     # renders 1 or 2 panes
    ConfigPanel.tsx                # right-side panel with A/B tabs
    AnimationControls.tsx          # duration / easing / spring sliders
    PresetPicker.tsx               # preset dropdown inside each tab
    CubicBezierEditor.tsx          # 4 inputs + curve preview
    CodeSnippet.tsx                # live copy-paste-ready output
    ShareButton.tsx
  demos/
    AccordionDemo.tsx
    ToggleDemo.tsx
    ...one per component
  ui/                              # shadcn primitives
lib/
  animation/
    types.ts                       # AnimationConfig, EasingType, etc.
    presets.ts                     # named presets per component
    apply.ts                       # config → CSS vars / motion props
  url-state.ts                     # serialize/parse config to URL
docs/
  superpowers/specs/
```

**Isolation boundary**: each `*Demo.tsx` knows nothing about the URL, presets, or panel UI. It receives an `AnimationConfig` (or two, in side-by-side mode) plus a `triggerKey` and renders its component with that config applied. The shell handles all state, persistence, and panel UI.

## Animation config model

```ts
type AnimationConfig =
  | { type: 'tween'; duration: number; easing: EasingValue }
  | { type: 'spring'; stiffness: number; damping: number; mass: number };

type EasingValue =
  | 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out'
  | { cubicBezier: [number, number, number, number] };
```

**Two paths in the panel:**
- **Tween** → Duration slider + Easing dropdown. Picking "Custom…" reveals a cubic-bezier editor inline.
- **Spring** → Stiffness, Damping, Mass sliders. No duration field (springs are duration-less).

**How configs reach components:**
- **Tween configs**: set CSS custom properties (`--duration`, `--easing`) on a wrapper around the demo. The shadcn components' transition classes are overridden to use `transition: all var(--duration) var(--easing)`.
- **Spring configs**: the demo wraps animated elements in Motion's `<motion.div>` with `transition={{ type: 'spring', stiffness, damping, mass }}`. Demos swap rendering paths based on `config.type`.

**Per-component animation targets** are component-defined and not user-configurable in v1. Examples:
- accordion: `height`, `opacity`
- modal: `scale`, `opacity`, backdrop opacity
- toast: `translateX`, `opacity`
- toggle: thumb `translateX`, background-color
- tabs: indicator `translateX`, content cross-fade

The same `AnimationConfig` drives all components — duration/easing/spring is universal; the *what* varies per component.

**Slider clamping** prevents the page from breaking on extreme values:
- Duration: 0–2000ms
- Stiffness: 1–500
- Damping: 1–50 (minimum 1 to avoid undamped infinite oscillation)
- Mass: 0.1–10
- Cubic-bezier x-coordinates: 0–1 (y can go beyond for overshoot)

## Presets

Each component ships with 4 curated presets, plus an automatic "Custom" state when the user edits a preset's values.

1. **Material standard** — tween, ~250ms, `cubic-bezier(0.4, 0, 0.2, 1)`. The safe default.
2. **iOS spring** — spring, e.g. stiffness 170, damping 26, mass 1. Natural, organic.
3. **Snappy** — tween, ~150ms, `ease-out`. Fast and crisp.
4. **Sluggish ⚠️** — tween, 800ms, `linear`. Intentionally bad. Hovering the warning icon shows a short "why this feels off" tooltip (typically: too long + linear easing kills perceived responsiveness).

Presets are defined in `lib/animation/presets.ts` and may be tuned per component (e.g. modal "Snappy" might be 200ms while button "Snappy" is 100ms).

## Components and triggers

| Component | What animates | Trigger |
|---|---|---|
| Icon button | scale + color on hover/press | hover/click directly |
| Text button | bg color + scale on hover/press | hover/click directly |
| Toggle | thumb x-position + bg color | click directly |
| Checkbox | check-mark draw-in + bg fill | click directly |
| Accordion | content height + opacity | click section header |
| Tabs | indicator x-position + content cross-fade | click tab |
| Stepper | active step indicator slide + completion check | click next/prev |
| Slider | thumb position (drag → animated catch-up) | drag thumb |
| Input field | label float (focus), border color | focus/blur |
| Search input | clear-button fade-in, results-list slide | type / clear |
| Dropdown | menu open (height + opacity), item highlight | click trigger |
| Popover | scale + opacity from origin | click trigger |
| Modal | backdrop fade, content scale + translate | click "Open modal" button |
| Date picker | calendar popover + month transition | click trigger / nav months |
| Toast | slide-in from corner + auto-dismiss exit | click "Show toast" button |
| Side menu | slide-in from edge + backdrop fade | click "Open menu" button |
| Chips | individual chip scale + fade on removal | click `×` on a chip |

**Replay mechanism**: For one-shot animations (modal, toast, popover, dropdown, etc.), a "▶ Replay" button in the canvas footer re-fires the animation by bumping `triggerKey`. For modals, replay opens-then-auto-closes after the enter animation completes; for toasts, replay fires a new toast.

**Per-demo framing**: Each demo decides its own visual composition — modal renders inside a faux app frame so the backdrop has something to dim; toast renders inside a small phone-frame mockup so the corner-slide reads correctly. Demos are responsible for being visually self-explanatory.

## Side-by-side mode

When the top-bar toggle is on:
- Canvas splits into two panes (`A` / `B`), each rendering the same component with its own `AnimationConfig`.
- Config panel gains A/B tabs at the top. The active tab's controls are visible; switching tabs swaps which config the controls edit.
- Each tab has its own preset dropdown — A and B can independently load presets or be edited freely.
- Canvas footer shows "▶ Trigger both" (fires both simultaneously) and "↔ Swap" (swaps configs A and B).

When the toggle is off, only `configA` is used and only the A controls are shown. `configB` is preserved in URL state if previously set, so toggling back on doesn't lose work.

## URL state

Compact keys to keep shared links short.

```
?c=modal              # component id
&t=spring             # config A type (tween | spring)
&s=170&d=26&m=1       # spring params (stiffness, damping, mass)
# OR
&t=tween&dur=300&e=ease-out
&e=cb:0.4,0,0.2,1     # custom cubic-bezier (cb:x1,y1,x2,y2)
&sbs=1                # side-by-side on
&b.t=tween&b.dur=600&b.e=linear   # config B (only when sbs=1)
```

- The URL updates on every config change via `replaceState`, debounced ~150ms so dragging sliders doesn't spam history.
- On load, the URL is parsed and state is hydrated. Missing or unparseable params silently fall back to defaults — broken/hand-edited links should still load *something* useful.
- Unknown component id → redirect to the default component (first in the list), update URL.
- Backward-compat strategy: missing fields fall back to defaults. New optional fields can be added without breaking old links.

## Live code snippet

A section at the bottom of each config tab shows the current config in two formats, toggleable:

```css
/* CSS */
transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
```

```tsx
// Motion
<motion.div
  transition={{ type: 'spring', stiffness: 170, damping: 26, mass: 1 }}
/>
```

A copy button next to each. The snippet is component-agnostic — it shows the *animation* config, not a full component implementation. The goal is for users to take the timing values back to their own code.

## Sharing

A "Share" button in the top-right copies `window.location.href` to clipboard and shows a toast confirmation. No link shortener, no backend.

## UI inventory (for visual design)

Grouped by region for handoff to the visual design phase.

**App chrome (top bar)**
- App title / logo
- Component picker dropdown (15 items, optionally grouped by category)
- Side-by-side toggle (segmented or switch)
- Share button
- Mobile notice banner (only visible <768px)

**Canvas**
- Single-pane wrapper (generous padding, neutral recessed background)
- Split-pane wrapper with `A`/`B` corner labels and vertical divider
- Canvas footer: "▶ Replay" / "▶ Trigger both" / "↔ Swap"
- Per-demo "frame" affordance (faux app frame for modal, phone corner for toast, etc.)

**Config panel (right dock)**
- Panel container with section dividers
- A/B tabs (visible only when side-by-side is on)
- Section header — small uppercase label (`PRESET`, `ANIMATION`, `CODE`)
- Preset dropdown with ⚠ icon for the bad preset
- Animation type control — segmented `Tween | Spring`
- Labeled slider (label left, numeric value right)
- Easing dropdown with `Custom…` revealing inline cubic-bezier editor
- Cubic-bezier editor — 4 numeric inputs + ~80×80 SVG curve preview
- Code snippet block — monospace, format tabs (`CSS` / `Motion`), copy button
- "Reset to preset" link

**Feedback / utility**
- Toast (shadcn) — for "Link copied" confirmation
- Tooltip — for "why this feels off" annotation on bad presets, plus short hints

**Design tokens to define upfront**
- Two surface levels (page bg, canvas bg — canvas slightly recessed)
- Panel section spacing rhythm (consistent gaps between header / control / next section)
- Slider thumb / track styling
- A "warning" accent color for the bad-preset indicator

## Error handling

- Invalid URL params: silently fall back to defaults for that field. Broken links still load.
- Unknown component id: redirect to default component, update URL.
- Extreme spring values: clamped at slider input level (see Animation config model section).

## Testing

- **Unit — `lib/url-state.ts`**: round-trip serialize/parse for every config shape, including custom cubic-bezier, side-by-side, and defaults-on-missing-params. This is the highest-regression-risk surface (broken shared links).
- **Unit — `lib/animation/presets.ts`**: each preset parses to a valid `AnimationConfig`.
- **Component smoke tests**: the playground page renders without crashing for each of the 15 component ids, with both `tween` and `spring` configs.
- **Manual checklist**: a brief per-component checklist to verify the animation actually plays in the browser. Visual correctness is not asserted in CI — that's what the playground is for.
