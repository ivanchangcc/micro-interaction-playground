---
name: Micro-Interaction Playground
description: A single-page tool for tuning Motion (tween or spring) configurations against 17 shadcn/ui components, with side-by-side A/B comparison, URL-shareable state, and copy-as-code output.
colors:
  surface-paper: "oklch(1 0 0)"
  surface-canvas: "oklch(0.97 0 0)"
  surface-sidebar: "oklch(0.985 0 0)"
  surface-muted: "oklch(0.97 0 0)"
  ink-primary: "oklch(0.205 0 0)"
  ink-on-primary: "oklch(0.985 0 0)"
  ink-foreground: "oklch(0.145 0 0)"
  ink-muted: "oklch(0.556 0 0)"
  border-default: "oklch(0.922 0 0)"
  border-input: "oklch(0.922 0 0)"
  ring-focus: "oklch(0.708 0 0)"
  signal-destructive: "oklch(0.577 0.245 27.325)"
typography:
  display:
    fontFamily: "Geist, Geist Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Geist, Geist Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  title:
    fontFamily: "Geist, Geist Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "normal"
  body:
    fontFamily: "Geist, Geist Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Geist, Geist Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.08em"
  mono:
    fontFamily: "Geist Mono, Geist Mono Fallback, ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  none: "0"
  sm: "calc(0.625rem * 0.6)"
  md: "calc(0.625rem * 0.8)"
  lg: "0.625rem"
  xl: "calc(0.625rem * 1.4)"
  pill: "9999px"
spacing:
  px: "1px"
  hairline: "2px"
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  panel: "320px"
  topbar-h: "56px"
  footer-h: "48px"
components:
  button-primary:
    backgroundColor: "{colors.ink-primary}"
    textColor: "{colors.ink-on-primary}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  button-primary-hover:
    backgroundColor: "{colors.ink-primary}"
    textColor: "{colors.ink-on-primary}"
    rounded: "{rounded.lg}"
  button-outline:
    backgroundColor: "{colors.surface-paper}"
    textColor: "{colors.ink-foreground}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  button-outline-hover:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.ink-foreground}"
    rounded: "{rounded.lg}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-foreground}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  input-default:
    backgroundColor: "transparent"
    textColor: "{colors.ink-foreground}"
    rounded: "{rounded.lg}"
    padding: "4px 10px"
    height: "32px"
  input-focus:
    backgroundColor: "transparent"
    textColor: "{colors.ink-foreground}"
    rounded: "{rounded.lg}"
  panel-section-header:
    textColor: "{colors.ink-muted}"
    typography: "{typography.label}"
  config-panel:
    backgroundColor: "{colors.surface-paper}"
    width: "320px"
    padding: "20px"
  canvas-pane:
    backgroundColor: "{colors.surface-canvas}"
    padding: "32px"
---

# Design System: Micro-Interaction Playground

## 1. Overview

**Creative North Star: "The Quiet Workbench"**

The playground is a workbench. The bench surface is neutral, almost colorless, lit
evenly. The tools (sliders, dropdowns, toggles) line the rim, labeled in small caps so
they read without competing. The work, the actual component being tuned, sits in the
middle of the bench. The only thing that moves on this bench is the work itself.

This is not a SaaS product, not a design-system docs site, and not a CodePen-style
demo. It rejects gradient heroes, big-number metric cards, encyclopedic nav trees, and
novelty color. The voice is plain and direct. The chrome is type-driven, with
hairline borders, generous whitespace, and OKLCH-pure neutrals that recede until the
user looks at them. Numbers, durations in milliseconds, spring stiffness, cubic
bezier handles, are visible at all times in monospace where the value lives.

The system practices what it preaches. Every transition in the chrome (button press,
panel switch, focus ring, toggle, share-button confirmation) is itself a piece of
restrained motion. A designer using the playground should feel that the tool was built
by someone who cares about the same details they care about.

**Key Characteristics:**

- Monochromatic by intent. One destructive accent for warnings, otherwise pure neutrals.
- Type-driven hierarchy. Geist Sans for everything; Geist Mono for numeric truth.
- Flat by default. Borders carry the boundary; shadows appear only on overlays.
- Direct manipulation. Inline sliders and toggles beat tabs and overlays.
- Quiet chrome, loud canvas. The pane backgrounds are slightly muted (`oklch(0.97 0 0)`)
  so the canvas reads as a stage, not as a competing surface.

## 2. Colors

A pure-neutral OKLCH palette with one destructive accent. Lightness varies, chroma is
zero. The absence of brand color is the doctrine, the motion in the canvas is the only
chromatic event.

### Primary

- **Ink Primary** (`oklch(0.205 0 0)`): Dominant text color and the fill for primary
  buttons, dropdown anchors, and the toggle's active thumb. This is the only "loud"
  neutral.
- **Ink On Primary** (`oklch(0.985 0 0)`): Label color when sitting on Ink Primary,
  e.g. primary button text.

### Neutral

- **Surface Paper** (`oklch(1 0 0)`): The base sheet. Top bar, config panel,
  popover and dialog surfaces.
- **Surface Canvas** (`oklch(0.97 0 0)`): The pane background where demos render.
  Subtly muted from Paper to signal "this is the stage."
- **Surface Sidebar** (`oklch(0.985 0 0)`): A barely-perceptible step between Paper
  and Canvas, used by shadcn's sidebar primitive when present.
- **Surface Muted** (`oklch(0.97 0 0)`): Hover backgrounds, code snippet bg,
  unselected tabs, secondary buttons.
- **Ink Foreground** (`oklch(0.145 0 0)`): Body and headline text.
- **Ink Muted** (`oklch(0.556 0 0)`): Section labels, helper text, info icons,
  inactive states. The "spoken-quietly" voice.
- **Border Default / Input** (`oklch(0.922 0 0)`): All hairline borders across panels,
  pane dividers, and input fields. Single border value, no scale, intentional.
- **Ring Focus** (`oklch(0.708 0 0)`): Mid-lightness neutral for focus rings. Pairs
  with `ring-3` on shadcn primitives. Always visible, never colored.

### Signal

- **Signal Destructive** (`oklch(0.577 0.245 27.325)`): The single chromatic color in
  the system. Used only on destructive states (a "bad" preset warning, an error
  border, the destructive button variant). Its rarity is the entire point: when this
  color appears, it means something is wrong.

### Named Rules

**The No-Hue Rule.** All non-signal colors are OKLCH chroma 0. Greys are not warmed,
not cooled, not tinted toward any brand color. The motion in the canvas carries the
visual interest; the surface should not compete.

**The Signal Reservation Rule.** Signal Destructive is the only chromatic color in
the entire chrome. It must not be used decoratively, for emphasis, or as an A/B
identity color. If a new state needs distinguishing, find a non-color signal
(position, weight, label, monospace) first.

**Future Opportunity (advisory, not yet adopted).** A single ultra-low-chroma tint
(chroma 0.005–0.01, per the shared design laws) on neutrals would be permitted if a
quiet brand identity is later introduced. It must remain perceptually neutral and
must not violate the Signal Reservation Rule.

## 3. Typography

**Display Font:** Geist (with Geist Fallback, ui-sans-serif system stack)
**Body Font:** Geist (same family used everywhere except numeric data)
**Mono Font:** Geist Mono (with Geist Mono Fallback, ui-monospace system stack)

**Character:** Geist is a calm, slightly geometric humanist sans. It looks like the
typography of a serious tool. Geist Mono is the truth-telling counterpart: every
slider value, duration in milliseconds, spring stiffness, and cubic bezier handle
appears in Geist Mono where the value lives.

### Hierarchy

- **Display** (Geist 600, 1.5rem / 24px, line-height 1.2, letter-spacing -0.01em):
  Reserved for the top-bar product title and any future hero text. Used sparingly.
- **Headline** (Geist 600, 1rem / 16px, line-height 1.3): Modal titles, code-snippet
  tab headings. The "section above a section" level.
- **Title** (Geist 600, 0.875rem / 14px, line-height 1.35): Default emphasis weight
  inside the playground (top-bar product title, button labels, tab labels).
- **Body** (Geist 400, 0.875rem / 14px, line-height 1.5): Default text size for the
  whole tool. Inputs, dropdown items, panel descriptions.
- **Label** (Geist 600, 0.625rem / 10px, line-height 1, letter-spacing 0.08em,
  UPPERCASE): Panel section headers ("PRESET", "ANIMATION", "CODE"), pane labels
  ("A", "B"). The quiet voice that orients the user without shouting.
- **Mono** (Geist Mono 400, 0.6875rem / 11px, line-height 1.4): Code snippets, raw
  numeric values where honesty matters more than friendliness.

### Named Rules

**The Honest Number Rule.** Any value that a user can change, duration, easing
handle, stiffness, mass, position, must appear somewhere visible in Geist Mono. The
slider shows the feel; the monospace number shows the truth. Don't hide the number
behind a friendly label.

**The Quiet Label Rule.** Section headers use the Label scale, not Title. They
orient; they don't announce. If a header is shouting, switch it to Label and add
breathing room above it instead.

## 4. Elevation

Flat by default. Surfaces sit on the page; depth is carried by hairline borders
(`oklch(0.922 0 0)`) and subtle background contrast (Canvas at `oklch(0.97 0 0)` vs
Paper at `oklch(1 0 0)`). The interface looks pressed rather than stacked.

Shadows are reserved for the few surfaces that genuinely float above the page,
popovers, dropdowns, modals, toasts, and they must read as physical separation
from the canvas, not as decoration.

### Shadow Vocabulary

- **Overlay-soft** (`box-shadow: 0 4px 16px oklch(0 0 0 / 0.08)`): Default for
  popovers and dropdowns. Diffuse, low-contrast, the floating surface barely casts
  a shadow because it is barely above the page.
- **Overlay-anchored** (`box-shadow: 0 12px 32px oklch(0 0 0 / 0.12)`): Modals and
  toasts. The dialog is meaningfully separated from the canvas; the shadow says so.

### Named Rules

**The Flat-By-Default Rule.** Cards, panels, top bars, and pane backgrounds are
flat. They have a border or a subtle background change, never a shadow. If a
component needs a shadow to read, redesign the boundary instead.

**The Earned Shadow Rule.** A shadow appears only on a surface that is physically
detached from the page (popover, dropdown, modal, toast). It must be diffuse and
low-contrast, soft glow, not hard drop. Hard, dark, or stacked shadows are
prohibited.

## 5. Components

The component philosophy is **refined, precise, slightly tactile**. Components are
visible but understated. Solid fills on primary action only, clear hairline borders
everywhere else, small radii (`0.5rem`–`0.625rem`), and motion on hover/press that
feels calibrated rather than enthusiastic.

### Buttons

- **Shape:** rounded `0.625rem` (10px) on default size, slightly smaller (`min(0.5rem, 12px)`)
  on `sm` and `xs` sizes. No square corners; no pills outside chips.
- **Default size:** 32px height, 10px horizontal padding, Title weight, 14px font.
- **Primary** (`bg-primary`, `text-primary-foreground`): Ink Primary fill, white-ish
  label. Used for the canonical action of a pane or panel (Trigger both, Add chip,
  Copy code). On hover via anchor: 80% opacity fill (`bg-primary/80`).
- **Outline** (`border-border`, `bg-background`): Hairline neutral border on Paper.
  Used for secondary actions (Swap, the secondary trigger button, dropdown anchors).
  Hover background shifts to Surface Muted.
- **Ghost** (transparent): Used for tertiary actions and icon-only controls where the
  button should disappear at rest. Hover background shifts to Surface Muted.
- **Destructive** (`bg-destructive/10`, `text-destructive`): The only place Signal
  Destructive appears in interactive chrome. Soft tinted background, full-saturation
  label. Rare.
- **Focus:** `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50`,
  visible ring on Tab navigation, never on mouse click. Universal.
- **Press feedback:** `active:not-aria-[haspopup]:translate-y-px`, one pixel of
  downward translation on active. The chrome's signature press feel, always 1px.

### Inputs / Fields

- **Shape:** rounded `0.625rem` (10px). 32px height. 10px horizontal padding.
- **Default state:** transparent background, hairline border (Border Default),
  Ink Foreground text, Ink Muted placeholder.
- **Focus:** border shifts to Ring Focus and a 3px ring at 50% opacity appears
  around it. No glow, no inset, no color.
- **Invalid:** border shifts to Signal Destructive, ring appears at 20% opacity.
- **Disabled:** background fills with Surface Muted at 50% opacity, pointer events
  off, cursor not-allowed.

### Sliders

- **Track:** 4px tall, rounded full, Surface Muted bg. The indicator (filled portion)
  is Ink Primary. The whole component reads as a tiny pressed channel with a tiny
  raised pin.
- **Thumb:** 12px circle, white fill, Ring Focus border. On hover/focus/active a 3px
  ring at 50% opacity appears. Thumb has a generous invisible hit area
  (`after:-inset-2`) so dragging is forgiving.
- **Numbers:** the actual value is always shown beside the slider in Geist Mono (the
  Honest Number Rule).

### Toggles

- **Track:** 56px × 24px, rounded full. Background shifts between Surface Muted (off)
  and Ink Primary (on), tween 200ms.
- **Thumb:** 24px circle, white fill, sliding 28px between positions. The motion is
  symmetric (4px gap on the leading edge in both states).

### Tabs

- **List:** small (height ~28px), Surface Muted background, rounded.
- **Trigger:** unselected = Ink Muted on transparent; selected = Ink Foreground on
  Paper with a hairline shadow underneath the active tab (a single subtle pressed
  pill).

### Panel + Panel Section

- **Config panel:** 320px wide, full-height aside on the right, Paper background,
  hairline left border, 20px padding, vertical stack with 24px gaps between
  sections.
- **Panel section header:** Label scale (10px, uppercase, +0.08em letter-spacing,
  Ink Muted). 12px gap below header to the section's controls.

### Canvas + Pane

- **Pane:** flex-1, Surface Canvas background, 32px internal padding. The slight
  background step from Paper signals "stage."
- **Pane label:** absolute top-left (3 / 3 in shadcn spacing), Label scale, Ink Muted.
  Carries A/B identity by position and label, never by color (per the Color rule in
  PRODUCT.md).
- **Pane divider:** 1px Border Default vertical line in side-by-side mode.

### Code Snippet

- **Container:** rounded, Surface Muted background, hairline border, 8px padding,
  Mono scale text. A small copy button sits in the top-right corner; on copy it
  flips to a checkmark for 1.5 seconds.

### Tooltip

- Dark inverted: Ink Primary background, Paper text, small radius, no shadow. Used
  for warnings ("Bounce requires spring animation"), info hints, etc.

## 6. Do's and Don'ts

### Do:

- **Do** keep all non-signal colors at OKLCH chroma 0. Greys are pure greys. (The
  No-Hue Rule.)
- **Do** show every adjustable value as a number in Geist Mono somewhere visible.
  (The Honest Number Rule.)
- **Do** use Label scale (`text-[10px] font-semibold uppercase tracking-wider
  text-muted-foreground`) for section headers, pane labels, and any orientation
  copy. Title weight is for actual UI elements.
- **Do** rely on hairline borders (`oklch(0.922 0 0)`) for boundaries. Borders carry
  the structure of the interface.
- **Do** keep the press feedback at exactly 1px translateY on active state. Every
  button. Consistency is the signature.
- **Do** use `focus-visible:` (not `focus:`) so the focus ring appears for keyboard
  users only. Universal across every interactive element.
- **Do** put the canvas on Surface Canvas (`oklch(0.97 0 0)`) and the chrome on
  Surface Paper (`oklch(1 0 0)`). The 3% lightness step is the stage cue.
- **Do** respect `prefers-reduced-motion` for chrome (panel transitions, button
  feedback, toggle animations). Demos inside the canvas keep animating, because
  that's the product.
- **Do** carry A/B pane identity through position and label, never through color
  alone. (Color is never the only signal.)

### Don't:

- **Don't** introduce a brand accent color. The system is monochromatic by intent.
  If a "primary" identity is needed, it lives in motion and type, not hue. (The
  No-Hue Rule.)
- **Don't** use Signal Destructive (`oklch(0.577 0.245 27.325)`) for anything other
  than destructive/error/warning states. No decorative red, no "important" red, no
  active-state red. (The Signal Reservation Rule.)
- **Don't** ship a gradient hero, a big-number metric card, or a blue-accent dashboard
  template. The playground is not a SaaS product. (From PRODUCT.md anti-references.)
- **Don't** build encyclopedic chrome, deep nav trees, long token-table sidebars,
  multi-level docs navigation. The playground is direct, not a design-system docs
  site. (From PRODUCT.md anti-references.)
- **Don't** introduce playful illustrations, novelty fonts, or "fun demo" coloring.
  This is an instrument. (From PRODUCT.md anti-references.)
- **Don't** apply shadows to flat surfaces (cards, panels, top bars, panes). Shadows
  appear only on overlays. (The Flat-By-Default Rule, The Earned Shadow Rule.)
- **Don't** use hard, dark, or stacked drop shadows. Overlays use diffuse low-contrast
  shadows only.
- **Don't** use `border-left` or `border-right` greater than 1px as a colored stripe
  on alerts, callouts, or list items. (Universal: side-stripe borders are an absolute
  ban.)
- **Don't** use `background-clip: text` with a gradient. Solid colors only. Emphasis
  is via weight or size. (Universal: gradient text is an absolute ban.)
- **Don't** wrap chrome in glassmorphic blur as a default. Rare and purposeful or
  nothing.
- **Don't** hide important values behind a friendly label. If the user can change
  it, the number must be visible. (The Honest Number Rule.)
- **Don't** rename or reposition panel section headers to make them louder. If a
  header needs more emphasis, add space above it; don't upscale the type.
- **Don't** put a focus ring on `:focus` (mouse). Only on `:focus-visible` (keyboard).
- **Don't** use em dashes in any UI copy or documentation. Use commas, colons,
  semicolons, periods, or parentheses. (Universal copy rule.)
