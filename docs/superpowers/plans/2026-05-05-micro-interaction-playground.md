# Micro-Interaction Playground Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page Next.js playground where users tune animation configs (tween or spring) on 17 shadcn/ui components, compare two configs side-by-side, copy the result as code, and share configurations via URL.

**Architecture:** Single Next.js App Router page, fully client-rendered. URL is the source of truth for shared state. CSS custom properties drive tween animations on shadcn primitives; Motion (motion.dev) drives spring animations. Each demo is an isolated component that receives `AnimationConfig` and a trigger key — it knows nothing about URL state, presets, or the panel UI.

**Tech Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Motion (motion.dev) · Vitest · @testing-library/react

---

## File Structure

```
app/
  layout.tsx                       # root layout
  page.tsx                         # the playground page (client)
  globals.css                      # tailwind + theme tokens
components/
  playground/
    PlaygroundShell.tsx            # top bar + canvas + panel composition
    TopBar.tsx                     # title, picker, side-by-side toggle, share
    ComponentPicker.tsx            # component dropdown
    SideBySideToggle.tsx
    ShareButton.tsx
    Canvas.tsx                     # 1 or 2 panes + replay/trigger controls
    ConfigPanel.tsx                # right-side panel, owns A/B tabs
    AnimationControls.tsx          # type segment + tween/spring controls
    EasingSelect.tsx
    CubicBezierEditor.tsx          # 4 inputs + SVG curve preview
    PresetPicker.tsx
    CodeSnippet.tsx                # CSS / Motion tabs + copy
    MobileNotice.tsx
  demos/
    DemoFrame.tsx                  # shared visual frame helper
    AccordionDemo.tsx
    CheckboxDemo.tsx
    ChipsDemo.tsx
    DatePickerDemo.tsx
    DropdownDemo.tsx
    IconButtonDemo.tsx
    InputFieldDemo.tsx
    ModalDemo.tsx
    PopoverDemo.tsx
    SearchInputDemo.tsx
    SideMenuDemo.tsx
    SliderDemo.tsx
    StepperDemo.tsx
    TabsDemo.tsx
    TextButtonDemo.tsx
    ToastDemo.tsx
    ToggleDemo.tsx
    registry.ts                    # id → demo metadata
  ui/                              # shadcn primitives (added on demand)
hooks/
  useAnimationStyle.ts             # config → CSS vars / motion props
  useUrlState.ts                   # bidirectional URL ↔ state
lib/
  animation/
    types.ts                       # AnimationConfig and friends
    defaults.ts                    # default configs
    presets.ts                     # named presets per component
    apply.ts                       # config → CSS string + motion transition
  url-state.ts                     # serialize / parse
test/
  setup.ts                         # vitest setup
```

---

## Phase 0 — Project setup

### Task 1: Scaffold Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `postcss.config.mjs`, `.eslintrc.json`
- Modify: `.gitignore` (already exists)

- [ ] **Step 1: Run create-next-app**

```bash
npx create-next-app@latest . --typescript --tailwind --app --eslint --turbopack --src-dir=false --import-alias="@/*" --use-npm --skip-install
```

Confirm overwrite when prompted (the only existing files are `.gitignore` and `docs/`).

- [ ] **Step 2: Install dependencies**

```bash
npm install
```

Expected: completes without errors. Verify `next`, `react`, `react-dom`, `tailwindcss` are in `package.json`.

- [ ] **Step 3: Verify dev server starts**

```bash
npm run dev
```

Expected: server starts on http://localhost:3000 and the default Next.js page renders. Stop with Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js project"
```

---

### Task 2: Add Vitest + React Testing Library

**Files:**
- Create: `vitest.config.ts`, `test/setup.ts`
- Modify: `package.json`

- [ ] **Step 1: Install test dependencies**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

- [ ] **Step 3: Create `test/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Add test script to `package.json`**

In the `"scripts"` block, add:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Smoke-test the runner**

Run: `npm test`
Expected: "No test files found" — exits with code 0 or 1, but no setup errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: add vitest + react testing library"
```

---

### Task 3: Initialize shadcn/ui and install Motion

**Files:**
- Create: `components.json`, `components/ui/*` (initial primitives)
- Modify: `app/globals.css`, `package.json`

- [ ] **Step 1: Initialize shadcn**

```bash
npx shadcn@latest init -d
```

Accept defaults (New York style, Neutral base color, CSS variables on). This creates `components.json`, updates `app/globals.css` with theme tokens, and adds `lib/utils.ts`.

- [ ] **Step 2: Add the primitives we'll need across the playground**

```bash
npx shadcn@latest add button select dropdown-menu accordion checkbox popover dialog tabs input slider switch sonner tooltip label separator
```

Expected: each component is added under `components/ui/`.

- [ ] **Step 3: Install Motion**

```bash
npm install motion
```

- [ ] **Step 4: Verify it imports**

Add temporarily to `app/page.tsx` (don't commit):
```tsx
import { motion } from 'motion/react';
```

Run `npm run dev` — page should compile without errors. Remove the import.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: init shadcn/ui and install motion"
```

---

## Phase 1 — Animation types and lib

### Task 4: Define AnimationConfig types

**Files:**
- Create: `lib/animation/types.ts`

- [ ] **Step 1: Create `lib/animation/types.ts`**

```ts
export type CubicBezier = readonly [number, number, number, number];

export type EasingValue =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | { cubicBezier: CubicBezier };

export type TweenConfig = {
  type: 'tween';
  duration: number; // ms, 0–2000
  easing: EasingValue;
};

export type SpringConfig = {
  type: 'spring';
  stiffness: number; // 1–500
  damping: number;   // 1–50
  mass: number;      // 0.1–10
};

export type AnimationConfig = TweenConfig | SpringConfig;

export const SLIDER_LIMITS = {
  duration: { min: 0, max: 2000 },
  stiffness: { min: 1, max: 500 },
  damping: { min: 1, max: 50 },
  mass: { min: 0.1, max: 10 },
} as const;
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(animation): add AnimationConfig types"
```

---

### Task 5: Default configs

**Files:**
- Create: `lib/animation/defaults.ts`, `lib/animation/defaults.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/animation/defaults.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { DEFAULT_TWEEN, DEFAULT_SPRING } from './defaults';

describe('animation defaults', () => {
  it('DEFAULT_TWEEN is a valid tween config within slider limits', () => {
    expect(DEFAULT_TWEEN.type).toBe('tween');
    expect(DEFAULT_TWEEN.duration).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_TWEEN.duration).toBeLessThanOrEqual(2000);
  });

  it('DEFAULT_SPRING is a valid spring config within slider limits', () => {
    expect(DEFAULT_SPRING.type).toBe('spring');
    expect(DEFAULT_SPRING.stiffness).toBeGreaterThanOrEqual(1);
    expect(DEFAULT_SPRING.damping).toBeGreaterThanOrEqual(1);
    expect(DEFAULT_SPRING.mass).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test, verify failure**

```bash
npm test -- lib/animation/defaults.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `lib/animation/defaults.ts`**

```ts
import type { TweenConfig, SpringConfig } from './types';

export const DEFAULT_TWEEN: TweenConfig = {
  type: 'tween',
  duration: 250,
  easing: { cubicBezier: [0.4, 0, 0.2, 1] }, // Material standard
};

export const DEFAULT_SPRING: SpringConfig = {
  type: 'spring',
  stiffness: 170,
  damping: 26,
  mass: 1,
};
```

- [ ] **Step 4: Run test, verify pass**

```bash
npm test -- lib/animation/defaults.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(animation): add default tween and spring configs"
```

---

### Task 6: Component registry

**Files:**
- Create: `components/demos/registry.ts`, `components/demos/registry.test.ts`

- [ ] **Step 1: Write the failing test**

Create `components/demos/registry.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { COMPONENT_IDS, getComponentLabel } from './registry';

describe('component registry', () => {
  it('contains all 17 components', () => {
    expect(COMPONENT_IDS).toHaveLength(17);
  });

  it('every id has a human label', () => {
    COMPONENT_IDS.forEach((id) => {
      expect(getComponentLabel(id)).toBeTruthy();
    });
  });

  it('returns the default label for unknown ids', () => {
    expect(getComponentLabel('nonexistent' as never)).toBe('');
  });
});
```

- [ ] **Step 2: Run test, verify failure**

```bash
npm test -- components/demos/registry.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Create `components/demos/registry.ts`**

```ts
export const COMPONENT_IDS = [
  'icon-button',
  'text-button',
  'toggle',
  'checkbox',
  'accordion',
  'tabs',
  'stepper',
  'slider',
  'input-field',
  'search-input',
  'dropdown',
  'popover',
  'modal',
  'date-picker',
  'toast',
  'side-menu',
  'chips',
] as const;

export type ComponentId = (typeof COMPONENT_IDS)[number];

const LABELS: Record<ComponentId, string> = {
  'icon-button': 'Icon button',
  'text-button': 'Text button',
  'toggle': 'Toggle',
  'checkbox': 'Checkbox',
  'accordion': 'Accordion',
  'tabs': 'Tabs',
  'stepper': 'Stepper',
  'slider': 'Slider',
  'input-field': 'Input field',
  'search-input': 'Search input',
  'dropdown': 'Dropdown',
  'popover': 'Popover',
  'modal': 'Modal',
  'date-picker': 'Date picker',
  'toast': 'Toast',
  'side-menu': 'Side menu',
  'chips': 'Chips',
};

export function isComponentId(value: string): value is ComponentId {
  return (COMPONENT_IDS as readonly string[]).includes(value);
}

export function getComponentLabel(id: ComponentId | string): string {
  return isComponentId(id) ? LABELS[id] : '';
}

export const DEFAULT_COMPONENT_ID: ComponentId = 'toggle';
```

- [ ] **Step 4: Run test, verify pass**

```bash
npm test -- components/demos/registry.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(demos): add component registry"
```

---

### Task 7: URL state — serialization

**Files:**
- Create: `lib/url-state.ts`, `lib/url-state.test.ts`

- [ ] **Step 1: Write the failing test (serialization round-trip)**

Create `lib/url-state.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { serializeState, parseState, type PlaygroundState } from './url-state';
import { DEFAULT_TWEEN, DEFAULT_SPRING } from './animation/defaults';

const baseTweenState: PlaygroundState = {
  componentId: 'modal',
  configA: DEFAULT_TWEEN,
  sideBySide: false,
};

describe('serializeState', () => {
  it('encodes a tween config with named easing', () => {
    const params = serializeState({
      ...baseTweenState,
      configA: { type: 'tween', duration: 300, easing: 'ease-out' },
    });
    expect(params.get('c')).toBe('modal');
    expect(params.get('t')).toBe('tween');
    expect(params.get('dur')).toBe('300');
    expect(params.get('e')).toBe('ease-out');
  });

  it('encodes a custom cubic-bezier', () => {
    const params = serializeState({
      ...baseTweenState,
      configA: {
        type: 'tween',
        duration: 400,
        easing: { cubicBezier: [0.4, 0, 0.2, 1] },
      },
    });
    expect(params.get('e')).toBe('cb:0.4,0,0.2,1');
  });

  it('encodes a spring config', () => {
    const params = serializeState({
      ...baseTweenState,
      configA: DEFAULT_SPRING,
    });
    expect(params.get('t')).toBe('spring');
    expect(params.get('s')).toBe('170');
    expect(params.get('d')).toBe('26');
    expect(params.get('m')).toBe('1');
  });

  it('omits configB when sideBySide is off', () => {
    const params = serializeState({
      ...baseTweenState,
      configB: DEFAULT_SPRING,
      sideBySide: false,
    });
    expect(params.get('sbs')).toBeNull();
    expect(params.get('b.t')).toBeNull();
  });

  it('encodes configB when sideBySide is on', () => {
    const params = serializeState({
      ...baseTweenState,
      configB: { type: 'tween', duration: 600, easing: 'linear' },
      sideBySide: true,
    });
    expect(params.get('sbs')).toBe('1');
    expect(params.get('b.t')).toBe('tween');
    expect(params.get('b.dur')).toBe('600');
    expect(params.get('b.e')).toBe('linear');
  });
});
```

- [ ] **Step 2: Run test, verify failure**

```bash
npm test -- lib/url-state.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/url-state.ts`** (serializer + types)

```ts
import type { AnimationConfig, EasingValue } from './animation/types';
import {
  COMPONENT_IDS,
  DEFAULT_COMPONENT_ID,
  isComponentId,
  type ComponentId,
} from '@/components/demos/registry';

export type PlaygroundState = {
  componentId: ComponentId;
  configA: AnimationConfig;
  configB?: AnimationConfig;
  sideBySide: boolean;
};

const NAMED_EASINGS = ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'] as const;
type NamedEasing = (typeof NAMED_EASINGS)[number];

function isNamedEasing(value: string): value is NamedEasing {
  return (NAMED_EASINGS as readonly string[]).includes(value);
}

function encodeEasing(easing: EasingValue): string {
  if (typeof easing === 'string') return easing;
  return `cb:${easing.cubicBezier.join(',')}`;
}

function encodeConfig(params: URLSearchParams, prefix: string, config: AnimationConfig) {
  const k = (key: string) => `${prefix}${key}`;
  if (config.type === 'tween') {
    params.set(k('t'), 'tween');
    params.set(k('dur'), String(config.duration));
    params.set(k('e'), encodeEasing(config.easing));
  } else {
    params.set(k('t'), 'spring');
    params.set(k('s'), String(config.stiffness));
    params.set(k('d'), String(config.damping));
    params.set(k('m'), String(config.mass));
  }
}

export function serializeState(state: PlaygroundState): URLSearchParams {
  const params = new URLSearchParams();
  params.set('c', state.componentId);
  encodeConfig(params, '', state.configA);
  if (state.sideBySide && state.configB) {
    params.set('sbs', '1');
    encodeConfig(params, 'b.', state.configB);
  }
  return params;
}

export function parseState(_input: string | URLSearchParams): PlaygroundState {
  // Implemented in Task 8.
  throw new Error('not implemented');
}
```

- [ ] **Step 4: Run test, verify only the parse-related tests fail**

```bash
npm test -- lib/url-state.test.ts
```

Expected: all `serializeState` tests PASS. (No parseState tests yet.)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(url-state): add serializer"
```

---

### Task 8: URL state — parsing

**Files:**
- Modify: `lib/url-state.ts`, `lib/url-state.test.ts`

- [ ] **Step 1: Add failing parse tests**

Append to `lib/url-state.test.ts`:

```ts
describe('parseState', () => {
  it('round-trips a tween config with named easing', () => {
    const original: PlaygroundState = {
      componentId: 'modal',
      configA: { type: 'tween', duration: 300, easing: 'ease-out' },
      sideBySide: false,
    };
    const parsed = parseState(serializeState(original));
    expect(parsed).toEqual(original);
  });

  it('round-trips a custom cubic-bezier', () => {
    const original: PlaygroundState = {
      componentId: 'modal',
      configA: {
        type: 'tween',
        duration: 400,
        easing: { cubicBezier: [0.4, 0, 0.2, 1] },
      },
      sideBySide: false,
    };
    const parsed = parseState(serializeState(original));
    expect(parsed).toEqual(original);
  });

  it('round-trips a spring config', () => {
    const original: PlaygroundState = {
      componentId: 'toggle',
      configA: DEFAULT_SPRING,
      sideBySide: false,
    };
    const parsed = parseState(serializeState(original));
    expect(parsed).toEqual(original);
  });

  it('round-trips side-by-side with two different configs', () => {
    const original: PlaygroundState = {
      componentId: 'modal',
      configA: DEFAULT_TWEEN,
      configB: DEFAULT_SPRING,
      sideBySide: true,
    };
    const parsed = parseState(serializeState(original));
    expect(parsed).toEqual(original);
  });

  it('falls back to defaults for empty input', () => {
    const parsed = parseState('');
    expect(parsed.componentId).toBe('toggle'); // DEFAULT_COMPONENT_ID
    expect(parsed.configA.type).toBe('tween');
    expect(parsed.sideBySide).toBe(false);
  });

  it('falls back to default component id for unknown id', () => {
    const parsed = parseState('c=nonexistent');
    expect(parsed.componentId).toBe('toggle');
  });

  it('falls back to defaults for nonsense duration', () => {
    const parsed = parseState('c=toggle&t=tween&dur=banana&e=ease');
    expect(parsed.configA).toMatchObject({ type: 'tween' });
    expect((parsed.configA as { duration: number }).duration).toBe(250); // DEFAULT_TWEEN.duration
  });

  it('clamps spring values to slider limits', () => {
    const parsed = parseState('c=toggle&t=spring&s=99999&d=99999&m=99999');
    const cfg = parsed.configA as { stiffness: number; damping: number; mass: number };
    expect(cfg.stiffness).toBeLessThanOrEqual(500);
    expect(cfg.damping).toBeLessThanOrEqual(50);
    expect(cfg.mass).toBeLessThanOrEqual(10);
  });
});
```

- [ ] **Step 2: Run, verify these new tests fail**

```bash
npm test -- lib/url-state.test.ts
```

Expected: parse tests FAIL ("not implemented"); serialize tests still PASS.

- [ ] **Step 3: Implement `parseState`**

Replace the body of `parseState` in `lib/url-state.ts`:

```ts
import { DEFAULT_TWEEN, DEFAULT_SPRING } from './animation/defaults';
import { SLIDER_LIMITS } from './animation/types';

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return null;
  return Math.min(Math.max(value, min), max);
}

function parseNumber(raw: string | null, fallback: number, limits?: { min: number; max: number }): number {
  if (raw == null) return fallback;
  const n = Number(raw);
  if (Number.isNaN(n)) return fallback;
  if (limits) {
    const c = clamp(n, limits.min, limits.max);
    return c == null ? fallback : c;
  }
  return n;
}

function parseEasing(raw: string | null): EasingValue {
  if (raw == null) return DEFAULT_TWEEN.easing;
  if (isNamedEasing(raw)) return raw;
  if (raw.startsWith('cb:')) {
    const parts = raw.slice(3).split(',').map(Number);
    if (parts.length === 4 && parts.every((n) => !Number.isNaN(n))) {
      return { cubicBezier: parts as unknown as [number, number, number, number] };
    }
  }
  return DEFAULT_TWEEN.easing;
}

function parseConfigAt(params: URLSearchParams, prefix: string, fallback: AnimationConfig): AnimationConfig {
  const k = (key: string) => `${prefix}${key}`;
  const type = params.get(k('t'));
  if (type === 'spring') {
    return {
      type: 'spring',
      stiffness: parseNumber(params.get(k('s')), DEFAULT_SPRING.stiffness, SLIDER_LIMITS.stiffness),
      damping: parseNumber(params.get(k('d')), DEFAULT_SPRING.damping, SLIDER_LIMITS.damping),
      mass: parseNumber(params.get(k('m')), DEFAULT_SPRING.mass, SLIDER_LIMITS.mass),
    };
  }
  if (type === 'tween') {
    return {
      type: 'tween',
      duration: parseNumber(params.get(k('dur')), DEFAULT_TWEEN.duration, SLIDER_LIMITS.duration),
      easing: parseEasing(params.get(k('e'))),
    };
  }
  return fallback;
}

export function parseState(input: string | URLSearchParams): PlaygroundState {
  const params = typeof input === 'string' ? new URLSearchParams(input) : input;
  const rawId = params.get('c') ?? '';
  const componentId = isComponentId(rawId) ? rawId : DEFAULT_COMPONENT_ID;
  const configA = parseConfigAt(params, '', DEFAULT_TWEEN);
  const sideBySide = params.get('sbs') === '1';
  const configB = sideBySide ? parseConfigAt(params, 'b.', DEFAULT_SPRING) : undefined;
  return { componentId, configA, configB, sideBySide };
}
```

- [ ] **Step 4: Run, verify all tests pass**

```bash
npm test -- lib/url-state.test.ts
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(url-state): add parser with defaults and clamping"
```

---

### Task 9: Presets

**Files:**
- Create: `lib/animation/presets.ts`, `lib/animation/presets.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/animation/presets.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { PRESETS, getPresets } from './presets';
import { COMPONENT_IDS } from '@/components/demos/registry';
import { SLIDER_LIMITS } from './types';

describe('presets', () => {
  it('every component has at least 4 presets', () => {
    COMPONENT_IDS.forEach((id) => {
      expect(getPresets(id).length).toBeGreaterThanOrEqual(4);
    });
  });

  it('every preset config is within slider limits', () => {
    Object.values(PRESETS).flat().forEach((preset) => {
      const cfg = preset.config;
      if (cfg.type === 'tween') {
        expect(cfg.duration).toBeGreaterThanOrEqual(SLIDER_LIMITS.duration.min);
        expect(cfg.duration).toBeLessThanOrEqual(SLIDER_LIMITS.duration.max);
      } else {
        expect(cfg.stiffness).toBeGreaterThanOrEqual(SLIDER_LIMITS.stiffness.min);
        expect(cfg.stiffness).toBeLessThanOrEqual(SLIDER_LIMITS.stiffness.max);
      }
    });
  });

  it('every component has exactly one preset flagged "bad"', () => {
    COMPONENT_IDS.forEach((id) => {
      const bad = getPresets(id).filter((p) => p.bad);
      expect(bad.length).toBe(1);
    });
  });
});
```

- [ ] **Step 2: Run test, verify failure**

```bash
npm test -- lib/animation/presets.test.ts
```

- [ ] **Step 3: Create `lib/animation/presets.ts`**

```ts
import type { AnimationConfig } from './types';
import { COMPONENT_IDS, type ComponentId } from '@/components/demos/registry';

export type Preset = {
  id: string;
  name: string;
  config: AnimationConfig;
  bad?: boolean;
  badReason?: string;
};

const MATERIAL: AnimationConfig = {
  type: 'tween',
  duration: 250,
  easing: { cubicBezier: [0.4, 0, 0.2, 1] },
};

const IOS_SPRING: AnimationConfig = {
  type: 'spring',
  stiffness: 170,
  damping: 26,
  mass: 1,
};

const SNAPPY: AnimationConfig = {
  type: 'tween',
  duration: 150,
  easing: 'ease-out',
};

const SLUGGISH: AnimationConfig = {
  type: 'tween',
  duration: 800,
  easing: 'linear',
};

const SLUGGISH_REASON =
  'Long duration plus linear easing makes the motion feel mechanical and unresponsive. Real motion accelerates and decelerates.';

const STANDARD_PRESETS: Preset[] = [
  { id: 'material', name: 'Material standard', config: MATERIAL },
  { id: 'ios-spring', name: 'iOS spring', config: IOS_SPRING },
  { id: 'snappy', name: 'Snappy', config: SNAPPY },
  { id: 'sluggish', name: 'Sluggish', config: SLUGGISH, bad: true, badReason: SLUGGISH_REASON },
];

export const PRESETS: Record<ComponentId, Preset[]> = Object.fromEntries(
  COMPONENT_IDS.map((id) => [id, STANDARD_PRESETS]),
) as Record<ComponentId, Preset[]>;

export function getPresets(id: ComponentId): Preset[] {
  return PRESETS[id] ?? STANDARD_PRESETS;
}
```

- [ ] **Step 4: Run test, verify pass**

```bash
npm test -- lib/animation/presets.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(animation): add curated presets per component"
```

---

### Task 10: Apply config to CSS / Motion

**Files:**
- Create: `lib/animation/apply.ts`, `lib/animation/apply.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/animation/apply.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { configToCssVars, configToCssTransition, configToMotionTransition } from './apply';

describe('configToCssVars', () => {
  it('produces --duration and --easing for tween with named easing', () => {
    const vars = configToCssVars({ type: 'tween', duration: 300, easing: 'ease-out' });
    expect(vars['--duration']).toBe('300ms');
    expect(vars['--easing']).toBe('ease-out');
  });

  it('produces cubic-bezier() string for custom easing', () => {
    const vars = configToCssVars({
      type: 'tween',
      duration: 400,
      easing: { cubicBezier: [0.4, 0, 0.2, 1] },
    });
    expect(vars['--easing']).toBe('cubic-bezier(0.4, 0, 0.2, 1)');
  });

  it('returns empty for spring (handled by Motion)', () => {
    const vars = configToCssVars({ type: 'spring', stiffness: 170, damping: 26, mass: 1 });
    expect(vars).toEqual({});
  });
});

describe('configToCssTransition', () => {
  it('returns "all <duration> <easing>" for tween', () => {
    expect(configToCssTransition({ type: 'tween', duration: 300, easing: 'ease-out' }))
      .toBe('all 300ms ease-out');
  });
  it('returns empty for spring', () => {
    expect(configToCssTransition({ type: 'spring', stiffness: 170, damping: 26, mass: 1 })).toBe('');
  });
});

describe('configToMotionTransition', () => {
  it('returns spring transition object', () => {
    const t = configToMotionTransition({ type: 'spring', stiffness: 170, damping: 26, mass: 1 });
    expect(t).toEqual({ type: 'spring', stiffness: 170, damping: 26, mass: 1 });
  });

  it('returns tween transition object with seconds', () => {
    const t = configToMotionTransition({ type: 'tween', duration: 300, easing: 'ease-out' });
    expect(t).toMatchObject({ type: 'tween', duration: 0.3, ease: 'easeOut' });
  });

  it('maps custom cubic-bezier to ease array', () => {
    const t = configToMotionTransition({
      type: 'tween',
      duration: 400,
      easing: { cubicBezier: [0.4, 0, 0.2, 1] },
    });
    expect(t).toMatchObject({ ease: [0.4, 0, 0.2, 1] });
  });
});
```

- [ ] **Step 2: Run, verify failure**

```bash
npm test -- lib/animation/apply.test.ts
```

- [ ] **Step 3: Create `lib/animation/apply.ts`**

```ts
import type { AnimationConfig, EasingValue } from './types';

const NAMED_TO_MOTION: Record<string, string> = {
  linear: 'linear',
  ease: 'easeInOut',
  'ease-in': 'easeIn',
  'ease-out': 'easeOut',
  'ease-in-out': 'easeInOut',
};

function easingToCss(easing: EasingValue): string {
  if (typeof easing === 'string') return easing;
  return `cubic-bezier(${easing.cubicBezier.join(', ')})`;
}

export function configToCssVars(config: AnimationConfig): Record<string, string> {
  if (config.type !== 'tween') return {};
  return {
    '--duration': `${config.duration}ms`,
    '--easing': easingToCss(config.easing),
  };
}

export function configToCssTransition(config: AnimationConfig): string {
  if (config.type !== 'tween') return '';
  return `all ${config.duration}ms ${easingToCss(config.easing)}`;
}

export function configToMotionTransition(config: AnimationConfig) {
  if (config.type === 'spring') {
    return {
      type: 'spring' as const,
      stiffness: config.stiffness,
      damping: config.damping,
      mass: config.mass,
    };
  }
  const ease =
    typeof config.easing === 'string'
      ? NAMED_TO_MOTION[config.easing] ?? 'easeInOut'
      : ([...config.easing.cubicBezier] as [number, number, number, number]);
  return {
    type: 'tween' as const,
    duration: config.duration / 1000, // Motion uses seconds
    ease,
  };
}
```

- [ ] **Step 4: Run, verify pass**

```bash
npm test -- lib/animation/apply.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(animation): add config-to-css and config-to-motion adapters"
```

---

### Task 11: useAnimationStyle hook

**Files:**
- Create: `hooks/useAnimationStyle.ts`

- [ ] **Step 1: Create `hooks/useAnimationStyle.ts`**

```ts
'use client';

import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import type { AnimationConfig } from '@/lib/animation/types';
import {
  configToCssVars,
  configToMotionTransition,
} from '@/lib/animation/apply';

export type AnimationStyle = {
  /**
   * Inline style with --duration and --easing CSS vars set.
   * Apply this to a wrapper, then write demo-specific transitions like
   *   transition: 'transform var(--duration) var(--easing)'
   * on the elements you want to animate.
   * Empty when config.type === 'spring' — use motionTransition instead.
   */
  cssStyle: CSSProperties;
  /** Use this on Motion's `<motion.div transition={...}>`. */
  motionTransition: ReturnType<typeof configToMotionTransition>;
  /** True when the config is a spring — demos render via Motion in this case. */
  isSpring: boolean;
};

export function useAnimationStyle(config: AnimationConfig): AnimationStyle {
  return useMemo(
    () => ({
      cssStyle: configToCssVars(config) as CSSProperties,
      motionTransition: configToMotionTransition(config),
      isSpring: config.type === 'spring',
    }),
    [config],
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(hooks): add useAnimationStyle"
```

---

## Phase 2 — Shell layout

### Task 12: Top bar — title + side-by-side toggle + share

**Files:**
- Create: `components/playground/TopBar.tsx`, `components/playground/SideBySideToggle.tsx`, `components/playground/ShareButton.tsx`

- [ ] **Step 1: Create `components/playground/SideBySideToggle.tsx`**

```tsx
'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function SideBySideToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Switch id="sbs" checked={value} onCheckedChange={onChange} />
      <Label htmlFor="sbs" className="text-sm font-normal">
        Side-by-side
      </Label>
    </div>
  );
}
```

- [ ] **Step 2: Create `components/playground/ShareButton.tsx`**

```tsx
'use client';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Share2 } from 'lucide-react';

export function ShareButton() {
  async function handleShare() {
    if (typeof window === 'undefined') return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard.');
    } catch {
      toast.error('Could not copy link.');
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleShare}>
      <Share2 className="mr-2 h-4 w-4" />
      Share
    </Button>
  );
}
```

- [ ] **Step 2a: Add `<Toaster />` to `app/layout.tsx`**

In `app/layout.tsx`, import `Toaster` from `@/components/ui/sonner` and render it inside the `<body>`:

```tsx
import { Toaster } from '@/components/ui/sonner';
// ...
<body>
  {children}
  <Toaster />
</body>
```

- [ ] **Step 3: Create `components/playground/TopBar.tsx`**

```tsx
'use client';

import { ComponentPicker } from './ComponentPicker';
import { SideBySideToggle } from './SideBySideToggle';
import { ShareButton } from './ShareButton';
import type { ComponentId } from '@/components/demos/registry';

type Props = {
  componentId: ComponentId;
  onComponentChange: (id: ComponentId) => void;
  sideBySide: boolean;
  onSideBySideChange: (next: boolean) => void;
};

export function TopBar(props: Props) {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4">
      <div className="text-sm font-semibold">Micro-interaction Playground</div>
      <div className="flex-1" />
      <ComponentPicker value={props.componentId} onChange={props.onComponentChange} />
      <SideBySideToggle value={props.sideBySide} onChange={props.onSideBySideChange} />
      <ShareButton />
    </header>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(playground): add top bar (incomplete — picker stub next)"
```

---

### Task 13: Component picker dropdown

**Files:**
- Create: `components/playground/ComponentPicker.tsx`

- [ ] **Step 1: Create `components/playground/ComponentPicker.tsx`**

```tsx
'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  COMPONENT_IDS,
  getComponentLabel,
  type ComponentId,
} from '@/components/demos/registry';

export function ComponentPicker({
  value,
  onChange,
}: {
  value: ComponentId;
  onChange: (id: ComponentId) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as ComponentId)}>
      <SelectTrigger className="w-[200px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {COMPONENT_IDS.map((id) => (
          <SelectItem key={id} value={id}>
            {getComponentLabel(id)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(playground): add component picker dropdown"
```

---

### Task 14: Canvas wrapper (single-pane, with replay control)

**Files:**
- Create: `components/playground/Canvas.tsx`

- [ ] **Step 1: Create `components/playground/Canvas.tsx`**

```tsx
'use client';

import { Button } from '@/components/ui/button';
import { Play, ArrowLeftRight } from 'lucide-react';
import { ReactNode } from 'react';

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
  return (
    <div className="relative flex flex-1 items-center justify-center bg-muted/40 p-8">
      {label && (
        <div className="absolute left-3 top-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
      )}
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(playground): add canvas with replay + swap controls"
```

---

## Phase 3 — Config panel

### Task 15: ConfigPanel skeleton + section headers

**Files:**
- Create: `components/playground/ConfigPanel.tsx`

- [ ] **Step 1: Create `components/playground/ConfigPanel.tsx`**

```tsx
'use client';

import { ReactNode } from 'react';

export function ConfigPanel({ children }: { children: ReactNode }) {
  return (
    <aside className="flex w-[320px] flex-col gap-6 overflow-y-auto border-l bg-background p-5">
      {children}
    </aside>
  );
}

export function PanelSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(playground): add config panel shell + section primitive"
```

---

### Task 16: AnimationControls — tween/spring segment + tween fields

**Files:**
- Create: `components/playground/AnimationControls.tsx`, `components/playground/EasingSelect.tsx`

- [ ] **Step 1: Create `components/playground/EasingSelect.tsx`**

```tsx
'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { EasingValue } from '@/lib/animation/types';

const NAMED = ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'] as const;

export function EasingSelect({
  value,
  onChange,
}: {
  value: EasingValue;
  onChange: (next: EasingValue | 'custom') => void;
}) {
  const current = typeof value === 'string' ? value : 'custom';
  return (
    <Select
      value={current}
      onValueChange={(v) => {
        if (v === 'custom') onChange('custom');
        else onChange(v as EasingValue);
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {NAMED.map((n) => (
          <SelectItem key={n} value={n}>{n}</SelectItem>
        ))}
        <SelectItem value="custom">Custom…</SelectItem>
      </SelectContent>
    </Select>
  );
}
```

- [ ] **Step 2: Create `components/playground/AnimationControls.tsx`**

```tsx
'use client';

import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { EasingSelect } from './EasingSelect';
import { CubicBezierEditor } from './CubicBezierEditor';
import type { AnimationConfig, EasingValue } from '@/lib/animation/types';
import { SLIDER_LIMITS } from '@/lib/animation/types';
import { DEFAULT_TWEEN, DEFAULT_SPRING } from '@/lib/animation/defaults';

type Props = {
  config: AnimationConfig;
  onChange: (next: AnimationConfig) => void;
};

export function AnimationControls({ config, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-1 rounded-md bg-muted p-1">
        <Button
          variant={config.type === 'tween' ? 'default' : 'ghost'}
          size="sm"
          className="h-7"
          onClick={() => onChange(config.type === 'tween' ? config : DEFAULT_TWEEN)}
        >
          Tween
        </Button>
        <Button
          variant={config.type === 'spring' ? 'default' : 'ghost'}
          size="sm"
          className="h-7"
          onClick={() => onChange(config.type === 'spring' ? config : DEFAULT_SPRING)}
        >
          Spring
        </Button>
      </div>

      {config.type === 'tween' ? (
        <TweenFields config={config} onChange={onChange} />
      ) : (
        <SpringFields config={config} onChange={onChange} />
      )}
    </div>
  );
}

function TweenFields({
  config,
  onChange,
}: {
  config: Extract<AnimationConfig, { type: 'tween' }>;
  onChange: (next: AnimationConfig) => void;
}) {
  function setEasing(next: EasingValue | 'custom') {
    if (next === 'custom') {
      onChange({ ...config, easing: { cubicBezier: [0.4, 0, 0.2, 1] } });
    } else {
      onChange({ ...config, easing: next });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <LabeledSlider
        label="Duration"
        value={config.duration}
        unit="ms"
        min={SLIDER_LIMITS.duration.min}
        max={SLIDER_LIMITS.duration.max}
        step={10}
        onChange={(v) => onChange({ ...config, duration: v })}
      />
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">Easing</Label>
        <EasingSelect value={config.easing} onChange={setEasing} />
      </div>
      {typeof config.easing !== 'string' && (
        <CubicBezierEditor
          value={config.easing.cubicBezier}
          onChange={(cb) => onChange({ ...config, easing: { cubicBezier: cb } })}
        />
      )}
    </div>
  );
}

function SpringFields({
  config,
  onChange,
}: {
  config: Extract<AnimationConfig, { type: 'spring' }>;
  onChange: (next: AnimationConfig) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <LabeledSlider
        label="Stiffness"
        value={config.stiffness}
        min={SLIDER_LIMITS.stiffness.min}
        max={SLIDER_LIMITS.stiffness.max}
        step={1}
        onChange={(v) => onChange({ ...config, stiffness: v })}
      />
      <LabeledSlider
        label="Damping"
        value={config.damping}
        min={SLIDER_LIMITS.damping.min}
        max={SLIDER_LIMITS.damping.max}
        step={1}
        onChange={(v) => onChange({ ...config, damping: v })}
      />
      <LabeledSlider
        label="Mass"
        value={config.mass}
        min={SLIDER_LIMITS.mass.min}
        max={SLIDER_LIMITS.mass.max}
        step={0.1}
        onChange={(v) => onChange({ ...config, mass: v })}
      />
    </div>
  );
}

function LabeledSlider({
  label, value, unit = '', min, max, step, onChange,
}: {
  label: string;
  value: number;
  unit?: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <Label className="text-xs">{label}</Label>
        <span className="text-xs tabular-nums text-muted-foreground">
          {Number(value.toFixed(2))}
          {unit}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(arr) => onChange(arr[0])}
      />
    </div>
  );
}
```

- [ ] **Step 3: Commit (CubicBezierEditor stub created next)**

```bash
git add -A
git commit -m "feat(playground): animation controls (tween + spring fields)"
```

---

### Task 17: CubicBezierEditor

**Files:**
- Create: `components/playground/CubicBezierEditor.tsx`

- [ ] **Step 1: Create `components/playground/CubicBezierEditor.tsx`**

```tsx
'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CubicBezier } from '@/lib/animation/types';

export function CubicBezierEditor({
  value,
  onChange,
}: {
  value: CubicBezier;
  onChange: (next: CubicBezier) => void;
}) {
  function setAt(i: number, raw: string) {
    const n = Number(raw);
    if (Number.isNaN(n)) return;
    const next = [...value] as [number, number, number, number];
    next[i] = n;
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs">Cubic-bezier</Label>
      <div className="flex items-center gap-3">
        <BezierPreview points={value} />
        <div className="grid flex-1 grid-cols-2 gap-2">
          {value.map((n, i) => (
            <Input
              key={i}
              type="number"
              step="0.01"
              value={n}
              onChange={(e) => setAt(i, e.currentTarget.value)}
              className="h-8 text-xs"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function BezierPreview({ points }: { points: CubicBezier }) {
  const [x1, y1, x2, y2] = points;
  const W = 80;
  const H = 80;
  const sx = (n: number) => n * W;
  const sy = (n: number) => H - n * H;
  return (
    <svg width={W} height={H} className="rounded border bg-muted/40">
      <line x1={0} y1={H} x2={W} y2={0} stroke="currentColor" strokeOpacity={0.1} />
      <path
        d={`M 0 ${H} C ${sx(x1)} ${sy(y1)}, ${sx(x2)} ${sy(y2)}, ${W} 0`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      />
    </svg>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(playground): cubic-bezier editor with curve preview"
```

---

### Task 18: PresetPicker

**Files:**
- Create: `components/playground/PresetPicker.tsx`

- [ ] **Step 1: Create `components/playground/PresetPicker.tsx`**

```tsx
'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AlertTriangle } from 'lucide-react';
import { getPresets, type Preset } from '@/lib/animation/presets';
import type { ComponentId } from '@/components/demos/registry';
import type { AnimationConfig } from '@/lib/animation/types';

const CUSTOM = '__custom__';

export function PresetPicker({
  componentId,
  config,
  onChange,
}: {
  componentId: ComponentId;
  config: AnimationConfig;
  onChange: (next: AnimationConfig) => void;
}) {
  const presets = getPresets(componentId);
  const matching = findMatchingPreset(presets, config);
  const value = matching?.id ?? CUSTOM;
  const isBad = matching?.bad === true;

  return (
    <div className="flex items-center gap-2">
      <Select
        value={value}
        onValueChange={(id) => {
          if (id === CUSTOM) return;
          const found = presets.find((p) => p.id === id);
          if (found) onChange(found.config);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {presets.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              <span className="flex items-center gap-2">
                {p.bad && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                {p.name}
              </span>
            </SelectItem>
          ))}
          {!matching && <SelectItem value={CUSTOM}>Custom</SelectItem>}
        </SelectContent>
      </Select>
      {isBad && matching?.badReason && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[240px]">{matching.badReason}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

function findMatchingPreset(presets: Preset[], config: AnimationConfig): Preset | undefined {
  return presets.find((p) => deepEqual(p.config, config));
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(playground): preset picker with bad-preset warning"
```

---

### Task 19: CodeSnippet

**Files:**
- Create: `components/playground/CodeSnippet.tsx`

- [ ] **Step 1: Create `components/playground/CodeSnippet.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Copy, Check } from 'lucide-react';
import type { AnimationConfig } from '@/lib/animation/types';
import { configToCssTransition } from '@/lib/animation/apply';

export function CodeSnippet({ config }: { config: AnimationConfig }) {
  const css =
    config.type === 'tween'
      ? `transition: ${configToCssTransition(config)};`
      : '/* spring — use Motion */';

  const motion =
    config.type === 'spring'
      ? `<motion.div\n  transition={{ type: 'spring', stiffness: ${config.stiffness}, damping: ${config.damping}, mass: ${config.mass} }}\n/>`
      : `<motion.div\n  transition={{ type: 'tween', duration: ${(config.duration / 1000).toFixed(2)}, ease: ${formatEase(config.easing)} }}\n/>`;

  return (
    <Tabs defaultValue="css">
      <TabsList className="h-7">
        <TabsTrigger value="css" className="text-xs">CSS</TabsTrigger>
        <TabsTrigger value="motion" className="text-xs">Motion</TabsTrigger>
      </TabsList>
      <TabsContent value="css">
        <SnippetBlock code={css} />
      </TabsContent>
      <TabsContent value="motion">
        <SnippetBlock code={motion} />
      </TabsContent>
    </Tabs>
  );
}

function formatEase(easing: AnimationConfig extends infer C ? C extends { easing: infer E } ? E : never : never): string {
  return typeof easing === 'string'
    ? `'${ease(easing)}'`
    : `[${(easing as { cubicBezier: number[] }).cubicBezier.join(', ')}]`;
}
function ease(name: string) {
  const map: Record<string, string> = {
    linear: 'linear', ease: 'easeInOut', 'ease-in': 'easeIn', 'ease-out': 'easeOut', 'ease-in-out': 'easeInOut',
  };
  return map[name] ?? 'easeInOut';
}

function SnippetBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded border bg-muted/40 p-2 text-[11px] leading-snug">
        <code>{code}</code>
      </pre>
      <Button size="icon" variant="ghost" className="absolute right-1 top-1 h-6 w-6" onClick={copy}>
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(playground): live code snippet (CSS + Motion tabs)"
```

---

## Phase 4 — State and shell wiring

### Task 20: useUrlState hook

**Files:**
- Create: `hooks/useUrlState.ts`, `hooks/useUrlState.test.ts`

- [ ] **Step 1: Write the failing test (debounce + round-trip)**

Create `hooks/useUrlState.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUrlState } from './useUrlState';
import { DEFAULT_SPRING } from '@/lib/animation/defaults';

describe('useUrlState', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('initial state comes from URL params', () => {
    window.history.replaceState({}, '', '/?c=modal');
    const { result } = renderHook(() => useUrlState());
    expect(result.current.state.componentId).toBe('modal');
  });

  it('setState updates the URL (debounced)', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useUrlState());
    act(() => {
      result.current.setState((s) => ({ ...s, componentId: 'modal' }));
    });
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    expect(window.location.search).toContain('c=modal');
    vi.useRealTimers();
  });

  it('round-trips a spring config', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useUrlState());
    act(() => {
      result.current.setState((s) => ({ ...s, configA: DEFAULT_SPRING }));
    });
    await act(async () => { vi.advanceTimersByTime(200); });
    expect(window.location.search).toContain('t=spring');
    vi.useRealTimers();
  });
});
```

- [ ] **Step 2: Run, verify failure**

```bash
npm test -- hooks/useUrlState.test.ts
```

- [ ] **Step 3: Implement `hooks/useUrlState.ts`**

```ts
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { parseState, serializeState, type PlaygroundState } from '@/lib/url-state';

const DEBOUNCE_MS = 150;

export function useUrlState() {
  const [state, setStateInternal] = useState<PlaygroundState>(() => {
    if (typeof window === 'undefined') return parseState('');
    return parseState(window.location.search.replace(/^\?/, ''));
  });

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const writeUrl = useCallback((next: PlaygroundState) => {
    if (typeof window === 'undefined') return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const params = serializeState(next);
      const qs = params.toString();
      window.history.replaceState({}, '', qs ? `?${qs}` : window.location.pathname);
    }, DEBOUNCE_MS);
  }, []);

  const setState = useCallback(
    (updater: (prev: PlaygroundState) => PlaygroundState) => {
      setStateInternal((prev) => {
        const next = updater(prev);
        writeUrl(next);
        return next;
      });
    },
    [writeUrl],
  );

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return { state, setState };
}
```

- [ ] **Step 4: Run, verify pass**

```bash
npm test -- hooks/useUrlState.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(hooks): useUrlState with debounced URL writes"
```

---

### Task 21: PlaygroundShell — compose top bar + canvas + panel

**Files:**
- Create: `components/playground/PlaygroundShell.tsx`
- Create: `components/demos/DemoFrame.tsx` (placeholder so the shell has something to render)

- [ ] **Step 1: Create a minimal `components/demos/DemoFrame.tsx`**

```tsx
'use client';

import type { ReactNode } from 'react';

export function DemoFrame({ children }: { children: ReactNode }) {
  return <div className="flex w-full max-w-md items-center justify-center">{children}</div>;
}
```

- [ ] **Step 2: Create `components/playground/PlaygroundShell.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { TopBar } from './TopBar';
import { Canvas } from './Canvas';
import { ConfigPanel, PanelSection } from './ConfigPanel';
import { AnimationControls } from './AnimationControls';
import { PresetPicker } from './PresetPicker';
import { CodeSnippet } from './CodeSnippet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useUrlState } from '@/hooks/useUrlState';
import { DemoFrame } from '@/components/demos/DemoFrame';
import type { AnimationConfig } from '@/lib/animation/types';
import { DEFAULT_TWEEN } from '@/lib/animation/defaults';

export function PlaygroundShell() {
  const { state, setState } = useUrlState();
  const [triggerKey, setTriggerKey] = useState(0);

  function setConfigA(next: AnimationConfig) {
    setState((s) => ({ ...s, configA: next }));
  }
  function setConfigB(next: AnimationConfig) {
    setState((s) => ({ ...s, configB: next }));
  }
  function swapConfigs() {
    setState((s) => ({ ...s, configA: s.configB ?? DEFAULT_TWEEN, configB: s.configA }));
  }

  const configB = state.configB ?? DEFAULT_TWEEN;

  return (
    <div className="flex h-screen flex-col">
      <TopBar
        componentId={state.componentId}
        onComponentChange={(id) => setState((s) => ({ ...s, componentId: id }))}
        sideBySide={state.sideBySide}
        onSideBySideChange={(next) =>
          setState((s) => ({ ...s, sideBySide: next, configB: s.configB ?? DEFAULT_TWEEN }))
        }
      />
      <div className="flex flex-1 overflow-hidden">
        <Canvas
          sideBySide={state.sideBySide}
          paneA={<DemoFrame>Demo A (placeholder)</DemoFrame>}
          paneB={<DemoFrame>Demo B (placeholder)</DemoFrame>}
          onReplay={() => setTriggerKey((k) => k + 1)}
          onSwap={swapConfigs}
        />
        <ConfigPanel>
          {state.sideBySide ? (
            <Tabs defaultValue="a">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="a">A</TabsTrigger>
                <TabsTrigger value="b">B</TabsTrigger>
              </TabsList>
              <TabsContent value="a" className="mt-4">
                <PanelTabContents
                  componentId={state.componentId}
                  config={state.configA}
                  onChange={setConfigA}
                />
              </TabsContent>
              <TabsContent value="b" className="mt-4">
                <PanelTabContents
                  componentId={state.componentId}
                  config={configB}
                  onChange={setConfigB}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <PanelTabContents
              componentId={state.componentId}
              config={state.configA}
              onChange={setConfigA}
            />
          )}
        </ConfigPanel>
      </div>
    </div>
  );
}

function PanelTabContents({
  componentId,
  config,
  onChange,
}: {
  componentId: import('@/components/demos/registry').ComponentId;
  config: AnimationConfig;
  onChange: (next: AnimationConfig) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <PanelSection title="Preset">
        <PresetPicker componentId={componentId} config={config} onChange={onChange} />
      </PanelSection>
      <PanelSection title="Animation">
        <AnimationControls config={config} onChange={onChange} />
      </PanelSection>
      <PanelSection title="Code">
        <CodeSnippet config={config} />
      </PanelSection>
    </div>
  );
}
```

- [ ] **Step 3: Wire it into `app/page.tsx`**

Replace `app/page.tsx`:

```tsx
import { PlaygroundShell } from '@/components/playground/PlaygroundShell';

export default function Page() {
  return <PlaygroundShell />;
}
```

- [ ] **Step 4: Smoke-check the dev server**

```bash
npm run dev
```

Open http://localhost:3000. Expected: top bar, blank canvas with placeholder, config panel with Preset / Animation / Code sections. Toggle side-by-side; verify A/B tabs appear and the canvas splits.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(playground): compose shell with state + side-by-side tabs"
```

---

## Phase 5 — Demos

> **Pattern:** Every demo file lives at `components/demos/<Name>Demo.tsx` and exports a default component with this prop shape:
> ```ts
> type DemoProps = { config: AnimationConfig; triggerKey: number };
> ```
> Each demo composes shadcn primitives, applies `useAnimationStyle(config)` to drive timing, and uses `triggerKey` to re-fire one-shot animations when needed (with React's `key` prop or a `useEffect`).
> The demo registry maps each `ComponentId` to its component. The shell loads it dynamically.

### Task 22: Demo registry mechanism

**Files:**
- Modify: `components/demos/registry.ts`
- Create: `components/demos/index.tsx`
- Modify: `components/playground/PlaygroundShell.tsx`

- [ ] **Step 1: Add a `getDemo()` lookup to `components/demos/index.tsx`**

```tsx
'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { ComponentId } from './registry';
import type { AnimationConfig } from '@/lib/animation/types';

export type DemoProps = { config: AnimationConfig; triggerKey: number };

const DEMO_LOADERS: Record<ComponentId, () => Promise<{ default: ComponentType<DemoProps> }>> = {
  'icon-button':  () => import('./IconButtonDemo'),
  'text-button':  () => import('./TextButtonDemo'),
  'toggle':       () => import('./ToggleDemo'),
  'checkbox':     () => import('./CheckboxDemo'),
  'accordion':    () => import('./AccordionDemo'),
  'tabs':         () => import('./TabsDemo'),
  'stepper':      () => import('./StepperDemo'),
  'slider':       () => import('./SliderDemo'),
  'input-field':  () => import('./InputFieldDemo'),
  'search-input': () => import('./SearchInputDemo'),
  'dropdown':     () => import('./DropdownDemo'),
  'popover':      () => import('./PopoverDemo'),
  'modal':        () => import('./ModalDemo'),
  'date-picker':  () => import('./DatePickerDemo'),
  'toast':        () => import('./ToastDemo'),
  'side-menu':    () => import('./SideMenuDemo'),
  'chips':        () => import('./ChipsDemo'),
};

export function getDemo(id: ComponentId): ComponentType<DemoProps> {
  return dynamic(DEMO_LOADERS[id], { ssr: false });
}
```

- [ ] **Step 2: Use `getDemo()` in `PlaygroundShell.tsx`**

Replace the `paneA={...}` / `paneB={...}` lines with:

```tsx
import { getDemo } from '@/components/demos';
// ...
const Demo = getDemo(state.componentId);
// ...
paneA={<Demo config={state.configA} triggerKey={triggerKey} />}
paneB={<Demo config={configB} triggerKey={triggerKey} />}
```

- [ ] **Step 3: Commit (the imports will fail until demos exist; we'll create stubs in the next tasks)**

```bash
git add -A
git commit -m "feat(demos): add registry-based dynamic loader"
```

---

### Task 23: ToggleDemo

**Files:**
- Create: `components/demos/ToggleDemo.tsx`

- [ ] **Step 1: Create `components/demos/ToggleDemo.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import type { DemoProps } from './index';

export default function ToggleDemo({ config }: DemoProps) {
  const [on, setOn] = useState(false);
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => setOn((v) => !v)}
      className="relative h-8 w-14 rounded-full"
      style={{
        backgroundColor: on ? '#18181b' : '#d4d4d8',
        ...(isSpring ? {} : { transition: 'background-color var(--duration) var(--easing)', ...cssStyle }),
      }}
    >
      {isSpring ? (
        <motion.span
          className="absolute top-1 block h-6 w-6 rounded-full bg-white shadow"
          animate={{ x: on ? 24 : 4 }}
          transition={motionTransition}
        />
      ) : (
        <span
          className="absolute top-1 block h-6 w-6 rounded-full bg-white shadow"
          style={{
            transform: `translateX(${on ? 24 : 4}px)`,
            transition: 'transform var(--duration) var(--easing)',
            ...cssStyle,
          }}
        />
      )}
    </button>
  );
}
```

- [ ] **Step 2: Manually verify**

Run `npm run dev`, switch the picker to "Toggle". Click it; with default tween and spring presets, animation should differ noticeably.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(demos): toggle"
```

---

### Task 24: CheckboxDemo

**Files:**
- Create: `components/demos/CheckboxDemo.tsx`

- [ ] **Step 1: Create `components/demos/CheckboxDemo.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import type { DemoProps } from './index';

export default function CheckboxDemo({ config }: DemoProps) {
  const [checked, setChecked] = useState(false);
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => setChecked((v) => !v)}
      className="flex h-7 w-7 items-center justify-center rounded border-2"
      style={{
        backgroundColor: checked ? '#18181b' : 'transparent',
        borderColor: checked ? '#18181b' : '#a1a1aa',
        ...(isSpring ? {} : { transition: 'background-color var(--duration) var(--easing), border-color var(--duration) var(--easing)', ...cssStyle }),
      }}
    >
      {isSpring ? (
        <motion.span
          initial={false}
          animate={{ scale: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={motionTransition}
          className="text-white"
        >
          <Check className="h-4 w-4" strokeWidth={3} />
        </motion.span>
      ) : (
        <span
          className="text-white"
          style={{
            transform: `scale(${checked ? 1 : 0})`,
            opacity: checked ? 1 : 0,
            transition: 'transform var(--duration) var(--easing), opacity var(--duration) var(--easing)',
            ...cssStyle,
          }}
        >
          <Check className="h-4 w-4" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(demos): checkbox"
```

---

### Task 25: IconButtonDemo and TextButtonDemo

**Files:**
- Create: `components/demos/IconButtonDemo.tsx`, `components/demos/TextButtonDemo.tsx`

- [ ] **Step 1: Create `components/demos/IconButtonDemo.tsx`**

```tsx
'use client';

import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import type { DemoProps } from './index';

export default function IconButtonDemo({ config }: DemoProps) {
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  if (isSpring) {
    return (
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={motionTransition}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow ring-1 ring-border"
      >
        <Heart className="h-5 w-5" />
      </motion.button>
    );
  }

  return (
    <button
      type="button"
      className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow ring-1 ring-border hover:scale-110 active:scale-90"
      style={{ transition: 'transform var(--duration) var(--easing)', ...cssStyle }}
    >
      <Heart className="h-5 w-5" />
    </button>
  );
}
```

- [ ] **Step 2: Create `components/demos/TextButtonDemo.tsx`**

```tsx
'use client';

import { motion } from 'motion/react';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import type { DemoProps } from './index';

export default function TextButtonDemo({ config }: DemoProps) {
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  if (isSpring) {
    return (
      <motion.button
        whileHover={{ scale: 1.05, backgroundColor: '#27272a' }}
        whileTap={{ scale: 0.96 }}
        transition={motionTransition}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
      >
        Click me
      </motion.button>
    );
  }

  return (
    <button
      type="button"
      className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:scale-105 hover:bg-zinc-800 active:scale-95"
      style={{ transition: 'transform var(--duration) var(--easing), background-color var(--duration) var(--easing)', ...cssStyle }}
    >
      Click me
    </button>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(demos): icon-button + text-button"
```

---

### Task 26: AccordionDemo

**Files:**
- Create: `components/demos/AccordionDemo.tsx`

- [ ] **Step 1: Create `components/demos/AccordionDemo.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import type { DemoProps } from './index';

const ITEMS = [
  { id: '1', title: 'What is a micro-interaction?', body: 'Small moments of feedback. Toggles, ripples, transitions.' },
  { id: '2', title: 'Why do they matter?', body: 'They make interfaces feel alive and responsive.' },
  { id: '3', title: 'When do they go wrong?', body: 'When they are too long, too linear, or block input.' },
];

export default function AccordionDemo({ config }: DemoProps) {
  const [open, setOpen] = useState<string | null>('1');
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  return (
    <div className="w-full max-w-md space-y-1">
      {ITEMS.map((it) => {
        const isOpen = open === it.id;
        return (
          <div key={it.id} className="overflow-hidden rounded border bg-white">
            <button
              className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium"
              onClick={() => setOpen((cur) => (cur === it.id ? null : it.id))}
            >
              {it.title}
              <ChevronDown
                className="h-4 w-4"
                style={{
                  transform: `rotate(${isOpen ? 180 : 0}deg)`,
                  ...(isSpring ? {} : { transition: 'transform var(--duration) var(--easing)', ...cssStyle }),
                }}
              />
            </button>
            {isSpring ? (
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={motionTransition}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 text-sm text-muted-foreground">{it.body}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            ) : (
              <div
                className="overflow-hidden text-sm text-muted-foreground"
                style={{
                  maxHeight: isOpen ? 200 : 0,
                  opacity: isOpen ? 1 : 0,
                  transition: 'max-height var(--duration) var(--easing), opacity var(--duration) var(--easing)',
                  ...cssStyle,
                }}
              >
                <div className="px-3 pb-3">{it.body}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(demos): accordion"
```

---

### Task 27: TabsDemo

**Files:**
- Create: `components/demos/TabsDemo.tsx`

- [ ] **Step 1: Create `components/demos/TabsDemo.tsx`**

```tsx
'use client';

import { useState, useRef, useLayoutEffect } from 'react';
import { motion } from 'motion/react';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import type { DemoProps } from './index';

const TABS = ['Overview', 'Settings', 'Activity'];

export default function TabsDemo({ config }: DemoProps) {
  const [active, setActive] = useState(0);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  useLayoutEffect(() => {
    const el = refs.current[active];
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [active]);

  return (
    <div className="w-full max-w-sm">
      <div className="relative flex border-b">
        {TABS.map((label, i) => (
          <button
            key={label}
            ref={(el) => { refs.current[i] = el; }}
            onClick={() => setActive(i)}
            className={`px-4 py-2 text-sm ${i === active ? 'font-medium' : 'text-muted-foreground'}`}
          >
            {label}
          </button>
        ))}
        {isSpring ? (
          <motion.div
            className="absolute bottom-0 h-[2px] bg-foreground"
            animate={{ left: indicator.left, width: indicator.width }}
            transition={motionTransition}
          />
        ) : (
          <div
            className="absolute bottom-0 h-[2px] bg-foreground"
            style={{
              left: indicator.left,
              width: indicator.width,
              transition: 'left var(--duration) var(--easing), width var(--duration) var(--easing)',
              ...cssStyle,
            }}
          />
        )}
      </div>
      <div className="p-4 text-sm">{TABS[active]} content goes here.</div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(demos): tabs with sliding indicator"
```

---

### Task 28: StepperDemo

**Files:**
- Create: `components/demos/StepperDemo.tsx`

- [ ] **Step 1: Create `components/demos/StepperDemo.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import type { DemoProps } from './index';

const STEPS = ['Account', 'Profile', 'Done'];

export default function StepperDemo({ config }: DemoProps) {
  const [step, setStep] = useState(0);
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
      <div className="flex w-full items-center">
        {STEPS.map((label, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-medium"
                  style={{
                    backgroundColor: done || current ? '#18181b' : 'white',
                    borderColor: done || current ? '#18181b' : '#a1a1aa',
                    color: done || current ? 'white' : '#71717a',
                    ...(isSpring ? {} : { transition: 'background-color var(--duration) var(--easing), border-color var(--duration) var(--easing), color var(--duration) var(--easing)', ...cssStyle }),
                  }}
                >
                  {done ? (isSpring ? <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={motionTransition}><Check className="h-3.5 w-3.5" /></motion.span> : <Check className="h-3.5 w-3.5" />) : i + 1}
                </div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className="mx-2 h-px flex-1 bg-border" />}
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          Back
        </Button>
        <Button size="sm" disabled={step === STEPS.length - 1} onClick={() => setStep((s) => s + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(demos): stepper"
```

---

### Task 29: SliderDemo

**Files:**
- Create: `components/demos/SliderDemo.tsx`

- [ ] **Step 1: Create `components/demos/SliderDemo.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import type { DemoProps } from './index';

export default function SliderDemo({ config }: DemoProps) {
  const [target, setTarget] = useState(40);
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <input
        type="range"
        min={0}
        max={100}
        value={target}
        onChange={(e) => setTarget(Number(e.currentTarget.value))}
        className="w-full"
      />
      <div className="relative h-1 w-full rounded-full bg-zinc-200">
        {isSpring ? (
          <motion.div
            className="absolute -top-1.5 h-4 w-4 rounded-full bg-foreground"
            animate={{ left: `calc(${target}% - 8px)` }}
            transition={motionTransition}
          />
        ) : (
          <div
            className="absolute -top-1.5 h-4 w-4 rounded-full bg-foreground"
            style={{
              left: `calc(${target}% - 8px)`,
              transition: 'left var(--duration) var(--easing)',
              ...cssStyle,
            }}
          />
        )}
      </div>
      <p className="text-xs text-muted-foreground">Drag the input above; the visual thumb catches up using the configured animation.</p>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(demos): slider with animated thumb catch-up"
```

---

### Task 30: InputFieldDemo

**Files:**
- Create: `components/demos/InputFieldDemo.tsx`

- [ ] **Step 1: Create `components/demos/InputFieldDemo.tsx`**

```tsx
'use client';

import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import type { DemoProps } from './index';

export default function InputFieldDemo({ config }: DemoProps) {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);
  const floated = focused || value.length > 0;

  return (
    <div className="w-full max-w-xs">
      <div className="relative">
        <input
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.currentTarget.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="block w-full rounded-md border-2 bg-white px-3 pb-2 pt-5 text-sm outline-none"
          style={{
            borderColor: focused ? '#18181b' : '#e4e4e7',
            ...(isSpring ? {} : { transition: 'border-color var(--duration) var(--easing)', ...cssStyle }),
          }}
        />
        {isSpring ? (
          <motion.label
            onClick={() => ref.current?.focus()}
            initial={false}
            animate={floated ? { y: -10, scale: 0.8, color: '#18181b' } : { y: 0, scale: 1, color: '#71717a' }}
            transition={motionTransition}
            className="pointer-events-none absolute left-3 top-3 origin-top-left text-sm"
          >
            Email
          </motion.label>
        ) : (
          <label
            onClick={() => ref.current?.focus()}
            className="pointer-events-none absolute left-3 top-3 origin-top-left text-sm"
            style={{
              transform: floated ? 'translateY(-10px) scale(0.8)' : 'translateY(0) scale(1)',
              color: floated ? '#18181b' : '#71717a',
              transition: 'transform var(--duration) var(--easing), color var(--duration) var(--easing)',
              ...cssStyle,
            }}
          >
            Email
          </label>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(demos): input field with floating label"
```

---

### Task 31: SearchInputDemo

**Files:**
- Create: `components/demos/SearchInputDemo.tsx`

- [ ] **Step 1: Create `components/demos/SearchInputDemo.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X } from 'lucide-react';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import type { DemoProps } from './index';

const DATA = ['Modal', 'Toast', 'Toggle', 'Tabs', 'Dropdown', 'Slider'];

export default function SearchInputDemo({ config }: DemoProps) {
  const [q, setQ] = useState('');
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);
  const filtered = q ? DATA.filter((d) => d.toLowerCase().includes(q.toLowerCase())) : [];

  return (
    <div className="w-full max-w-xs">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.currentTarget.value)}
          placeholder="Search…"
          className="w-full rounded border bg-white py-2 pl-8 pr-8 text-sm"
        />
        {isSpring ? (
          <AnimatePresence>
            {q && (
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
            )}
          </AnimatePresence>
        ) : (
          <button
            onClick={() => setQ('')}
            aria-hidden={!q}
            className="absolute right-2 top-1/2 -translate-y-1/2"
            style={{
              opacity: q ? 1 : 0,
              transform: `translateY(-50%) scale(${q ? 1 : 0.6})`,
              pointerEvents: q ? 'auto' : 'none',
              transition: 'opacity var(--duration) var(--easing), transform var(--duration) var(--easing)',
              ...cssStyle,
            }}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {filtered.length > 0 && (
        <div
          className="mt-1 overflow-hidden rounded border bg-white shadow-sm"
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
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(demos): search input with clear button + results"
```

---

### Task 32: DropdownDemo

**Files:**
- Create: `components/demos/DropdownDemo.tsx`

- [ ] **Step 1: Create `components/demos/DropdownDemo.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import type { DemoProps } from './index';

const ITEMS = ['Profile', 'Settings', 'Sign out'];

export default function DropdownDemo({ config }: DemoProps) {
  const [open, setOpen] = useState(false);
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded border bg-white px-3 py-1.5 text-sm"
      >
        Account <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {isSpring ? (
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.96 }}
              transition={motionTransition}
              className="absolute left-0 top-full mt-1 w-40 origin-top rounded border bg-white shadow"
            >
              {ITEMS.map((it) => (
                <div key={it} className="cursor-pointer px-3 py-1.5 text-sm hover:bg-muted">{it}</div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <div
          className="absolute left-0 top-full mt-1 w-40 origin-top rounded border bg-white shadow"
          style={{
            opacity: open ? 1 : 0,
            transform: `scale(${open ? 1 : 0.96}) translateY(${open ? 0 : -4}px)`,
            pointerEvents: open ? 'auto' : 'none',
            transition: 'opacity var(--duration) var(--easing), transform var(--duration) var(--easing)',
            ...cssStyle,
          }}
        >
          {ITEMS.map((it) => (
            <div key={it} className="cursor-pointer px-3 py-1.5 text-sm hover:bg-muted">{it}</div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(demos): dropdown"
```

---

### Task 33: PopoverDemo

**Files:**
- Create: `components/demos/PopoverDemo.tsx`

- [ ] **Step 1: Create `components/demos/PopoverDemo.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import type { DemoProps } from './index';

export default function PopoverDemo({ config }: DemoProps) {
  const [open, setOpen] = useState(false);
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  return (
    <div className="relative">
      <Button size="sm" onClick={() => setOpen((v) => !v)}>
        {open ? 'Close popover' : 'Open popover'}
      </Button>
      {isSpring ? (
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -4 }}
              transition={motionTransition}
              className="absolute left-1/2 top-full z-10 mt-2 w-56 -translate-x-1/2 origin-top rounded-md border bg-white p-3 text-sm shadow-md"
            >
              <p className="font-medium">Popover content</p>
              <p className="mt-1 text-xs text-muted-foreground">Watch the scale + opacity origin point.</p>
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <div
          className="absolute left-1/2 top-full z-10 mt-2 w-56 -translate-x-1/2 origin-top rounded-md border bg-white p-3 text-sm shadow-md"
          style={{
            opacity: open ? 1 : 0,
            transform: `translateX(-50%) scale(${open ? 1 : 0.9}) translateY(${open ? 0 : -4}px)`,
            pointerEvents: open ? 'auto' : 'none',
            transition: 'opacity var(--duration) var(--easing), transform var(--duration) var(--easing)',
            ...cssStyle,
          }}
        >
          <p className="font-medium">Popover content</p>
          <p className="mt-1 text-xs text-muted-foreground">Watch the scale + opacity origin point.</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(demos): popover"
```

---

### Task 34: ModalDemo

**Files:**
- Create: `components/demos/ModalDemo.tsx`

- [ ] **Step 1: Create `components/demos/ModalDemo.tsx`**

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
    <div className="relative h-[280px] w-[420px] overflow-hidden rounded-lg border bg-white">
      <div className="flex h-10 items-center border-b bg-zinc-50 px-3 text-xs text-muted-foreground">Demo app</div>
      <div className="flex h-full items-center justify-center">
        <Button onClick={() => setOpen(true)}>Open modal</Button>
      </div>
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

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(demos): modal with backdrop + scale"
```

---

### Task 35: ToastDemo

**Files:**
- Create: `components/demos/ToastDemo.tsx`

- [ ] **Step 1: Create `components/demos/ToastDemo.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import type { DemoProps } from './index';

export default function ToastDemo({ config, triggerKey }: DemoProps) {
  const [visible, setVisible] = useState(false);
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  function show() {
    setVisible(true);
    setTimeout(() => setVisible(false), 2400);
  }

  return (
    <div className="relative h-[280px] w-[260px] overflow-hidden rounded-[20px] border-2 bg-zinc-50">
      <div className="absolute inset-x-0 top-0 h-7 bg-zinc-100 text-center text-[10px] leading-7 text-muted-foreground">
        Phone preview
      </div>
      <div className="flex h-full items-center justify-center">
        <Button size="sm" onClick={show}>Show toast</Button>
      </div>
      {isSpring ? (
        <AnimatePresence>
          {visible && (
            <motion.div
              key={triggerKey}
              initial={{ opacity: 0, x: 200 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 200 }}
              transition={motionTransition}
              className="absolute right-3 top-10 w-[200px] rounded-md bg-zinc-900 px-3 py-2 text-xs text-white shadow-lg"
            >
              Saved successfully.
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <div
          key={triggerKey}
          className="absolute right-3 top-10 w-[200px] rounded-md bg-zinc-900 px-3 py-2 text-xs text-white shadow-lg"
          style={{
            opacity: visible ? 1 : 0,
            transform: `translateX(${visible ? 0 : 200}px)`,
            transition: 'opacity var(--duration) var(--easing), transform var(--duration) var(--easing)',
            ...cssStyle,
          }}
        >
          Saved successfully.
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(demos): toast (slides into phone-frame)"
```

---

### Task 36: DatePickerDemo

**Files:**
- Create: `components/demos/DatePickerDemo.tsx`

- [ ] **Step 1: Create `components/demos/DatePickerDemo.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import type { DemoProps } from './index';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function DatePickerDemo({ config }: DemoProps) {
  const [open, setOpen] = useState(false);
  const [monthIdx, setMonthIdx] = useState(4); // May
  const [direction, setDirection] = useState(0);
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  function move(delta: number) {
    setDirection(delta);
    setMonthIdx((m) => (m + delta + 12) % 12);
  }

  return (
    <div className="relative">
      <Button size="sm" variant="outline" onClick={() => setOpen((v) => !v)}>
        <Calendar className="mr-2 h-3.5 w-3.5" />
        {MONTHS[monthIdx]} 2026
      </Button>
      {open && (
        <div
          className="absolute left-0 top-full z-10 mt-2 w-[260px] origin-top overflow-hidden rounded-md border bg-white p-3 shadow"
          style={
            isSpring
              ? undefined
              : { transition: 'all var(--duration) var(--easing)', ...cssStyle }
          }
        >
          <div className="mb-2 flex items-center justify-between">
            <button onClick={() => move(-1)} className="rounded p-1 hover:bg-muted"><ChevronLeft className="h-4 w-4" /></button>
            <div className="relative h-5 w-24 overflow-hidden text-center text-sm font-medium">
              {isSpring ? (
                <AnimatePresence initial={false} custom={direction}>
                  <motion.div
                    key={monthIdx}
                    custom={direction}
                    initial={{ x: direction * 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -direction * 30, opacity: 0 }}
                    transition={motionTransition}
                    className="absolute inset-0"
                  >
                    {MONTHS[monthIdx]} 2026
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="absolute inset-0">{MONTHS[monthIdx]} 2026</div>
              )}
            </div>
            <button onClick={() => move(1)} className="rounded p-1 hover:bg-muted"><ChevronRight className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="rounded p-1 hover:bg-muted">{i + 1}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(demos): date picker with month-transition animation"
```

---

### Task 37: SideMenuDemo

**Files:**
- Create: `components/demos/SideMenuDemo.tsx`

- [ ] **Step 1: Create `components/demos/SideMenuDemo.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Home, Settings, User, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import type { DemoProps } from './index';

const ITEMS = [
  { icon: Home, label: 'Home' },
  { icon: User, label: 'Profile' },
  { icon: Bell, label: 'Notifications' },
  { icon: Settings, label: 'Settings' },
];

export default function SideMenuDemo({ config }: DemoProps) {
  const [open, setOpen] = useState(false);
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  return (
    <div className="relative h-[300px] w-[420px] overflow-hidden rounded-lg border bg-white">
      <div className="flex h-10 items-center gap-2 border-b bg-zinc-50 px-3">
        <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
          <Menu className="h-4 w-4" />
        </Button>
        <span className="text-xs text-muted-foreground">Demo app</span>
      </div>
      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
        Click the menu icon
      </div>

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
              <motion.aside
                key="panel"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={motionTransition}
                className="absolute inset-y-0 left-0 flex w-56 flex-col gap-1 bg-white p-3 shadow-xl"
              >
                <SideMenuContent onClose={() => setOpen(false)} />
              </motion.aside>
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
          <aside
            className="absolute inset-y-0 left-0 flex w-56 flex-col gap-1 bg-white p-3 shadow-xl"
            style={{
              transform: `translateX(${open ? '0%' : '-100%'})`,
              transition: 'transform var(--duration) var(--easing)',
              ...cssStyle,
            }}
          >
            <SideMenuContent onClose={() => setOpen(false)} />
          </aside>
        </>
      )}
    </div>
  );
}

function SideMenuContent({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold">Menu</span>
        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onClose}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      {ITEMS.map(({ icon: Icon, label }) => (
        <button
          key={label}
          className="flex items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </>
  );
}
```

- [ ] **Step 2: Manually verify**

Run `npm run dev`, switch to "Side menu". Open it; the panel should slide in from the left with the configured timing. Spring presets should feel bouncy; "Sluggish" preset should feel sluggish.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(demos): side menu (slide-in + backdrop)"
```

---

### Task 38: ChipsDemo

**Files:**
- Create: `components/demos/ChipsDemo.tsx`

- [ ] **Step 1: Create `components/demos/ChipsDemo.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import type { DemoProps } from './index';

const SEED = ['design', 'animation', 'react', 'product', 'frontend'];

export default function ChipsDemo({ config }: DemoProps) {
  const [chips, setChips] = useState<string[]>(SEED);
  const [pool, setPool] = useState<string[]>(['css', 'spring', 'ux', 'tailwind']);
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  function remove(label: string) {
    setChips((cs) => cs.filter((c) => c !== label));
    setPool((p) => (p.includes(label) ? p : [...p, label]));
  }
  function add(label: string) {
    setChips((cs) => (cs.includes(label) ? cs : [...cs, label]));
    setPool((p) => p.filter((c) => c !== label));
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {isSpring ? (
          <AnimatePresence mode="popLayout">
            {chips.map((label) => (
              <motion.button
                key={label}
                layout
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={motionTransition}
                onClick={() => remove(label)}
                className="flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-xs"
              >
                {label}
                <X className="h-3 w-3" />
              </motion.button>
            ))}
          </AnimatePresence>
        ) : (
          chips.map((label) => (
            <button
              key={label}
              onClick={() => remove(label)}
              className="flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-xs"
              style={{
                animation: 'chip-in var(--duration) var(--easing)',
                transition: 'all var(--duration) var(--easing)',
                ...cssStyle,
              }}
            >
              {label}
              <X className="h-3 w-3" />
            </button>
          ))
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Add</span>
        <div className="flex flex-wrap gap-2">
          {pool.map((label) => (
            <Button
              key={label}
              size="sm"
              variant="outline"
              className="h-7 rounded-full text-xs"
              onClick={() => add(label)}
            >
              <Plus className="mr-1 h-3 w-3" />
              {label}
            </Button>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes chip-in {
          from { opacity: 0; transform: scale(0.6); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
```

> Note: the CSS variant uses a one-shot `@keyframes` for entry; removal is instant in the CSS variant (no AnimatePresence). Spring mode uses Motion's `<AnimatePresence mode="popLayout">` for both entry and exit, which is the better experience and the reason this demo is more compelling on the spring side — that contrast itself is a learning moment.

- [ ] **Step 2: Manually verify**

Run `npm run dev`, switch to "Chips". Click `×` on a chip → it should removal-animate (in spring mode) or pop out instantly (in tween/CSS mode). Click "+ chip" in the pool → it animates in. The CSS-vs-spring contrast for *exit* animations is the key teaching moment here.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(demos): chips with add/remove animations"
```

---

## Phase 6 — Polish

### Task 39: Mobile notice (<768px)

**Files:**
- Create: `components/playground/MobileNotice.tsx`
- Modify: `components/playground/PlaygroundShell.tsx`

- [ ] **Step 1: Create `components/playground/MobileNotice.tsx`**

```tsx
export function MobileNotice() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background p-8 text-center md:hidden">
      <h1 className="text-lg font-semibold">Best viewed on desktop</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The playground panel needs more room than a phone screen has. Open this page on a wider display to play with animations.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Update `components/playground/PlaygroundShell.tsx`**

Wrap the existing return so the desktop layout is hidden under `md`:

```tsx
import { MobileNotice } from './MobileNotice';
// ...
return (
  <>
    <MobileNotice />
    <div className="hidden h-screen flex-col md:flex">
      {/* existing top-bar + canvas + panel here */}
    </div>
  </>
);
```

(Move the existing top bar / canvas / panel JSX inside the `<div className="hidden h-screen flex-col md:flex">` block.)

- [ ] **Step 3: Verify by resizing the browser**

```bash
npm run dev
```

Resize <768px → "Best viewed on desktop" notice. Resize ≥768px → playground.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(playground): mobile notice below 768px"
```

---

### Task 40: Smoke test — every component renders with both config types

**Files:**
- Create: `app/page.test.tsx`

- [ ] **Step 1: Create `app/page.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { COMPONENT_IDS } from '@/components/demos/registry';
import { getDemo } from '@/components/demos';
import { DEFAULT_TWEEN, DEFAULT_SPRING } from '@/lib/animation/defaults';

describe('demos smoke test', () => {
  for (const id of COMPONENT_IDS) {
    it(`${id} renders with tween config`, async () => {
      const Demo = getDemo(id);
      const { container } = render(<Demo config={DEFAULT_TWEEN} triggerKey={0} />);
      await waitFor(() => expect(container.firstChild).toBeTruthy());
    });

    it(`${id} renders with spring config`, async () => {
      const Demo = getDemo(id);
      const { container } = render(<Demo config={DEFAULT_SPRING} triggerKey={0} />);
      await waitFor(() => expect(container.firstChild).toBeTruthy());
    });
  }
});
```

- [ ] **Step 2: Run tests**

```bash
npm test
```

Expected: 34 demo tests pass (17 components × 2 config types). Plus the lib/hook tests already in place.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "test: smoke test every demo with tween and spring configs"
```

---

### Task 41: Manual QA checklist

**Files:** none

- [ ] **Step 1: Run dev server and walk through each component**

```bash
npm run dev
```

For each of the 17 components:
- Switch to it from the dropdown.
- Try all 4 presets.
- Switch from tween to spring and back; sliders update sensibly.
- Edit the cubic-bezier custom curve; preview SVG redraws.
- Toggle side-by-side; A/B tabs appear; "Trigger both" fires both panes; "Swap" reverses them.
- Click "Share" → URL is copied; pasting it in a new tab restores the exact state.
- Try the URL with hand-edited garbage (e.g., `?dur=banana`) → page falls back to defaults.
- Resize browser <768px → mobile notice appears.

- [ ] **Step 2: If anything is broken, fix and commit per-fix**

(Each fix is its own commit. No bundling.)

---

## Done

When all tasks are checked off and the manual QA list is clean, the playground is feature-complete per the spec.
