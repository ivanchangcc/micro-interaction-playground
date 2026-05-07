# Playground v2 — Phase 7 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship targeted fixes, polish, and three simple new micro-interactions across the playground without introducing new architecture (no `componentOptions` type system, no canonical trigger registry, no scale-to-fit). All changes covered here use what already exists in v1.

**Architecture:** Surgical edits to existing components. No new lib code, no new types. Each task touches ≤2 files. Phase 7 ships independently of Phase 8.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui (base-nova), Motion 12.38, Vitest 4 + @testing-library/react.

**Spec:** [`docs/superpowers/specs/2026-05-07-playground-v2-design.md`](../specs/2026-05-07-playground-v2-design.md)

---

## Sub-phase 7a — Layout & dimension fixes

5 items: modal fullscreen, toast phone size, stepper sizing & alignment, search position lock, toggle padding fix.

### Task 1: Modal — drop fake "Demo app" frame

**Files:**
- Modify: `components/demos/ModalDemo.tsx` (rewrite whole file)

**Why:** Spec §7 — modal currently wraps itself in a 420×280 fake-app frame with a header bar. The modal is positioned within that small box. v2 removes the frame; pane shows just an "Open modal" button; backdrop and dialog scope to the pane.

- [ ] **Step 1: Rewrite the file**

```tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import type { DemoProps } from './index';

export default function ModalDemo({ config }: DemoProps) {
  const [open, setOpen] = useState(false);
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      {isSpring ? (
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={motionTransition}
                className="absolute inset-0 bg-black/40"
                onClick={() => setOpen(false)}
              />
              <motion.div
                key="dialog"
                initial={{ opacity: 0, scale: 0.94, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 8 }}
                transition={motionTransition}
                className="absolute left-1/2 top-1/2 w-72 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-4 shadow-xl"
              >
                <h3 className="text-sm font-semibold">Modal title</h3>
                <p className="mt-1 text-xs text-muted-foreground">Body text. Click outside to close.</p>
                <div className="mt-4 flex justify-end">
                  <Button size="sm" onClick={() => setOpen(false)}>Close</Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      ) : (
        <>
          <div
            className="absolute inset-0 bg-black"
            style={{
              opacity: open ? 0.4 : 0,
              pointerEvents: open ? 'auto' : 'none',
              transition: 'opacity var(--duration) var(--easing)',
              ...cssStyle,
            }}
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute left-1/2 top-1/2 w-72 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-4 shadow-xl"
            style={{
              opacity: open ? 1 : 0,
              transform: `translate(-50%, -50%) scale(${open ? 1 : 0.94}) translateY(${open ? 0 : 8}px)`,
              pointerEvents: open ? 'auto' : 'none',
              transition: 'opacity var(--duration) var(--easing), transform var(--duration) var(--easing)',
              ...cssStyle,
            }}
          >
            <h3 className="text-sm font-semibold">Modal title</h3>
            <p className="mt-1 text-xs text-muted-foreground">Body text. Click outside to close.</p>
            <div className="mt-4 flex justify-end">
              <Button size="sm" onClick={() => setOpen(false)}>Close</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

The change vs current: outer `<div>` is `relative flex h-full w-full items-center justify-center` (no fixed size, no fake-app frame, no header bar). The backdrop covers the pane (`absolute inset-0`); the dialog stays at fixed pixel size (288px wide).

- [ ] **Step 2: Update Pane wrapper to provide a positioning context**

The Modal uses `absolute inset-0` for its backdrop. For that to scope to the pane (not escape), the Pane needs `position: relative`. Check `components/playground/Canvas.tsx` line 47 — the Pane already has `relative`. Confirm.

- [ ] **Step 3: Run smoke tests**

```
npm test -- ModalDemo
```

Expected: existing smoke tests still pass (they only assert the demo renders). If they reference the "Demo app" header text, update them.

- [ ] **Step 4: Commit**

```bash
git add components/demos/ModalDemo.tsx
git commit -m "fix(modal): drop fake demo-app frame; backdrop fills pane"
```

---

### Task 2: Toast — phone preview 390×880

**Files:**
- Modify: `components/demos/ToastDemo.tsx`

**Why:** Spec §Toast — phone preview should be 390×880. Currently it's whatever the demo renders at. Hardcoded for now (Phase 8a-ii adds scale-to-fit; this task just sets the logical size — it may overflow the pane temporarily, which is fine for Phase 7).

- [ ] **Step 1: Read the current file to understand the structure**

```bash
cat components/demos/ToastDemo.tsx
```

- [ ] **Step 2: Find the outer phone-preview wrapper** — typically a `div` with explicit width/height styling (e.g., `h-[600px] w-[300px]` or similar). Replace those Tailwind classes with `h-[880px] w-[390px]`.

- [ ] **Step 3: Smoke-test**

```
npm test -- ToastDemo
```

Expected: passes (smoke tests just assert render).

- [ ] **Step 4: Manual check** — start dev server, switch to Toast component, fire a toast. Phone is now 390×880; will likely overflow the pane vertically. That's acceptable for Phase 7 — Phase 8a-ii adds scale-to-fit.

```bash
npm run dev
```

Open `http://localhost:3000/?c=toast`, verify phone is the new size.

- [ ] **Step 5: Commit**

```bash
git add components/demos/ToastDemo.tsx
git commit -m "fix(toast): phone preview 390x880"
```

---

### Task 3: Stepper — larger size + back/next button alignment

**Files:**
- Modify: `components/demos/StepperDemo.tsx`

**Why:** Spec §Stepper — stepper should be larger (more visible transitions) and vertically aligned with the back/next button row (no trailing whitespace inside the stepper that pushes back/next out of alignment).

- [ ] **Step 1: Read the current file**

```bash
cat components/demos/StepperDemo.tsx
```

- [ ] **Step 2: Identify the step indicator dimensions and the stepper container**

Look for the step circles (likely `h-8 w-8` or `h-6 w-6`) and the connecting lines. The container probably has `max-w-md` or similar.

- [ ] **Step 3: Apply changes**

- Step indicators: bump from current size to `h-10 w-10` (or similar +33% larger).
- Connecting lines: scale proportionally.
- Stepper container: ensure it has the same width as the back/next button row (e.g., `w-[400px]`) so they share visual centerlines. No `mr-*` padding that creates trailing whitespace.
- Stepper outer wrapper: `flex flex-col items-center gap-4` so the stepper and the buttons stack with consistent center alignment.

The exact code depends on current state; the engineer reads the file and applies the geometric changes.

- [ ] **Step 4: Test manually**

```bash
npm run dev
```

Open `http://localhost:3000/?c=stepper`. Verify: stepper indicators visibly larger; back/next button row aligns vertically with stepper width (no large empty area to the right of the stepper).

- [ ] **Step 5: Smoke test**

```
npm test -- StepperDemo
```

- [ ] **Step 6: Commit**

```bash
git add components/demos/StepperDemo.tsx
git commit -m "fix(stepper): larger indicators; align with back/next button row"
```

---

### Task 4: Search input — position lock when suggestions appear

**Files:**
- Modify: `components/demos/SearchInputDemo.tsx`

**Why:** Spec §Search input — currently the suggestions render *below* the input as a sibling, pushing other elements down. If the demo is centered in its pane, opening suggestions visibly shifts the input upward. Fix: render suggestions in an absolutely-positioned overlay below the input so the input position never changes.

- [ ] **Step 1: Modify the file**

Change the outer wrapper from a flow-layout `<div>` to a positioning context, and the suggestions container to absolute. Replace the existing suggestion block (`{filtered.length > 0 && ...}`) with an absolutely-positioned overlay.

```tsx
// At the outer return, change:
//   <div className="w-full max-w-xs">
// To:
//   <div className="relative w-full max-w-xs">

// Then change the suggestions block from:
//   {filtered.length > 0 && (
//     <div className="mt-1 overflow-hidden rounded border bg-white shadow-sm" ...>
// To:
//   {filtered.length > 0 && (
//     <div className="absolute left-0 right-0 top-full mt-1 z-10 overflow-hidden rounded border bg-white shadow-sm" ...>
```

The full updated suggestions block:

```tsx
{filtered.length > 0 && (
  <div
    className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded border bg-white shadow-sm"
    style={{
      transition: isSpring ? undefined : 'all var(--duration) var(--easing)',
      ...(!isSpring ? cssStyle : {}),
    }}
  >
    {filtered.map((r) => (
      <div key={r} className="px-3 py-1.5 text-sm hover:bg-muted">{r}</div>
    ))}
  </div>
)}
```

- [ ] **Step 2: Wrap in a div that creates a relative positioning context**

The original outer container `<div className="w-full max-w-xs">` becomes `<div className="relative w-full max-w-xs">`. The inner `<div className="relative">` (around the input) is unchanged.

Wait — the input already has `relative` for the icons. The *outer* container needs `relative` for the suggestions to anchor to it. Apply the change.

- [ ] **Step 3: Test manually**

```bash
npm run dev
```

Open `http://localhost:3000/?c=search-input`. Type a query. Suggestions appear *over* whatever is below (don't push it). The input itself does not shift.

- [ ] **Step 4: Smoke test**

```
npm test -- SearchInputDemo
```

- [ ] **Step 5: Commit**

```bash
git add components/demos/SearchInputDemo.tsx
git commit -m "fix(search-input): position-lock when suggestions appear"
```

---

### Task 5: Toggle — fix asymmetric padding (active x: 24 → 28)

**Files:**
- Modify: `components/demos/ToggleDemo.tsx`

**Why:** Spec §Toggle — track 56px, thumb 24px. Inactive `x: 4` (4px on left); active `x: 24` (8px on right). Symmetric fix: active becomes `x: 28` (4px on right).

- [ ] **Step 1: Find both x:24 occurrences**

The file has two — one for spring (line 27), one for tween (line 34).

- [ ] **Step 2: Change them to 28**

```tsx
// Spring branch (was x: on ? 24 : 4):
animate={{ x: on ? 28 : 4 }}

// Tween branch (was translateX(${on ? 24 : 4}px)):
transform: `translateX(${on ? 28 : 4}px)`,
```

- [ ] **Step 3: Smoke test**

```
npm test -- ToggleDemo
```

- [ ] **Step 4: Manual check**

```bash
npm run dev
```

Open `http://localhost:3000/?c=toggle`. Toggle on and off; visually confirm 4px gap on the leading edge in both states.

- [ ] **Step 5: Commit**

```bash
git add components/demos/ToggleDemo.tsx
git commit -m "fix(toggle): symmetric 4px padding (active x:28)"
```

---

## Sub-phase 7b — Form & input polish

5 items: focus rings aligned, input field label centering, search placeholder + searchable list, search clear-icon centering, slider color.

### Task 6: Search input — placeholder + searchable component list

**Files:**
- Modify: `components/demos/SearchInputDemo.tsx`

**Why:** Spec §Search input — placeholder becomes "Search a component"; searchable values become the 17 component-picker labels (registry's `LABELS`). Old hardcoded list of 6 strings is removed.

- [ ] **Step 1: Update imports**

```tsx
import { COMPONENT_IDS, getComponentLabel } from '@/components/demos/registry';
```

- [ ] **Step 2: Replace the DATA constant**

Remove:
```tsx
const DATA = ['Modal', 'Toast', 'Toggle', 'Tabs', 'Dropdown', 'Slider'];
```

Add:
```tsx
const DATA = COMPONENT_IDS.map((id) => getComponentLabel(id));
```

(This produces 17 sentence-case labels.)

- [ ] **Step 3: Update placeholder**

Change `placeholder="Search…"` to `placeholder="Search a component"`.

- [ ] **Step 4: Smoke-test**

```
npm test -- SearchInputDemo
```

- [ ] **Step 5: Manual check**

```bash
npm run dev
```

Open `http://localhost:3000/?c=search-input`. Type "to" — should match "Toggle" and "Toast." Type "in" — should match "Input field" and "Search input." Type "z" — no matches.

- [ ] **Step 6: Commit**

```bash
git add components/demos/SearchInputDemo.tsx
git commit -m "feat(search-input): search the 17 playground components"
```

---

### Task 7: Search input — clear icon vertical centering when active

**Files:**
- Modify: `components/demos/SearchInputDemo.tsx`

**Why:** Spec §Search input — when input has content, the clear (X) icon visually sits closer to the top. Cause: the `<motion.button>` has only `top-1/2` but its scale animation changes its visual height during the transition, perceptually shifting the center.

The current button has `className="absolute right-2 top-1/2 -translate-y-1/2"` for both spring and tween. That's correct CSS for vertical centering. But the icon inside (`<X className="h-4 w-4" />`) is a 16px box that may have built-in baseline offsets.

The fix: ensure the button is a flex container with `items-center justify-center` and explicit dimensions matching the input height. Replace each `<button>` and `<motion.button>` outer with a wrapper that's vertically centered as a box, and the icon centers inside that box.

- [ ] **Step 1: Update the spring branch**

Change:
```tsx
<motion.button
  key="clear"
  initial={{ opacity: 0, scale: 0.6 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.6 }}
  transition={motionTransition}
  onClick={() => setQ('')}
  className="absolute right-2 top-1/2 -translate-y-1/2"
>
  <X className="h-4 w-4" />
</motion.button>
```

To:
```tsx
<motion.button
  key="clear"
  initial={{ opacity: 0, scale: 0.6 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.6 }}
  transition={motionTransition}
  onClick={() => setQ('')}
  className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center"
  aria-label="Clear"
>
  <X className="h-4 w-4" />
</motion.button>
```

- [ ] **Step 2: Update the tween branch**

Change:
```tsx
<button
  onClick={() => setQ('')}
  aria-hidden={!q}
  className="absolute right-2 top-1/2 -translate-y-1/2"
  ...
>
  <X className="h-4 w-4" />
</button>
```

To:
```tsx
<button
  onClick={() => setQ('')}
  aria-hidden={!q}
  className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center"
  aria-label="Clear"
  style={{ /* unchanged */ }}
>
  <X className="h-4 w-4" />
</button>
```

The key change: explicit `flex h-5 w-5 items-center justify-center` makes the button a centered flex box, so the icon is centered regardless of font baseline quirks.

- [ ] **Step 3: Smoke-test**

```
npm test -- SearchInputDemo
```

- [ ] **Step 4: Manual check**

```bash
npm run dev
```

Open `http://localhost:3000/?c=search-input`, type a query, inspect the X button — vertically centered relative to the input.

- [ ] **Step 5: Commit**

```bash
git add components/demos/SearchInputDemo.tsx
git commit -m "fix(search-input): vertically center clear icon"
```

---

### Task 8: Input field — label vertical centering

**Files:**
- Modify: `components/demos/InputFieldDemo.tsx`

**Why:** Spec §Input field — label has unequal top/bottom padding at default state, so it appears off-center. Fix: equal vertical padding.

- [ ] **Step 1: Read the file**

```bash
cat components/demos/InputFieldDemo.tsx
```

- [ ] **Step 2: Identify the label element and its positioning style**

The InputFieldDemo likely has a floating-label pattern: label sits inside the input's bounding box at default, slides up to the top when focused/filled. The "default" position uses `top-1/2 -translate-y-1/2` or absolute coordinates. Verify by reading.

- [ ] **Step 3: Apply the fix**

If the label uses absolute positioning with `top-1/2 -translate-y-1/2`, that's already centered. If it uses padding (e.g., `pt-3`) without matching `pb-3`, equalize them. If it uses fixed `top-X` coordinates that don't match the input's centerline, recompute: input height H → label `top: (H - labelH) / 2` and remove any vertical translate.

The exact change depends on the implementation; the engineer reads the file and applies the geometric fix.

- [ ] **Step 4: Smoke-test**

```
npm test -- InputFieldDemo
```

- [ ] **Step 5: Manual check**

```bash
npm run dev
```

Open `http://localhost:3000/?c=input-field`. Empty state: label vertically centered. Focus: label slides up.

- [ ] **Step 6: Commit**

```bash
git add components/demos/InputFieldDemo.tsx
git commit -m "fix(input-field): vertically center label at default state"
```

---

### Task 9: Aligned focus state across input/search/dropdown

**Files:**
- Modify: `components/demos/InputFieldDemo.tsx`
- Modify: `components/demos/SearchInputDemo.tsx`
- Modify: `components/demos/DropdownDemo.tsx`

**Why:** Spec §Search input + §config panel — focus rings on input field, search input, and dropdown should match (same color, same width, same offset). Today they may use different ring colors or widths because each demo styles its trigger independently.

- [ ] **Step 1: Define the canonical focus ring**

We'll use Tailwind's `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none`. This matches the shadcn defaults.

For each input/trigger:

```
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
```

- [ ] **Step 2: Apply to InputFieldDemo's `<input>`**

Find the `<input>` element. Add the focus classes to its `className`. Remove any existing focus-related classes that conflict (e.g., `focus:border-blue-500`).

- [ ] **Step 3: Apply to SearchInputDemo's `<input>`**

Same change to the `<input>` in `components/demos/SearchInputDemo.tsx`.

- [ ] **Step 4: Apply to DropdownDemo's trigger**

The dropdown trigger is the button that opens the dropdown menu. Find it and apply the same focus classes.

- [ ] **Step 5: Smoke-test**

```
npm test
```

Expected: all tests still pass.

- [ ] **Step 6: Manual check**

```bash
npm run dev
```

Tab to each demo (Input field, Search input, Dropdown). Focus ring should look identical.

- [ ] **Step 7: Commit**

```bash
git add components/demos/InputFieldDemo.tsx components/demos/SearchInputDemo.tsx components/demos/DropdownDemo.tsx
git commit -m "fix: align focus rings across input/search/dropdown"
```

---

### Task 10: Slider — match black color of other components

**Files:**
- Modify: `components/demos/SliderDemo.tsx`

**Why:** Spec §Slider color — the slider's track-filled and thumb colors should match the black used elsewhere (`bg-foreground` / `#18181b`). Today's thumb uses `bg-foreground` already, so the issue is likely with the *native input range* styling, which uses browser-default colors.

This task just unifies colors. The full slider rework (single-thumb visual, increment, drag spring) lands in Phase 8d.

- [ ] **Step 1: Read the file**

```bash
cat components/demos/SliderDemo.tsx
```

- [ ] **Step 2: Style the native input range**

Native `<input type="range">` is browser-styled. To override, add CSS-pseudo classes via Tailwind arbitrary variants or a className. Add a class like:

```tsx
className="w-full appearance-none accent-foreground"
```

Tailwind v4 supports `accent-foreground` which maps to `accent-color: var(--foreground)`. This colors the native range's filled track and thumb consistently with `bg-foreground`.

If `accent-foreground` doesn't exist in the project's Tailwind config, use:

```tsx
className="w-full appearance-none [accent-color:#18181b]"
```

- [ ] **Step 3: Smoke-test**

```
npm test -- SliderDemo
```

- [ ] **Step 4: Manual check**

```bash
npm run dev
```

Open `http://localhost:3000/?c=slider`. The native range track and thumb should be black (matching the visual ball below).

- [ ] **Step 5: Commit**

```bash
git add components/demos/SliderDemo.tsx
git commit -m "fix(slider): use foreground color for native range"
```

---

## Sub-phase 7c — Component behavior tweaks

5 items: accordion multi-open, date picker rework (consolidated: width + date select + open transition), dropdown 8 options, chips tween fix, popover portal via PaneContext.

### Task 11: Accordion — allow multiple open

**Files:**
- Modify: `components/demos/AccordionDemo.tsx`

**Why:** Spec §Accordion — opening a panel should not close other open panels.

- [ ] **Step 1: Read the file**

```bash
cat components/demos/AccordionDemo.tsx
```

The Accordion is shadcn's `<Accordion>` which has a `type` prop: `"single"` (auto-close on new open) or `"multiple"` (independent panels).

- [ ] **Step 2: Change `type="single"` to `type="multiple"`**

Find the `<Accordion type="single" ...>` and change it to `<Accordion type="multiple" ...>`. If the Accordion is wrapped in `useState` for controlled value, the value type changes from `string` to `string[]`.

If it's uncontrolled, just change `type` and remove `collapsible` (shadcn's `collapsible` prop only exists on single-mode).

- [ ] **Step 3: Smoke-test**

```
npm test -- AccordionDemo
```

- [ ] **Step 4: Manual check**

```bash
npm run dev
```

Open `http://localhost:3000/?c=accordion`. Open item 1, then open item 2 — both stay open.

- [ ] **Step 5: Commit**

```bash
git add components/demos/AccordionDemo.tsx
git commit -m "feat(accordion): allow multiple panels open simultaneously"
```

---

### Task 12: Date picker — fixed width + date selection + open transition

**Files:**
- Modify: `components/demos/DatePickerDemo.tsx`

**Why:** Spec §Date picker (consolidated to 7c) — three changes ship together: fixed width (no reflow on month change), date selection (not just month), open transition driven by global config.

- [ ] **Step 1: Read the current file**

```bash
cat components/demos/DatePickerDemo.tsx
```

- [ ] **Step 2: Identify the structure**

The DatePickerDemo likely uses a popover-style panel that opens to show months OR a custom mini-calendar. Determine which. Based on the spec's wording ("currently only month selection"), it's likely a month selector — a list of month names.

- [ ] **Step 3: Replace the whole demo with a month + day grid calendar**

Use a fixed width (e.g., `w-[280px]`) for the calendar panel. Render: a header row with prev/next month buttons + month name; a 7-column day grid (Mon–Sun); 6 rows of date cells. Selected date is highlighted.

```tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import type { DemoProps } from './index';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function DatePickerDemo({ config }: DemoProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState({ month: 4, year: 2026 }); // May 2026
  const [selected, setSelected] = useState<{ day: number; month: number; year: number } | null>(null);
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const firstDow = (new Date(view.year, view.month, 1).getDay() + 6) % 7; // Mon=0
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length < 42) cells.push(null);

  function nudge(delta: number) {
    setView(({ month, year }) => {
      let m = month + delta;
      let y = year;
      while (m < 0) { m += 12; y -= 1; }
      while (m > 11) { m -= 12; y += 1; }
      return { month: m, year: y };
    });
  }

  const triggerLabel = selected
    ? `${MONTH_NAMES[selected.month]} ${selected.day}, ${selected.year}`
    : 'Pick a date';

  return (
    <div className="relative">
      <Button variant="outline" onClick={() => setOpen((v) => !v)}>
        <Calendar className="mr-2 h-4 w-4" />
        {triggerLabel}
      </Button>
      {isSpring ? (
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -4 }}
              transition={motionTransition}
              style={{ transformOrigin: 'top left' }}
              className="absolute left-0 top-full z-10 mt-2 w-[280px] rounded-lg border bg-white p-3 shadow-lg"
            >
              <CalendarPanel
                view={view}
                cells={cells}
                selected={selected}
                onPrev={() => nudge(-1)}
                onNext={() => nudge(1)}
                onPick={(day) => setSelected({ day, month: view.month, year: view.year })}
              />
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <div
          className="absolute left-0 top-full z-10 mt-2 w-[280px] rounded-lg border bg-white p-3 shadow-lg"
          style={{
            transformOrigin: 'top left',
            opacity: open ? 1 : 0,
            transform: `scale(${open ? 1 : 0.96}) translateY(${open ? 0 : -4}px)`,
            pointerEvents: open ? 'auto' : 'none',
            transition: 'opacity var(--duration) var(--easing), transform var(--duration) var(--easing)',
            ...cssStyle,
          }}
        >
          <CalendarPanel
            view={view}
            cells={cells}
            selected={selected}
            onPrev={() => nudge(-1)}
            onNext={() => nudge(1)}
            onPick={(day) => setSelected({ day, month: view.month, year: view.year })}
          />
        </div>
      )}
    </div>
  );
}

function CalendarPanel({
  view, cells, selected, onPrev, onNext, onPick,
}: {
  view: { month: number; year: number };
  cells: (number | null)[];
  selected: { day: number; month: number; year: number } | null;
  onPrev: () => void;
  onNext: () => void;
  onPick: (day: number) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <Button size="icon" variant="ghost" onClick={onPrev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">{MONTH_NAMES[view.month]} {view.year}</span>
        <Button size="icon" variant="ghost" onClick={onNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-2 grid grid-cols-7 gap-0.5 text-center text-[10px] text-muted-foreground">
        {DOW.map((d, i) => <div key={i}>{d}</div>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          const isSelected =
            day !== null && selected !== null &&
            selected.day === day && selected.month === view.month && selected.year === view.year;
          return (
            <button
              key={i}
              type="button"
              disabled={day === null}
              onClick={() => day !== null && onPick(day)}
              className={`h-7 rounded text-xs ${
                day === null
                  ? 'invisible'
                  : isSelected
                    ? 'bg-foreground text-background'
                    : 'hover:bg-muted'
              }`}
            >
              {day ?? ''}
            </button>
          );
        })}
      </div>
    </>
  );
}
```

Notes on what this delivers:
- **Fixed width:** `w-[280px]` on the panel. Switching months never changes the panel size.
- **Date selection:** clicking a day cell sets `selected`; the trigger label updates.
- **Open transition:** uses the global animation config (springs go through `<motion.div>`; tween path uses CSS variables on a regular `<div>`).

- [ ] **Step 4: Smoke-test**

```
npm test -- DatePickerDemo
```

- [ ] **Step 5: Manual check**

```bash
npm run dev
```

Open `http://localhost:3000/?c=date-picker`. Click trigger — panel fades+scales in. Switch months — panel width unchanged. Click a date — trigger label updates to e.g. "May 14, 2026."

- [ ] **Step 6: Commit**

```bash
git add components/demos/DatePickerDemo.tsx
git commit -m "feat(date-picker): rework — fixed width, date selection, open transition"
```

---

### Task 13: Dropdown — 8 options

**Files:**
- Modify: `components/demos/DropdownDemo.tsx`

**Why:** Spec §Dropdown — show 8 options (was 3). Labels: Apple, Banana, Cherry, Date, Elderberry, Fig, Grape, Honeydew.

- [ ] **Step 1: Read the file**

```bash
cat components/demos/DropdownDemo.tsx
```

- [ ] **Step 2: Replace the options array**

Find the array of strings the dropdown maps over (likely `['Option 1', 'Option 2', 'Option 3']` or similar). Replace with:

```tsx
const ITEMS = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape', 'Honeydew'];
```

If the dropdown panel has a fixed height that can't show 8 items, add `max-h-[280px] overflow-y-auto` to the panel content.

- [ ] **Step 3: Smoke-test**

```
npm test -- DropdownDemo
```

- [ ] **Step 4: Manual check**

```bash
npm run dev
```

Open `http://localhost:3000/?c=dropdown`. Open dropdown — 8 fruit names show.

- [ ] **Step 5: Commit**

```bash
git add components/demos/DropdownDemo.tsx
git commit -m "feat(dropdown): show 8 options"
```

---

### Task 14: Chips — fix tween animation

**Files:**
- Modify: `components/demos/ChipsDemo.tsx`

**Why:** Spec §Chips — tween animation doesn't work (currently broken). Likely cause: chips uses Motion's `AnimatePresence` + `popLayout` for spring path, but the tween path either doesn't exist or uses CSS that doesn't fire because chips are added/removed (not toggled).

- [ ] **Step 1: Read the file**

```bash
cat components/demos/ChipsDemo.tsx
```

Identify the tween branch (likely `if (!isSpring) ... else ...` or similar).

- [ ] **Step 2: Diagnose the bug**

Common issue: the tween branch uses CSS transitions for *opacity* but not for *scale*, or it triggers on a state that doesn't actually change visibly. Read the existing impl carefully.

If the tween path tries to use CSS-only transitions for inserts/removes, it won't work — CSS can't animate insert because the element doesn't exist before. Solution: use Motion's `AnimatePresence` for both branches, but on the tween branch, set `transition={configToMotionTransition(config)}` instead of using CSS variables.

- [ ] **Step 3: Refactor to use Motion for both branches**

Replace any CSS-only tween path with Motion. The pattern (looking at other demos like SearchInputDemo which has a similar issue):

```tsx
<AnimatePresence mode="popLayout">
  {chips.map((chip) => (
    <motion.div
      key={chip.id}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6 }}
      transition={motionTransition}
      // ...
    >
      {chip.label}
    </motion.div>
  ))}
</AnimatePresence>
```

`motionTransition` from `useAnimationStyle(config)` already returns the correct transition object whether the config is tween or spring — that's what `useAnimationStyle` is for. So the cleanest fix is: drop the `isSpring` branch entirely; always use Motion.

- [ ] **Step 4: Smoke-test**

```
npm test -- ChipsDemo
```

- [ ] **Step 5: Manual check**

```bash
npm run dev
```

Open `http://localhost:3000/?c=chips`. Switch to tween config in the panel. Add and remove chips — they animate in and out.

- [ ] **Step 6: Commit**

```bash
git add components/demos/ChipsDemo.tsx
git commit -m "fix(chips): use Motion for tween path"
```

---

### Task 15: Popover — portal to its pane via PaneContext

**Files:**
- Create: `components/playground/PaneContext.tsx`
- Modify: `components/playground/Canvas.tsx`
- Modify: `components/demos/PopoverDemo.tsx`

**Why:** Spec §6 — popover currently portals to `document.body`; in side-by-side mode it can render outside the pane. Fix: provide a per-pane container via React context; popover demo passes that container as the Radix portal target.

- [ ] **Step 1: Create PaneContext**

`components/playground/PaneContext.tsx`:

```tsx
'use client';

import { createContext, useContext } from 'react';

export const PaneContext = createContext<HTMLElement | null>(null);

export function usePaneContainer(): HTMLElement | null {
  return useContext(PaneContext);
}
```

- [ ] **Step 2: Modify Canvas.tsx to provide the context**

The current `Pane` component is internal. Wrap each pane's children with `<PaneContext.Provider value={paneRef.current}>`. The provider needs the actual DOM element, which means using a ref:

```tsx
'use client';

import { Button } from '@/components/ui/button';
import { Play, ArrowLeftRight } from 'lucide-react';
import { ReactNode, useRef, useState, useEffect } from 'react';
import { PaneContext } from './PaneContext';

type Props = {
  paneA: ReactNode;
  paneB?: ReactNode;
  sideBySide: boolean;
  onReplay: () => void;
  onSwap?: () => void;
};

export function Canvas({ paneA, paneB, sideBySide, onReplay, onSwap }: Props) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 overflow-hidden">
        {sideBySide ? (
          <>
            <Pane label="A">{paneA}</Pane>
            <div className="w-px bg-border" />
            <Pane label="B">{paneB}</Pane>
          </>
        ) : (
          <Pane>{paneA}</Pane>
        )}
      </div>
      <div className="flex h-12 items-center justify-center gap-2 border-t bg-background">
        <Button size="sm" onClick={onReplay}>
          <Play className="mr-2 h-3.5 w-3.5" />
          {sideBySide ? 'Trigger both' : 'Replay'}
        </Button>
        {sideBySide && onSwap && (
          <Button size="sm" variant="outline" onClick={onSwap}>
            <ArrowLeftRight className="mr-2 h-3.5 w-3.5" />
            Swap
          </Button>
        )}
      </div>
    </div>
  );
}

function Pane({ label, children }: { label?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setContainer(ref.current);
  }, []);

  return (
    <div ref={ref} className="relative flex flex-1 items-center justify-center bg-muted/40 p-8">
      {label && (
        <div className="absolute left-3 top-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
      )}
      <PaneContext.Provider value={container}>
        {children}
      </PaneContext.Provider>
    </div>
  );
}
```

The `useState` + `useEffect` is needed because refs aren't synchronously available on first render; we need to trigger a re-render after mount so the popover demo gets a valid container element.

- [ ] **Step 3: Modify PopoverDemo to use the container**

Read `components/demos/PopoverDemo.tsx`. The popover likely uses `@base-ui/react/popover` (since Select used `@base-ui/react/select` from Task 9 reading) or shadcn's wrapper. Find the `<PopoverContent>` (or equivalent) and route its portal target.

If using `@radix-ui/react-popover`:
```tsx
<Popover.Portal container={paneContainer}>
  <Popover.Content>...</Popover.Content>
</Popover.Portal>
```

If using `@base-ui/react/popover`:
```tsx
<Popover.Portal container={paneContainer}>
  <Popover.Positioner>...</Popover.Positioner>
</Popover.Portal>
```

If using shadcn's wrapper that doesn't expose a container prop, drill it through. Read the file first to see the actual API.

Add at the top:
```tsx
import { usePaneContainer } from '@/components/playground/PaneContext';
```

Inside the component:
```tsx
const paneContainer = usePaneContainer();
```

Pass to portal: `container={paneContainer ?? undefined}`.

- [ ] **Step 4: Smoke-test**

```
npm test
```

- [ ] **Step 5: Manual check**

```bash
npm run dev
```

Open `http://localhost:3000/?c=popover&sbs=1`. Open popover in pane A — it stays inside pane A. Open in pane B — stays in pane B. No bleed across the divider.

- [ ] **Step 6: Commit**

```bash
git add components/playground/PaneContext.tsx components/playground/Canvas.tsx components/demos/PopoverDemo.tsx
git commit -m "fix(popover): portal to pane container instead of document.body"
```

---

## Sub-phase 7d — Config panel polish

5 items: copy icon background, sentence-case picker labels, dropdown 4px gap, animation info tooltip, hide Replay in single mode.

### Task 16: Hide Replay button when side-by-side is off

**Files:**
- Modify: `components/playground/Canvas.tsx`
- Modify: `components/playground/PlaygroundShell.tsx`

**Why:** Spec §Side-by-side — Replay button should only appear in side-by-side mode. In single mode, the canvas footer is empty.

- [ ] **Step 1: Update Canvas.tsx footer**

In the Canvas component, change the footer rendering. The button row currently always renders. Wrap the inner buttons in `{sideBySide && (...)}`:

Find:
```tsx
<div className="flex h-12 items-center justify-center gap-2 border-t bg-background">
  <Button size="sm" onClick={onReplay}>
    <Play className="mr-2 h-3.5 w-3.5" />
    {sideBySide ? 'Trigger both' : 'Replay'}
  </Button>
  {sideBySide && onSwap && (
    <Button size="sm" variant="outline" onClick={onSwap}>
      <ArrowLeftRight className="mr-2 h-3.5 w-3.5" />
      Swap
    </Button>
  )}
</div>
```

Replace with:
```tsx
{sideBySide && (
  <div className="flex h-12 items-center justify-center gap-2 border-t bg-background">
    <Button size="sm" onClick={onReplay}>
      <Play className="mr-2 h-3.5 w-3.5" />
      Trigger both
    </Button>
    {onSwap && (
      <Button size="sm" variant="outline" onClick={onSwap}>
        <ArrowLeftRight className="mr-2 h-3.5 w-3.5" />
        Swap
      </Button>
    )}
  </div>
)}
```

- [ ] **Step 2: Smoke-test**

```
npm test -- Canvas
```

(If no test file exists for Canvas, add one as a sanity smoke test.)

- [ ] **Step 3: Manual check**

```bash
npm run dev
```

Open `http://localhost:3000/?c=toggle` (side-by-side off) — no footer. Toggle side-by-side on — footer shows Trigger both + Swap.

- [ ] **Step 4: Commit**

```bash
git add components/playground/Canvas.tsx
git commit -m "fix(canvas): hide replay/trigger row in single-pane mode"
```

---

### Task 17: ComponentPicker trigger — show sentence-case label

**Files:**
- Modify: `components/playground/ComponentPicker.tsx`

**Why:** Spec §Config panel — picker label visible at the trigger should be the sentence-case label, not the hyphenated id. Today: `<SelectValue />` shows the raw `value` prop ("icon-button"). Fix: render the label explicitly.

- [ ] **Step 1: Read the file**

The current ComponentPicker:

```tsx
<Select value={value} onValueChange={(v) => onChange(v as ComponentId)}>
  <SelectTrigger className="w-[200px]">
    <SelectValue />
  </SelectTrigger>
  ...
</Select>
```

`<SelectValue />` from `@base-ui/react/select` displays the selected value. We need to render the label.

- [ ] **Step 2: Replace SelectValue with explicit label**

Two options:
- Option A: pass a `placeholder` to `<SelectValue placeholder="..." />` — doesn't help here.
- Option B: render the label outside the SelectValue. The base-ui SelectValue takes children that override the default render. Check the base-ui API.

The cleanest approach using base-ui:

```tsx
<SelectTrigger className="w-[200px]">
  <SelectValue>{getComponentLabel(value)}</SelectValue>
</SelectTrigger>
```

If `<SelectValue>` doesn't accept children in the project's wrapper, render the label as a sibling:

```tsx
<SelectTrigger className="w-[200px]">
  <span>{getComponentLabel(value)}</span>
</SelectTrigger>
```

(Note: SelectTrigger renders a chevron; the span sits next to it.)

- [ ] **Step 3: Smoke-test**

```
npm test
```

- [ ] **Step 4: Manual check**

```bash
npm run dev
```

Open `http://localhost:3000/?c=icon-button`. The picker trigger shows "Icon button" (not "icon-button").

- [ ] **Step 5: Commit**

```bash
git add components/playground/ComponentPicker.tsx
git commit -m "fix(component-picker): show sentence-case label in trigger"
```

---

### Task 18: Dropdown menus — open below trigger with 4px gap

**Files:**
- Modify: `components/ui/select.tsx`

**Why:** Spec §Config panel — dropdown menus in the panel currently open *over* the trigger (overlay). User wants them below with 4px gap.

The `@base-ui/react/select` `SelectContent` accepts `sideOffset` for distance from the anchor, and `align` / `side` for placement. Configure these in `components/ui/select.tsx`.

- [ ] **Step 1: Read components/ui/select.tsx for SelectContent**

```bash
grep -A 10 "function SelectContent" components/ui/select.tsx
```

- [ ] **Step 2: Find and configure the Positioner**

`@base-ui/react/select` uses `<SelectPrimitive.Positioner>` for placement. It accepts `sideOffset={number}` and a `side` prop.

In the SelectContent function in `components/ui/select.tsx`, configure the positioner with `sideOffset={4}` and `side="bottom"` (or `"bottom-start"`).

Example modification — find the Positioner inside SelectContent and add:

```tsx
<SelectPrimitive.Positioner
  side="bottom"
  align="start"
  sideOffset={4}
  ...
>
```

The exact integration depends on how shadcn's wrapper organizes Positioner; read the file.

- [ ] **Step 3: Smoke-test**

```
npm test
```

- [ ] **Step 4: Manual check**

```bash
npm run dev
```

Open the playground. Click any panel dropdown (component picker, easing select, preset picker). Menu opens below the trigger with a 4px gap.

- [ ] **Step 5: Commit**

```bash
git add components/ui/select.tsx
git commit -m "fix(ui/select): open menu below trigger with 4px gap"
```

---

### Task 19: CodeSnippet — copy icon background

**Files:**
- Modify: `components/playground/CodeSnippet.tsx`

**Why:** Spec §Config panel — copy icon overlaps long lines of code. Add a background to the copy button so it's visually separate from the text.

- [ ] **Step 1: Read the file**

Already read. The copy button is:

```tsx
<Button size="icon" variant="ghost" className="absolute right-1 top-1 h-6 w-6" onClick={copy}>
  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
</Button>
```

- [ ] **Step 2: Add a solid background**

Change `variant="ghost"` to `variant="secondary"` (which has a solid bg) OR add an explicit bg class.

```tsx
<Button
  size="icon"
  variant="secondary"
  className="absolute right-1 top-1 h-6 w-6 bg-muted hover:bg-muted/80"
  onClick={copy}
>
  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
</Button>
```

- [ ] **Step 3: Smoke-test**

```
npm test
```

- [ ] **Step 4: Manual check**

```bash
npm run dev
```

Open the playground. Switch to a config that produces long code (spring with high stiffness, or cubic-bezier easing). Confirm the copy icon has a visible background and doesn't visually merge with the text.

- [ ] **Step 5: Commit**

```bash
git add components/playground/CodeSnippet.tsx
git commit -m "fix(code-snippet): add background to copy icon"
```

---

### Task 20: Animation section — info tooltip explaining tween vs spring

**Files:**
- Modify: `components/playground/PlaygroundShell.tsx`
- Modify: `components/playground/ConfigPanel.tsx` (extend `PanelSection` to accept an optional info node)

**Why:** Spec §Config panel — Animation section header should have an info icon (lucide `Info`); on hover, a tooltip shows designer-friendly tween/spring copy.

- [ ] **Step 1: Extend PanelSection to accept an `info` slot**

Modify `components/playground/ConfigPanel.tsx`:

```tsx
import { ReactNode } from 'react';

export function ConfigPanel({ children }: { children: ReactNode }) {
  return (
    <aside className="flex w-[320px] flex-col gap-6 overflow-y-auto border-l bg-background p-5">
      {children}
    </aside>
  );
}

export function PanelSection({
  title,
  info,
  children,
}: {
  title: string;
  info?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <span>{title}</span>
        {info}
      </h3>
      {children}
    </section>
  );
}
```

- [ ] **Step 2: Wire the info tooltip in PlaygroundShell**

Modify `components/playground/PlaygroundShell.tsx` — the `PanelTabContents` component. Pass an `info` node to the Animation `PanelSection`:

```tsx
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Inside PanelTabContents, replace:
//   <PanelSection title="Animation">
//     <AnimationControls ... />
//   </PanelSection>
// With:
<PanelSection
  title="Animation"
  info={
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" aria-label="What's the difference?">
            <Info className="h-3 w-3 text-muted-foreground" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[260px] text-xs leading-relaxed">
          <p className="font-semibold">Tween</p>
          <p>Set a duration (how long it takes) and an easing curve (the rhythm). Same every time. Use this when you want predictable, designed motion.</p>
          <p className="mt-2 font-semibold">Spring</p>
          <p>Physics-based. Set stiffness (snappy), damping (overshoot), and mass (heaviness). Duration emerges from the physics. Use this when you want motion that feels natural and responsive.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  }
>
  <AnimationControls config={config} onChange={onChange} />
</PanelSection>
```

If `@/components/ui/tooltip` doesn't exist, add it via `npx shadcn@latest add tooltip` first.

- [ ] **Step 3: Verify tooltip primitive is installed**

```bash
ls components/ui/tooltip.tsx
```

If not present:
```bash
npx shadcn@latest add tooltip
```

- [ ] **Step 4: Smoke-test**

```
npm test
```

- [ ] **Step 5: Manual check**

```bash
npm run dev
```

Hover the info icon next to "ANIMATION" in the panel — tooltip with the two-paragraph copy appears.

- [ ] **Step 6: Commit**

```bash
git add components/playground/ConfigPanel.tsx components/playground/PlaygroundShell.tsx
# If tooltip primitive added:
git add components/ui/tooltip.tsx
git commit -m "feat(panel): info tooltip on Animation section explaining tween vs spring"
```

---

## Sub-phase 7e — Simple new interactions using existing config

2 items: heart fill (icon button), text button hover bg shift.

### Task 21: IconButton — heart fill animation

**Files:**
- Modify: `components/demos/IconButtonDemo.tsx`

**Why:** Spec §Icon button — on click, the heart icon should change to a filled red variant with animation. The animation uses the global config (no new options yet — Phase 8c adds hover/press scale).

- [ ] **Step 1: Read the file**

```bash
cat components/demos/IconButtonDemo.tsx
```

The current demo likely uses `<Heart>` from lucide. Lucide's `<Heart>` is outlined; for filled, pass `fill="currentColor"` or use Tailwind's `fill-current`.

- [ ] **Step 2: Replace the demo with a click-toggle that fills the heart with red**

```tsx
'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import type { DemoProps } from './index';

export default function IconButtonDemo({ config }: DemoProps) {
  const [liked, setLiked] = useState(false);
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  return (
    <button
      type="button"
      onClick={() => setLiked((v) => !v)}
      aria-pressed={liked}
      className="grid h-12 w-12 place-items-center rounded-full hover:bg-muted"
    >
      {isSpring ? (
        <motion.span
          animate={{ scale: liked ? [1, 1.3, 1] : 1 }}
          transition={motionTransition}
          className="inline-flex"
        >
          <Heart
            className="h-6 w-6"
            fill={liked ? '#ef4444' : 'transparent'}
            color={liked ? '#ef4444' : 'currentColor'}
          />
        </motion.span>
      ) : (
        <span
          className="inline-flex"
          style={{
            transform: liked ? 'scale(1)' : 'scale(1)',
            transition: 'transform var(--duration) var(--easing)',
            ...cssStyle,
          }}
        >
          <Heart
            className="h-6 w-6"
            fill={liked ? '#ef4444' : 'transparent'}
            color={liked ? '#ef4444' : 'currentColor'}
            style={{
              transition: 'fill var(--duration) var(--easing), color var(--duration) var(--easing)',
              ...cssStyle,
            }}
          />
        </span>
      )}
    </button>
  );
}
```

Notes:
- Spring branch animates the wrapper's scale through a keyframe array `[1, 1.3, 1]` so it punches and returns. The fill+color change is instant on the icon (CSS can't tween SVG fill via Motion's spring directly, but the visual punch comes from the scale).
- Tween branch transitions `fill` and `color` on the SVG itself; the wrapper's scale is left static (could add a quick CSS scale animation by using a CSS class with `@keyframes`, but for v2 simplicity the tween path just transitions the color).

- [ ] **Step 3: Smoke-test**

```
npm test -- IconButtonDemo
```

- [ ] **Step 4: Manual check**

```bash
npm run dev
```

Open `http://localhost:3000/?c=icon-button`. Click the heart — it fills red with a punch (spring) or color tween (tween). Click again — unfills.

- [ ] **Step 5: Commit**

```bash
git add components/demos/IconButtonDemo.tsx
git commit -m "feat(icon-button): heart fill animation on click"
```

---

### Task 22: TextButton — hover state with bg shift

**Files:**
- Modify: `components/demos/TextButtonDemo.tsx`

**Why:** Spec §7e — text button needs a hover state so default and hover are distinguishable. Phase 7e adds a static bg color shift (no config). Phase 8c later adds configurable hover/press scale.

- [ ] **Step 1: Read the file**

```bash
cat components/demos/TextButtonDemo.tsx
```

- [ ] **Step 2: Add a hover bg class**

Find the `<button>` element. Add `hover:bg-muted` (or similar subtle bg) and a transition for it. Example:

```tsx
className="rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted"
```

If the button is currently using a particular shadcn variant, augment it. If it's a plain `<button>`, add the classes directly.

- [ ] **Step 3: Smoke-test**

```
npm test -- TextButtonDemo
```

- [ ] **Step 4: Manual check**

```bash
npm run dev
```

Open `http://localhost:3000/?c=text-button`. Hover over the button — subtle background appears.

- [ ] **Step 5: Commit**

```bash
git add components/demos/TextButtonDemo.tsx
git commit -m "feat(text-button): hover state with bg color shift"
```

---

## Final tasks

### Task 23: Update todos.md and CLAUDE.md

**Files:**
- Modify: `todos.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add Phase 7 task list to todos.md**

Append:

```markdown
## Phase 7 — Fixes & polish

[ ] Phase 7a — Task 1: Modal drop fake frame
[ ] Phase 7a — Task 2: Toast 390x880
[ ] Phase 7a — Task 3: Stepper sizing & alignment
[ ] Phase 7a — Task 4: Search input position lock
[ ] Phase 7a — Task 5: Toggle padding fix
[ ] Phase 7b — Task 6: Search placeholder + searchable list
[ ] Phase 7b — Task 7: Search clear icon centering
[ ] Phase 7b — Task 8: Input field label centering
[ ] Phase 7b — Task 9: Aligned focus states
[ ] Phase 7b — Task 10: Slider color
[ ] Phase 7c — Task 11: Accordion multi-open
[ ] Phase 7c — Task 12: Date picker rework (consolidated)
[ ] Phase 7c — Task 13: Dropdown 8 options
[ ] Phase 7c — Task 14: Chips tween fix
[ ] Phase 7c — Task 15: Popover portal via PaneContext
[ ] Phase 7d — Task 16: Hide Replay in single mode
[ ] Phase 7d — Task 17: ComponentPicker sentence-case label
[ ] Phase 7d — Task 18: Dropdown 4px gap below trigger
[ ] Phase 7d — Task 19: Copy icon background
[ ] Phase 7d — Task 20: Animation info tooltip
[ ] Phase 7e — Task 21: Heart fill animation
[ ] Phase 7e — Task 22: Text button hover bg
```

- [ ] **Step 2: Add a Phase 7 stub to CLAUDE.md**

Append at the bottom (under "## Implementation progress"):

```markdown
### 🚧 Phase 7 — Fixes & polish (in progress)

Plan: `docs/superpowers/plans/2026-05-07-playground-v2-phase-7.md`
Spec: `docs/superpowers/specs/2026-05-07-playground-v2-design.md`

Status: not started.
```

- [ ] **Step 3: Commit docs**

```bash
git add todos.md CLAUDE.md
git commit -m "docs: add Phase 7 task list and progress stub"
```

---

### Task 24: Final manual QA pass

- [ ] **Step 1: Run the full test suite**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 2: Run typecheck**

```bash
npm run build
```

Expected: builds without TypeScript errors.

- [ ] **Step 3: Manual QA**

Start the dev server:

```bash
npm run dev
```

Click through each component (using the picker) and verify:

- [ ] Toggle: 4px gap on both sides in both states
- [ ] Checkbox: works (no regression)
- [ ] Icon button: heart fills red on click
- [ ] Text button: hover bg appears
- [ ] Accordion: multiple panels open simultaneously
- [ ] Tabs: works (no regression)
- [ ] Stepper: larger; aligned with back/next
- [ ] Slider: native range is black
- [ ] Input field: label vertically centered
- [ ] Search input: placeholder "Search a component"; matches 17 components; clear icon vertically centered; suggestions don't push input
- [ ] Dropdown: 8 fruit options; opens below with 4px gap
- [ ] Popover: stays inside its pane in side-by-side
- [ ] Modal: no fake frame; covers pane
- [ ] Date picker: fixed width; can select a date; opens with animation
- [ ] Toast: 390x880 phone (may overflow; that's OK for Phase 7)
- [ ] Side menu: works (no regression)
- [ ] Chips: animations work for both tween and spring

Config panel checks:
- [ ] Component picker shows sentence-case labels (no hyphens)
- [ ] Animation section has info tooltip
- [ ] Copy icon has visible background
- [ ] Side-by-side off → no Replay button
- [ ] Side-by-side on → Trigger both + Swap buttons

- [ ] **Step 4: Commit**

```bash
git add todos.md
# Mark all tasks as [x]; if you find regressions, file follow-ups
git commit -m "docs: Phase 7 manual QA complete"
```

---

## Self-review checklist

Run these checks before declaring Phase 7 complete:

- [ ] All 22 spec items in Phase 7 are addressed by a task in this plan
- [ ] All tasks include exact file paths and complete code (no TBDs)
- [ ] All tasks have a smoke-test step
- [ ] All tasks have a manual-check step
- [ ] All tasks end with a commit
- [ ] PaneContext from Task 15 is imported correctly in PopoverDemo
- [ ] No task references types or functions defined later in Phase 8 (Phase 7 must work standalone)
