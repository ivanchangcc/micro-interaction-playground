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

## Picking up in a new session

1. Read this file and the plan: `docs/superpowers/plans/2026-05-05-micro-interaction-playground.md`
2. Read the file `todos.md` and understand what's been done already
3. Check out the feature branch: `git checkout feat/playground-implementation`
4. **Next task to execute: Task 15 — ConfigPanel skeleton** (first task of Phase 3)
5. Use the `superpowers:subagent-driven-development` skill to continue dispatching subagents per task.
6. Pause at each phase checkpoint (after Tasks 11, 14, 19, 21, 38, 41) for user review before continuing.
7. After completing each phase, update the progress table below and push to GitHub.

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

### 🔄 Phase 3 — Config panel (Tasks 15–19) — NEXT

ConfigPanel, AnimationControls, CubicBezierEditor, PresetPicker, CodeSnippet.

### ⏳ Phase 4 — State wiring (Tasks 20–21)

`useUrlState`, `PlaygroundShell` full composition.

### ⏳ Phase 5 — Demos (Tasks 22–38)

Registry mechanism + all 17 component demos.

### ⏳ Phase 6 — Polish (Tasks 39–41)

Mobile notice, smoke tests, manual QA.
