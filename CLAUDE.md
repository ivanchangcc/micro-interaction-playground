@AGENTS.md

# Micro-Interaction Playground

A single-page Next.js playground where users tweak animation configs (tween or spring) on 17 shadcn/ui components, compare two configs side-by-side, copy the result as code, and share configurations via URL.

## Authoritative documents

- **Spec:** `docs/superpowers/specs/2026-05-05-micro-interaction-playground-design.md` — what we're building and why.
- **Plan:** `docs/superpowers/plans/2026-05-05-micro-interaction-playground.md` — 41 tasks across 7 phases. Each task has exact file paths, full code, and a TDD-style step list. **Implement tasks in order.**

## Tech stack

- Next.js 16 (App Router) · React 19 · TypeScript
- Tailwind CSS v4 · shadcn/ui (New York / Neutral) · Motion (motion.dev) for springs
- Vitest + @testing-library/react for tests
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

## Status

Tracked in the plan file's checkbox list. See `git log --oneline -20` for the latest commits.
