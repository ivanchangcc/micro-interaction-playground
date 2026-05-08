@AGENTS.md

# Micro-Interaction Playground

A single-page Next.js playground where users tweak animation configs (tween or spring) on 17 shadcn/ui components, compare two configs side-by-side, copy the result as code, and share configurations via URL.

## Authoritative documents

- **Spec:** `docs/superpowers/specs/2026-05-05-micro-interaction-playground-design.md` — what we're building and why.
- **Plan:** `docs/superpowers/plans/2026-05-05-micro-interaction-playground.md` — 41 tasks across 7 phases. Each task has exact file paths, full code, and a TDD-style step list. **Implement tasks in order.**

## Tech stack

- Next.js 16.2.4 (App Router) · React 19.2.4 · TypeScript 5
- Tailwind CSS v4 · shadcn/ui v4 (base-nova / Neutral) · Motion 12.38 (motion.dev) for springs
- Vitest 4.1.5 + @testing-library/react for tests
- Sonner for toast notifications
- Single page, fully client-rendered. URL is the source of truth for shared state.

## File structure (target)

Built up progressively as the plan executes:

```
app/                  # Next.js App Router
components/
  playground/         # shell, top bar, canvas, config panel, controls
  demos/              # one file per component (17 demos), plus registry
  ui/                 # shadcn primitives (added on demand)
hooks/                # useAnimationStyle, useUrlState
lib/
  animation/          # types, defaults, presets, apply
  url-state.ts        # serialize / parse playground state
test/                 # vitest setup
docs/superpowers/     # spec and plan
```

## Commands

```bash
npm run dev      # start Next dev server
npm run build    # production build
npm run lint     # eslint
npm test         # run vitest once
npm run test:watch
```

## Conventions

- Each `components/demos/*Demo.tsx` is isolated — it knows nothing about URL state, presets, or panel UI. It accepts `{ config: AnimationConfig; triggerKey: number }` and renders.
- Tween configs flow through CSS custom properties (`--duration`, `--easing`) on a wrapper. Demos use `transition: 'X var(--duration) var(--easing)'` for the property they animate.
- Spring configs flow through Motion's `<motion.div transition={{ type: 'spring', ... }}>`. Demos branch on `useAnimationStyle(config).isSpring`.
- TDD-strict for `lib/` and `hooks/`. Smoke tests only for demos and UI components — animation correctness is verified by playing the playground, not by snapshot tests.
- Once each phase is completed, update `CLAUDE.md` and `todos.md`

## Picking up in a new session

1. Read this file and the plan: `docs/superpowers/plans/2026-05-05-micro-interaction-playground.md`
2. Read the file `todos.md` and understand what's been done already
3. Check out the feature branch: `git checkout feat/playground-implementation`
4. **All 41 tasks complete. The playground is feature-complete.**
5. Final code review pending (see todos.md).
6. Push to GitHub and open a PR to merge `feat/playground-implementation` → `main` when ready.

---

## Implementation progress

Subagent-driven execution on branch `feat/playground-implementation`. Pausing at phase checkpoints for review.

### ✅ Phase 0 — Setup (Tasks 1–3) — COMPLETE

| Task | What | Commit | Notes |
|------|------|--------|-------|
| 1 | Scaffold Next.js | `6be19c6` | Next 16.2.4, React 19.2.4, Tailwind v4, Turbopack |
| 2 | Vitest + RTL | `f137967` | vitest 4.1.5, @testing-library/react 16.3.2 |
| 3 | shadcn/ui + Motion | `9d1fa7b` | 15 primitives, Motion 12.38, sonner |

**Decisions / deviations:**
- shadcn v4 defaults to `base-nova` style (not "New York" — modern equivalent, plan updated)
- `eslint.config.mjs` generated instead of `.eslintrc.json` (Next 16 flat-config; plan updated)
- `shadcn` package appears in `dependencies` (how v4 init writes it; low priority to move)
- Tooltip needs `<TooltipProvider>` wrap — handled locally inside `PresetPicker` (Task 18), no global wrap needed

---

### ✅ Phase 1 — Animation lib (Tasks 4–11) — COMPLETE

| Task | What | Commit | Notes |
|------|------|--------|-------|
| 4 | AnimationConfig types | `2b031d3` | `TweenConfig`, `SpringConfig`, `AnimationConfig`, `SLIDER_LIMITS` |
| 5 | Default configs | `620f6b7` | `DEFAULT_TWEEN` (250ms Material curve), `DEFAULT_SPRING` (iOS feel) |
| 6 | Component registry | `7789b78` | 17 component IDs, labels, `isComponentId`, `DEFAULT_COMPONENT_ID='toggle'` |
| 7 | URL serializer | `e19d2ee` | `serializeState` → URLSearchParams; `PlaygroundState` type |
| 8 | URL parser | `667a422` | `parseState` with fallbacks, clamping; 13 tests total in url-state |
| 9 | Presets | `0caa451` | 4 presets per component (Material, iOS spring, Snappy, Sluggish/bad) |
| 10 | Config adapters | `cabc806` | `configToCssVars`, `configToCssTransition`, `configToMotionTransition` |
| 11 | useAnimationStyle | `b139320` | Hook returning `cssStyle`, `motionTransition`, `isSpring` |

**Test suite:** 29 tests, 5 files, all passing.

**Decisions / deviations:** None — plan followed exactly.

---

### ✅ Phase 2 — Shell layout (Tasks 12–14) — COMPLETE

| Task | What | Commit | Notes |
|------|------|--------|-------|
| 12 | TopBar + SideBySideToggle + ShareButton | `e92a9f1` | Toaster added to layout.tsx; clipboard share |
| 13 | ComponentPicker dropdown | `87254b5` | shadcn Select, all 17 components |
| 14 | Canvas wrapper | `90ee279` | Single/side-by-side panes, Replay + Swap controls |

**Decisions / deviations:** None — plan followed exactly.

---

### ✅ Phase 3 — Config panel (Tasks 15–19) — COMPLETE

| Task | What | Commit | Notes |
|------|------|--------|-------|
| 15 | ConfigPanel + PanelSection | `387d77a` | 320px aside panel shell |
| 16 | AnimationControls + EasingSelect | `59bf1ff` | Tween/spring toggle, sliders, CubicBezierEditor stub |
| 17 | CubicBezierEditor | `ff64859` | 4 inputs + SVG curve preview |
| 18 | PresetPicker | `78e23c2` | Preset dropdown, bad-preset warning tooltip |
| 19 | CodeSnippet | `faf2d4d` | CSS + Motion tabs, copy button |

**Decisions / deviations:**
- `formatEase` type simplified from complex conditional to `{ cubicBezier: number[] } | string` for TypeScript compatibility
- `LabeledSlider.onValueChange` uses `Array.isArray` guard for Slider type compatibility

---

### ✅ Phase 4 — State wiring (Tasks 20–21) — COMPLETE

| Task | What | Commit | Notes |
|------|------|--------|-------|
| 20 | useUrlState hook | `73d7051` | Debounced URL writes, 3 TDD tests passing |
| 21 | PlaygroundShell + DemoFrame + page.tsx | `45d2ee5` | Full composition; dev server verified working |

**Decisions / deviations:** None — plan followed exactly. Dev server confirmed top bar, config panel, A/B tabs all render correctly.

---

### ✅ Phase 5 — Demos (Tasks 22–38) — COMPLETE

| Task | What | Commit | Notes |
|------|------|--------|-------|
| 22 | Demo registry + dynamic loader | `2b4873d` | `components/demos/index.tsx`; PlaygroundShell updated |
| 23–25 | Toggle, Checkbox, IconButton, TextButton | `8cdd20a` | Basic state toggle demos |
| 26–28 | Accordion, Tabs, Stepper | `8788894` | AnimatePresence, sliding indicator, step transitions |
| 29–31 | Slider, InputField, SearchInput | `37b5732` | Thumb catch-up, floating label, animated clear button |
| 32–34 | Dropdown, Popover, Modal | `e0c09a2` | Origin-based scale + fade, backdrop |
| 35–38 | Toast, DatePicker, SideMenu, Chips | `4d852bb` | Phone frame, month slide, drawer, popLayout |

**Test suite:** 32 tests, 6 files, all passing. Zero TypeScript errors.

**Decisions / deviations:**
- `configToMotionTransition` return type temporarily regressed to `any` during Task 26; fixed in spec review pass — `NAMED_TO_MOTION` now typed as `Record<string, Easing>` from `motion/react`

---

### ✅ Phase 6 — Polish (Tasks 39–41) — COMPLETE

| Task | What | Commit | Notes |
|------|------|--------|-------|
| 39 | Mobile notice | `77fb87e` | `MobileNotice` with `md:hidden`, shown below 768px |
| 40 | Smoke tests | `c135c1a` | 34 tests × all 17 demos × tween + spring |
| 41 | Manual QA pass | — | 66/66 tests pass, 0 TS errors, all flows verified |

**Decisions / deviations:**
- Mobile notice uses Tailwind `md:hidden` — no JS resize listener needed
- Smoke tests import demos directly to bypass `next/dynamic` in jsdom
- QA completed via code audit + curl + test suite (Playwright MCP was locked by another session)
- All 41 tasks complete. Playground is feature-complete per spec.

---

### ✅ Phase 7 — Fixes & polish — COMPLETE

Plan: `docs/superpowers/plans/2026-05-07-playground-v2-phase-7.md`
Spec: `docs/superpowers/specs/2026-05-07-playground-v2-design.md`
Branch: `feat/playground-v2-phase-7`

All 22 tasks complete. 66/66 tests pass. Zero TypeScript errors.

**Deviations:**
- Task 18 (dropdown 4px gap) was already implemented in the shadcn select component defaults — no code change needed.
- Popover PaneContext portal works but @base-ui/react/popover uses CSS transitions so spring config doesn't animate the popover open/close. Known limitation, deferred to Phase 8.
- DemoFrame required an additional `h-full` class (discovered during Task 1 code review) to allow modal backdrop to fill the pane.

---

### ✅ Phase 8 — Architecture & new options — COMPLETE

Plan: `docs/superpowers/plans/2026-05-07-playground-v2-phase-8.md`
Spec: `docs/superpowers/specs/2026-05-07-playground-v2-design.md`
Branch: `feat/playground-v2-phase-8`

All 17 implementation tasks complete. 102/102 tests pass. Zero TypeScript errors.

**What was built:**
- `lib/component-options/` — types, defaults, URL encode/decode for per-component options (popover position, toast direction, side menu kind/bounce/layered/side, dropdown bounce, icon/text button hover/press scale, slider increment + drag spring)
- `PlaygroundState` extended with `componentOptionsA`/`componentOptionsB`, round-tripped through URL
- `PaneScaler` — ResizeObserver-based scale-to-fit; logical sizes per component; DemoFrame wired
- `useDemoTrigger` hook + forwardRef pattern — all 17 demos converted; triggerKey plumbing removed
- Canvas `footerTrigger` system (single/dual); TRIGGER_SHAPES registry
- Component options panels in `components/playground/options/` for dropdown, icon-button, text-button, slider, popover, toast, side-menu
- SliderDemo fully rewritten (single thumb, drag spring, snap-to-increment)
- SideMenuDemo fully rewritten (slide/dissolve/scale/push, bounce, layered, left/right)

**Deviations:**
- ToastDemo direction: implemented as CSS positioning (top/bottom/left/right) + directional Motion enter/exit rather than Sonner's `position` prop (Sonner was used for the global toast; the phone-frame toast uses custom positioning for layout control)
- TooltipTrigger `asChild` not available in this shadcn build; disabled Switch sits directly inside TooltipTrigger (matches existing pattern from Task 13)
