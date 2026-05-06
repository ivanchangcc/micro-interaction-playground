## Todos
[x] Phase 0 — Task 1: Scaffold Next.js project
[x] Phase 0 — Task 2: Add Vitest + RTL
[x] Phase 0 — Task 3: Init shadcn/ui + Motion
Checkpoint: Phase 0 complete
[] Phase 1 — Task 4: AnimationConfig types
[] Phase 1 — Task 5: Default configs (TDD)
[] Phase 1 — Task 6: Component registry (TDD)
[] Phase 1 — Task 7: URL state serializer (TDD)
[] Phase 1 — Task 8: URL state parser (TDD)
[] Phase 1 — Task 9: Presets (TDD)
[] Phase 1 — Task 10: configToCss / configToMotion (TDD)
[] Phase 1 — Task 11: useAnimationStyle hook
Checkpoint: Phase 1 complete
[] Phase 2 — Task 12: TopBar + ShareButton + SideBySideToggle
[] Phase 2 — Task 13: ComponentPicker
[] Phase 2 — Task 14: Canvas wrapper
Checkpoint: Phase 2 complete
[] Phase 3 — Task 15: ConfigPanel skeleton
[] Phase 3 — Task 16: AnimationControls (tween + spring)
[] Phase 3 — Task 17: CubicBezierEditor
[] Phase 3 — Task 18: PresetPicker
[] Phase 3 — Task 19: CodeSnippet
Checkpoint: Phase 3 complete
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

