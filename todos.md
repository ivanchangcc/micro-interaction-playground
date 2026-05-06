## Todos
[x] Phase 0 — Task 1: Scaffold Next.js project
[x] Phase 0 — Task 2: Add Vitest + RTL
[x] Phase 0 — Task 3: Init shadcn/ui + Motion
Checkpoint: Phase 0 complete
[x] Phase 1 — Task 4: AnimationConfig types
[x] Phase 1 — Task 5: Default configs (TDD)
[x] Phase 1 — Task 6: Component registry (TDD)
[x] Phase 1 — Task 7: URL state serializer (TDD)
[x] Phase 1 — Task 8: URL state parser (TDD)
[x] Phase 1 — Task 9: Presets (TDD)
[x] Phase 1 — Task 10: configToCss / configToMotion (TDD)
[x] Phase 1 — Task 11: useAnimationStyle hook
Checkpoint: Phase 1 complete ✅
[x] Phase 2 — Task 12: TopBar + ShareButton + SideBySideToggle
[x] Phase 2 — Task 13: ComponentPicker
[x] Phase 2 — Task 14: Canvas wrapper
Checkpoint: Phase 2 complete ✅
[x] Phase 3 — Task 15: ConfigPanel skeleton
[x] Phase 3 — Task 16: AnimationControls (tween + spring)
[x] Phase 3 — Task 17: CubicBezierEditor
[x] Phase 3 — Task 18: PresetPicker
[x] Phase 3 — Task 19: CodeSnippet
Checkpoint: Phase 3 complete ✅
[] Phase 4 — Task 20: useUrlState hook
[] Phase 4 — Task 21: PlaygroundShell composition
Checkpoint: Phase 4 complete
[] Phase 5 — Task 22: Demo registry mechanism
[] Phase 5 — Task 23: ToggleDemo
[] Phase 5 — Task 24: CheckboxDemo
[] Phase 5 — Task 25: IconButton + TextButton demos
[] Phase 5 — Task 26: AccordionDemo
[] Phase 5 — Task 27: TabsDemo
[] Phase 5 — Task 28: StepperDemo
[] Phase 5 — Task 29: SliderDemo
[] Phase 5 — Task 30: InputFieldDemo
[] Phase 5 — Task 31: SearchInputDemo
[] Phase 5 — Task 32: DropdownDemo
[] Phase 5 — Task 33: PopoverDemo
[] Phase 5 — Task 34: ModalDemo
[] Phase 5 — Task 35: ToastDemo
[] Phase 5 — Task 36: DatePickerDemo
[] Phase 5 — Task 37: SideMenuDemo
[] Phase 5 — Task 38: ChipsDemo
Checkpoint: Phase 5 complete
[] Phase 6 — Task 39: Mobile notice
[] Phase 6 — Task 40: Smoke tests
[] Phase 6 — Task 41: Manual QA pass
Final code review for entire implementation

## Phase 0 Checkpoint — setup complete

### What's done:
✅ Task 1: Next.js 16.2.4 + React 19.2.4 + Tailwind v4 + TypeScript scaffolded with Turbopack
✅ Task 2: Vitest 4.1.5 + RTL 16.3.2 + jsdom installed; npm test runs cleanly
✅ Task 3: shadcn/ui initialized (15 primitives), Motion 12.38 installed
Branch state: feat/playground-implementation is 5 commits ahead of main, all pushed to GitHub.

### Notes from this phase:
shadcn v4 ships base-nova as its default style now (the plan said "New York" — base-nova is the modern equivalent, visually similar). I updated the plan to reflect this.
shadcn ended up in dependencies rather than devDependencies — that's how the v4 init writes it. Minor; can shuffle later if it bothers anyone.
Tooltip needs <TooltipProvider> wrapping. The plan handles this locally inside PresetPicker (Task 18), so no global change needed.
6 moderate npm audit warnings (transitive). Standard for fresh Next projects; not investigating.
Reviewer subagent hit a usage limit during Task 2's spec review, so I verified that one inline. For mechanical Phase 0 tasks this was fine; Phase 1 has real code (TDD lib utilities) where reviewer subagents add more value.
Next up: Phase 1 (Tasks 4–11) — animation lib code, all TDD. 8 small, focused tasks (types, defaults, registry, URL serializer, URL parser, presets, apply adapters, useAnimationStyle hook).

## Phase 1 Complete

### What's done
All 8 tasks done, 29 tests passing. Here's what was built:

File	What it does
lib/animation/types.ts	Core types: TweenConfig, SpringConfig, AnimationConfig, SLIDER_LIMITS
lib/animation/defaults.ts	DEFAULT_TWEEN (250ms Material curve) and DEFAULT_SPRING (iOS-feel)
components/demos/registry.ts	All 17 component IDs with human labels
lib/url-state.ts	Serialize/parse playground state to/from URL params
lib/animation/presets.ts	4 named presets per component (including 1 intentionally "bad" one)
lib/animation/apply.ts	Convert configs → CSS vars, CSS transition string, or Motion transition object
hooks/useAnimationStyle.ts	React hook wrapping all the above for use in demo components

## Phase 2 Complete

### What's done
✅ Task 12: TopBar (title + SideBySideToggle + ShareButton) — Toaster added to layout.tsx
✅ Task 13: ComponentPicker dropdown — shadcn Select with all 17 components
✅ Task 14: Canvas wrapper — single/side-by-side panes, Replay + Swap controls

### Notes from this phase:
No deviations from plan. ComponentPicker was temporarily stubbed in Task 12 and replaced with the real implementation in Task 13 to unblock TypeScript compilation.

## Phase 3 Complete

### What's done
✅ Task 15: ConfigPanel + PanelSection — 320px aside panel shell
✅ Task 16: AnimationControls + EasingSelect — tween/spring toggle, labeled sliders, CubicBezierEditor stub
✅ Task 17: CubicBezierEditor — 4 number inputs + live SVG curve preview
✅ Task 18: PresetPicker — preset dropdown with bad-preset warning tooltip (TooltipProvider local)
✅ Task 19: CodeSnippet — CSS + Motion code tabs with copy-to-clipboard button

### Notes from this phase:
- `formatEase` type simplified to `{ cubicBezier: number[] } | string` (complex conditional type caused TS error)
- `LabeledSlider.onValueChange` uses `Array.isArray` guard for shadcn Slider type compatibility
- CubicBezierEditor stub created in Task 16, replaced with real implementation in Task 17
Next up: Phase 4 (Tasks 20–21) — useUrlState hook + PlaygroundShell full composition.
