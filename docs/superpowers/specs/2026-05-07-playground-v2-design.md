# Micro-Interaction Playground v2 — Design

**Date:** 2026-05-07
**Status:** Draft, pending user review
**Predecessor:** [v1 design](./2026-05-05-micro-interaction-playground-design.md)

## Why a v2

v1 shipped feature-complete: 17 components, tween/spring config, side-by-side compare, URL state, share-via-clipboard. Playing with the result surfaced three categories of issues:

1. **Glitches and UX rough edges** — width jumps in date picker, modal cropped by a fake "demo app" frame, search input shifting when suggestions appear, misaligned focus rings, etc.
2. **Missing config dimensions** — the global tween/spring config doesn't capture per-component knobs (popover position, toast direction, side menu animation kind, slider increment, hover/press scale on buttons).
3. **Side-by-side is incomplete** — "Trigger both" only increments a `triggerKey` and doesn't actually fire each component's canonical interaction; popover overlays in pane A escape the pane.

v2 addresses all three. It introduces one new architectural concept (per-component options) and one new interaction concept (canonical triggers). Everything else is targeted polish.

## Scope

**In scope (Phase 7 — fixes and polish):**

- Layout and dimension fixes across 6 components
- Form and input polish (focus rings, label centering, clear-icon centering, search placeholder + searchable component names)
- Component behavior tweaks (accordion multi-open, date picker date selection, dropdown 8 options, chips tween fix, popover portal to pane)
- Config panel polish (copy icon overlap, sentence-case labels, dropdown 4px gap, animation info tooltip)
- Three new micro-interactions: heart fill (uses global config), text button static hover background shift (no new config), date picker open transition (uses global config). Note: the *configurable* hover/press scale options for icon and text buttons land in Phase 8c, not here.

**In scope (Phase 8 — architecture and new options):**

- `componentOptions` type system, URL encoding, per-pane storage
- Per-demo logical size + pane-level scale-to-fit
- Canonical trigger registry; "Trigger both" auto-plays each demo's canonical interaction
- Slider full rework: single thumb, configurable increment, separate drag-feel spring
- Popover position option (8 positions)
- Toast direction option (6 directions)
- Side menu animation kinds (slide / dissolve / scale / push) + bounce + layered + side
- Dropdown bounce toggle
- Icon button and text button hover/press scale config

**Out of scope (deferred):**

- Tablet bottom-drawer layout (768–1024px) — already deferred from v1
- Reveal-style side menu (rejected during brainstorming)
- Animated repositioning when popover position option changes (rejected — instant is fine)

## Architecture decisions

### 1. `AnimationConfig` and `componentOptions` are separate state slices

The global animation config (tween or spring) describes **how things move**. The per-component options describe **what the component does** (popover position, toast direction, etc.). Mixing them in one type would require a discriminated union by component ID inside the animation type, which leaks per-component concerns into a global abstraction.

The two slices live side-by-side in `PlaygroundState` and serialize independently to the URL.

### 2. Per-pane component options

When side-by-side is on, A and B each get their own `componentOptions`. This unlocks compares like "popover top vs popover bottom with the same animation" or "side menu slide vs dissolve with the same spring." The same animation config can drive different positional/structural choices.

### 3. Canonical trigger registry

Each demo exposes a `trigger()` function (via `useImperativeHandle` on a forwarded ref) that performs its canonical interaction. The Canvas's "Trigger both" button calls `trigger()` on both panes. Manual interaction is unchanged — users can still click on a demo directly.

The Chips demo is a special case: its canonical interaction has two distinct actions (add, remove), so it returns two trigger functions, and the Canvas footer renders two buttons instead of one when the active demo declares this shape.

**Migration cost:** the existing `triggerKey` prop pattern remounts demos on Replay; switching to canonical triggers means demos persist across triggers and must implement state resets explicitly (e.g., Modal's trigger does `setOpen(true); setTimeout(() => setOpen(false), 2000)`). All 17 demos need to be updated. Phase 8a-iii lands the trigger ref pattern itself with a single example demo (Toggle); Phase 8b implements canonical triggers across the remaining 16 demos.

**`next/dynamic` + `forwardRef` compatibility:** demos are dynamically imported via `next/dynamic`. Forwarding refs through dynamic imports requires the inner component to be `forwardRef`-wrapped *and* the dynamic loader to preserve refs. Phase 8a-iii includes a verification step before scaling to all 17 demos: confirm the pattern works end-to-end with the Toggle demo (panel ref → dynamic loader → demo's `useImperativeHandle`).

**Per-pane refs:** in side-by-side mode there are two demo instances. The shell maintains `refA` and `refB`. "Trigger both" calls `refA.current?.trigger()` then `refB.current?.trigger()`.

### 4. Per-demo logical size + pane scale-to-fit

Each demo declares a `logicalSize: { width, height }` in the registry. The pane wrapper:

1. Measures itself via `ResizeObserver` to get current `paneW` and `paneH`.
2. Computes scale = `min(paneW / logicalW, paneH / logicalH, 1)` (never scales above 1).
3. Renders a sized container of `logicalW × logicalH` *inside* an outer container sized to `(logicalW × scale) × (logicalH × scale)` so the pane's flex layout treats the scaled demo as its actual visual size.
4. Applies `transform: scale(<scale>)` with `transform-origin: top left` to the inner container.

This keeps pointer events accurate (transform-scaled elements still receive events at their visual position in modern browsers), prevents layout overflow, and lets demos render at logical pixel sizes without thinking about pane size.

This unlocks the toast 390×880 phone preview, which doesn't fit a 480px-wide pane in side-by-side mode at native size.

### 5. URL encoding: per-component compact keys with namespace, separate per-pane

Animation config keeps its existing keys (`t`, `dur`, `e`, `s`, `d`, `m`). Component option keys are **namespaced by the component's `optionsKey`** to avoid collisions across components (e.g., two components both wanting a `pos` key). Format: `<optionsKey>.<key>`. When side-by-side is on, B's keys get the `b.` prefix already used for animation.

Examples:

- `?c=popover&t=tween&dur=250&e=ease-out&popover.pos=tr` — single mode, popover top-right
- `?c=popover&sbs=1&t=tween&dur=250&popover.pos=tr&b.t=tween&b.dur=250&b.popover.pos=bl` — A is top-right, B is bottom-left
- `?c=toast&toast.dir=tr` — toast top-right

Each component's option keys are defined alongside the demo (e.g., `components/demos/PopoverDemo/options.ts`). The URL parser only reads keys for the *active* component's `optionsKey`; keys belonging to other components are ignored. Unknown keys for the active component are also ignored. Missing keys fall back to defaults — this preserves backward compatibility with v1 URLs (which have no component option keys at all).

### 6. Popover portals to its pane (not document.body)

Radix's default portal target is `document.body`, which means a popover in pane A renders at the absolute coordinates of its trigger but in a stacking context outside the pane. In side-by-side mode this can cause it to overlap pane B or sit at the wrong scroll offset.

**Implementation:** Each pane provides its container element through a React context (`PaneContext`). The popover demo reads `useContext(PaneContext)` and passes that element as Radix's `<Popover.Portal container={...}>` target. No DOM querySelector lookups. Single-pane mode provides the same context with the canvas root as the container, so the demo behaves identically.

### 7. Modal drops the fake "Demo app" frame

The modal demo currently wraps itself in a 420×280 fake-app frame with a header bar. v2 removes this — the pane shows just an "Open modal" button; the backdrop and dialog cover the entire pane. In side-by-side mode each pane gets its own modal, scoped via the pane's positioning context.

### 8. Presets and component options are independent

Presets continue to set only animation config (tween / spring / easing / duration / etc.). They do **not** touch component options. This keeps presets focused on "feel" rather than "shape," and avoids surprises like "selecting an iOS preset moved my popover from top to bottom." Component options are tweaked separately via their own panel section.

### 9. URL back-compat for v1 share links

v1 share URLs have no `componentOptions` keys. The v2 parser falls back to component option defaults for any missing key. Existing v1 URLs continue to render correctly under v2 (animation behavior preserved; new options sit at their defaults). New URLs from v2 may include the new namespaced keys. No URL version flag needed.

## Component-specific designs

### Slider (Phase 8d)

**Visual:** single track with a single thumb. No second "visual" track-and-thumb. End labels "0" and "100" sit at the track ends.

**Increment:** configurable via `componentOptions.slider.increment` (default 5). Drag snaps to nearest increment. Canonical trigger advances by one increment.

**Drag feel:** separate spring config (`componentOptions.slider.dragSpring: SpringConfig`). When the user releases the thumb, it springs into the snapped position using this spring. The global animation config drives any other slider animation (e.g., color transitions on the track if added later); the drag spring is solely for thumb release.

### Popover (Phase 8e)

**Position:** `componentOptions.popover.position` ∈ `{ top-left, top, top-right, left, right, bottom-left, bottom, bottom-right }` (default `bottom`). Standard interpretation — direction = anchor; popover appears on that side of the trigger.

**Repositioning:** instant. Changing the option remounts/repositions the popover with no transition.

### Toast (Phase 8f)

**Direction:** `componentOptions.toast.direction` ∈ `{ top-left, top, top-right, bottom-left, bottom, bottom-right }` (default `bottom-right`). Standard interpretation — direction = resting anchor position; slide-in is from the nearest edge.

**Phone size:** 390×880, scaled to fit by the pane wrapper.

### Side menu (Phase 8g)

**Side:** `componentOptions.sideMenu.side` ∈ `{ left, right }` (default `left`).

**Animation kind:** `componentOptions.sideMenu.kind` ∈ `{ slide, dissolve, scale, push }` (default `slide`).
- `slide` — menu slides in from its side edge.
- `dissolve` — menu fades in.
- `scale` — menu grows from its side edge.
- `push` — menu slides in and pushes the page content in the opposite direction.

**Bounce:** `componentOptions.sideMenu.bounce: boolean` (default `false`). Only active when the global config is a spring — bounce amplifies the spring's overshoot. The toggle is disabled with a "Bounce requires spring animation" tooltip when global config is tween. (This matches industry norms — bounce is a physics property, not a curve overlay.)

**Layered:** `componentOptions.sideMenu.layered: boolean` (default `false`). When true, the menu container animates first, then each nav item appears in sequence (each delayed by ~50ms × index).

### Dropdown (Phase 8c)

**Bounce:** `componentOptions.dropdown.bounce: boolean` (default `false`). Same semantics as side menu bounce — only active when global config is a spring; the toggle is disabled with a "Bounce requires spring animation" tooltip when global config is tween.

**Options:** 8 options shown (was 3). Labels: `Apple`, `Banana`, `Cherry`, `Date`, `Elderberry`, `Fig`, `Grape`, `Honeydew` — neutral, recognizable, sentence-case-friendly.

### Icon button & text button (Phase 8c)

**Hover scale:** `componentOptions.iconButton.hoverScale: number` (default 1.05). Range 1.0–1.5.
**Press scale:** `componentOptions.iconButton.pressScale: number` (default 0.95). Range 0.5–1.0.

Same shape for `componentOptions.textButton`.

Heart fill animation (icon button): on click, the heart fills red and uses the global config to animate the fill + scale.

Text button hover state: a subtle background color appears on hover, alongside the configurable hover scale.

### Date picker (Phase 7c — consolidated)

All three changes ship together as a single "date picker rework" task in 7c rather than splitting across sub-phases:

- **Width:** fixed (no reflow when month changes).
- **Date selection:** users can select a date, not only a month.
- **Open transition:** uses the global animation config. Calendar fades + scales in from the trigger.

### Modal (Phase 7a)

- Drop fake "Demo app" frame.
- Backdrop + dialog scope to the pane.
- "Trigger both" auto-closes after 2s (Phase 8b).

### Search input (Phase 7a + 7b)

- Position locks when suggestions appear (suggestions render in a positioned overlay, not inline-pushing).
- Placeholder: "Search a component."
- Searchable values: **the 17 component-picker labels** (e.g., "Toggle", "Search input", "Date picker"). The demo imports the registry's labels and filters against that list. The previous hardcoded 6-string list is removed entirely. This makes the search demo feel like a meta-search of the playground itself.
- Clear icon vertically centered when input is active.

### Input field (Phase 7b)

- Label vertically centered at default state (equal top/bottom padding).

### Toggle (Phase 7a)

The current toggle is asymmetric: track 56px, thumb 24px. Inactive position `x: 4` (4px gap on left); active position `x: 24` (24 + 24 = 48, leaving 8px gap on right). Fix: change active position to `x: 28` (28 + 24 = 52, leaving 4px on right). Result: 4px gap on the leading edge in both states — symmetric.

### Stepper (Phase 7a)

- Larger overall (so the transition is more visible) — increase step indicator size and spacing.
- Stepper bounding box and the back/next button row share a vertical center; no extra trailing whitespace inside the stepper that pushes back/next out of alignment. Effectively: stepper indicators sit centered on the same baseline as the buttons.

### Accordion (Phase 7c)

- Allow multiple panels open simultaneously (no auto-close on opening another).

### Chips (Phase 7c + 8b)

- Tween animation works (currently broken).
- Canvas footer renders two buttons in side-by-side mode: "Add chip" and "Remove chip" (replacing single "Trigger both").

### Config panel (Phase 7d)

- Copy icon has a background to prevent overlapping text in the code snippet.
- Component picker labels are sentence case with no hyphens (e.g., "Search input" instead of "search-input").
- Dropdown menus open below the trigger with 4px gap (no overlay).
- "Animation" section header has an info icon; tooltip on hover explains tween vs spring (designer-friendly copy).

### Side-by-side (Phase 7d + 8a-iii + 8b)

- Remove the Replay button from single-pane mode entirely. In single mode the canvas footer is empty; users interact with the demo directly. In side-by-side mode, the footer shows "Trigger both" (and Swap, plus the Chips dual buttons when active).
- Popover portals to its pane (via `PaneContext`).
- "Trigger both" calls each demo's canonical trigger.

## Canonical triggers

Each demo declares one of two trigger shapes:

```ts
type Trigger = () => void;
type DualTrigger = { primary: () => void; primaryLabel: string; secondary: () => void; secondaryLabel: string };
```

| Component    | Trigger shape | Behavior |
|--------------|---------------|----------|
| Toggle       | single        | Flip on (next call flips off) |
| Checkbox     | single        | Check (next call unchecks) |
| IconButton   | single        | Click (heart fill animation) |
| TextButton   | single        | Click |
| Accordion    | single        | Open the next item, cycling |
| Tabs         | single        | Cycle to next tab |
| Stepper      | single        | Advance step, cycling |
| Slider       | single        | Advance value by one increment, cycling |
| InputField   | single        | Focus → type a sample word → blur |
| SearchInput  | single        | Focus → type "but" → show suggestions → clear |
| Dropdown     | single        | Open (next call closes) |
| Popover      | single        | Open (next call closes) |
| Modal        | single        | Open, auto-close after 2s |
| Toast        | single        | Fire one toast |
| DatePicker   | single        | Open (next call closes) |
| SideMenu     | single        | Open (next call closes) |
| Chips        | dual          | "Add chip" / "Remove chip" |

In single-pane mode, no canonical trigger button is shown — the user interacts with the demo directly. Per Phase 7d, the "Replay" button is hidden when side-by-side is off; the canvas footer is empty. Manual interaction is sufficient because there's only one demo to interact with.

## Data model changes

```ts
// lib/animation/types.ts — unchanged

// lib/url-state.ts — extends PlaygroundState
export type PlaygroundState = {
  componentId: ComponentId;
  configA: AnimationConfig;
  configB?: AnimationConfig;
  componentOptionsA: Partial<ComponentOptions>;
  componentOptionsB?: Partial<ComponentOptions>;
  sideBySide: boolean;
};

// lib/component-options/types.ts — new
export type ComponentOptions = {
  popover?: { position: PopoverPosition };
  toast?: { direction: ToastDirection };
  sideMenu?: { side: 'left' | 'right'; kind: SideMenuKind; bounce: boolean; layered: boolean };
  dropdown?: { bounce: boolean };
  iconButton?: { hoverScale: number; pressScale: number };
  textButton?: { hoverScale: number; pressScale: number };
  slider?: { increment: number; dragSpring: SpringConfig };
};

// components/demos/registry.ts — extends entries
export type ComponentMeta = {
  id: ComponentId;
  label: string;             // sentence case, no hyphens
  logicalSize: { width: number; height: number };
  optionsKey?: keyof ComponentOptions;  // which slice this component uses, if any
};
```

## Testing strategy

- **Unit tests (TDD)** for new lib/hook code: `componentOptions` defaults, URL encode/decode round-trips, canonical trigger refs.
- **Smoke tests** for affected demos: each demo continues to render with both tween and spring configs, and with each new option value.
- **Manual QA** for visual changes: focus rings, copy icon overlap, popover positioning, side menu animation kinds, slider feel.

## Phase plan summary

**Phase 7 — fixes and polish (no new architecture)**

| Sub-phase | Focus | Approx items |
|---|---|---|
| 7a | Layout & dimension fixes (modal, toast phone, stepper, search position lock, toggle padding) | 5 |
| 7b | Form & input polish (focus rings, label centering, search placeholder + searchable list, clear-icon centering, slider color) | 5 |
| 7c | Component behavior tweaks (accordion multi-open, date picker rework — width + date select + open transition, dropdown 8 options, chips tween fix, popover portal via PaneContext) | 5 |
| 7d | Config panel polish (copy icon bg, sentence-case picker labels, dropdown 4px gap, animation info tooltip, hide Replay in single mode) | 5 |
| 7e | Simple new interactions using existing config (heart fill, text button hover bg shift) | 2 |

**Phase 8 — architecture and new options**

| Sub-phase | Focus |
|---|---|
| 8a-i | `componentOptions` type system + namespaced URL encoding |
| 8a-ii | Per-demo logical size + pane scale-to-fit (with ResizeObserver + scaled-layout container) |
| 8a-iii | Canonical trigger ref pattern + Toggle as proof-of-concept (verifies `next/dynamic` + `forwardRef` end-to-end) |
| 8b | Implement canonical triggers across remaining 16 demos + wire "Trigger both" (incl. modal 2s auto-close, slider increment-advance, chips dual-button special case) |
| 8c | Simple new options (dropdown bounce with spring-only enablement, icon/text button hover & press scale) |
| 8d | Slider full rework (single thumb visual + increment config + drag-feel spring + 0/100 end labels) |
| 8e | Popover position (8 positions, instant repositioning) |
| 8f | Toast direction (6 directions; depends on 8a-ii for phone scale-to-fit) |
| 8g | Side menu (4 animation kinds + bounce with spring-only enablement + layered + configurable side) |

Phase 7 sub-phases have no dependency on Phase 8. Within Phase 8: 8a-i / 8a-ii / 8a-iii are independent of each other; 8b depends on 8a-iii; 8c–8e and 8g depend on 8a-i; 8f depends on 8a-i and 8a-ii.

## Open questions

None at time of writing. All clarifications resolved during brainstorming and PM/full-stack review.
