# Playground v2 — Phase 8 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add per-component options (`componentOptions`), per-demo logical sizes with scale-to-fit, canonical trigger registry, and the new component-specific options (popover position, toast direction, side menu kinds, slider rework, dropdown bounce, button hover/press scale).

**Architecture:** Three independent foundation tasks (8a-i, 8a-ii, 8a-iii); a roll-out task (8b) that implements canonical triggers across all demos; then per-component option tasks that build on top.

**Tech Stack:** Same as Phase 7. New: `useImperativeHandle`, React context for per-pane refs.

**Spec:** [`docs/superpowers/specs/2026-05-07-playground-v2-design.md`](../specs/2026-05-07-playground-v2-design.md)

**Prerequisite:** Phase 7 complete and merged.

---

## File structure

New files in this phase:

```
lib/
  component-options/
    types.ts           # ComponentOptions type + per-component option types
    defaults.ts        # default values per component
    encode.ts          # serialize componentOptions to URL params
    decode.ts          # parse URL params back to componentOptions
    encode.test.ts
    decode.test.ts
hooks/
  useDemoTrigger.ts    # ref helper for canonical triggers
components/
  playground/
    PaneScaler.tsx     # outer scaling container (logical size + scale-to-fit)
  demos/
    options/           # per-component option sub-modules
      popover.ts
      toast.ts
      sideMenu.ts
      dropdown.ts
      iconButton.ts
      textButton.ts
      slider.ts
```

---

## Sub-phase 8a-i — `componentOptions` type system + URL encoding

### Task 1: Define ComponentOptions types

**Files:**
- Create: `lib/component-options/types.ts`
- Test: `lib/component-options/types.test.ts` (compile-only test)

- [ ] **Step 1: Create types.ts**

```ts
import type { SpringConfig } from '@/lib/animation/types';

export type PopoverPosition =
  | 'top-left' | 'top' | 'top-right'
  | 'left' | 'right'
  | 'bottom-left' | 'bottom' | 'bottom-right';

export type ToastDirection =
  | 'top-left' | 'top' | 'top-right'
  | 'bottom-left' | 'bottom' | 'bottom-right';

export type SideMenuKind = 'slide' | 'dissolve' | 'scale' | 'push';
export type SideMenuSide = 'left' | 'right';

export type PopoverOptions = { position: PopoverPosition };
export type ToastOptions = { direction: ToastDirection };
export type SideMenuOptions = {
  side: SideMenuSide;
  kind: SideMenuKind;
  bounce: boolean;
  layered: boolean;
};
export type DropdownOptions = { bounce: boolean };
export type IconButtonOptions = { hoverScale: number; pressScale: number };
export type TextButtonOptions = { hoverScale: number; pressScale: number };
export type SliderOptions = { increment: number; dragSpring: SpringConfig };

export type ComponentOptions = {
  popover?: PopoverOptions;
  toast?: ToastOptions;
  sideMenu?: SideMenuOptions;
  dropdown?: DropdownOptions;
  iconButton?: IconButtonOptions;
  textButton?: TextButtonOptions;
  slider?: SliderOptions;
};

export type ComponentOptionsKey = keyof ComponentOptions;
```

- [ ] **Step 2: Create the compile-only test**

`lib/component-options/types.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import type {
  ComponentOptions,
  PopoverPosition,
  ToastDirection,
  SideMenuKind,
} from './types';

describe('ComponentOptions types', () => {
  it('compiles with all option slices', () => {
    const opts: ComponentOptions = {
      popover: { position: 'top-right' },
      toast: { direction: 'bottom-left' },
      sideMenu: { side: 'left', kind: 'slide', bounce: true, layered: false },
      dropdown: { bounce: false },
      iconButton: { hoverScale: 1.05, pressScale: 0.95 },
      textButton: { hoverScale: 1.05, pressScale: 0.95 },
      slider: {
        increment: 5,
        dragSpring: { type: 'spring', stiffness: 200, damping: 20, mass: 1 },
      },
    };
    expect(opts.popover?.position).toBe('top-right');
  });

  it('PopoverPosition includes all 8 positions', () => {
    const positions: PopoverPosition[] = [
      'top-left', 'top', 'top-right', 'left', 'right',
      'bottom-left', 'bottom', 'bottom-right',
    ];
    expect(positions).toHaveLength(8);
  });

  it('ToastDirection includes all 6 directions', () => {
    const dirs: ToastDirection[] = [
      'top-left', 'top', 'top-right', 'bottom-left', 'bottom', 'bottom-right',
    ];
    expect(dirs).toHaveLength(6);
  });

  it('SideMenuKind includes all 4 kinds', () => {
    const kinds: SideMenuKind[] = ['slide', 'dissolve', 'scale', 'push'];
    expect(kinds).toHaveLength(4);
  });
});
```

- [ ] **Step 3: Run tests**

```bash
npm test -- types
```

Expected: all 4 tests pass.

- [ ] **Step 4: Commit**

```bash
git add lib/component-options/types.ts lib/component-options/types.test.ts
git commit -m "feat(component-options): add type definitions"
```

---

### Task 2: Per-component default values

**Files:**
- Create: `lib/component-options/defaults.ts`
- Test: `lib/component-options/defaults.test.ts`

- [ ] **Step 1: Write the failing test**

`lib/component-options/defaults.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  DEFAULT_POPOVER,
  DEFAULT_TOAST,
  DEFAULT_SIDE_MENU,
  DEFAULT_DROPDOWN,
  DEFAULT_ICON_BUTTON,
  DEFAULT_TEXT_BUTTON,
  DEFAULT_SLIDER,
} from './defaults';

describe('component option defaults', () => {
  it('popover defaults to bottom', () => {
    expect(DEFAULT_POPOVER.position).toBe('bottom');
  });
  it('toast defaults to bottom-right', () => {
    expect(DEFAULT_TOAST.direction).toBe('bottom-right');
  });
  it('side menu defaults to left, slide, no bounce, no layered', () => {
    expect(DEFAULT_SIDE_MENU).toEqual({
      side: 'left', kind: 'slide', bounce: false, layered: false,
    });
  });
  it('dropdown bounce defaults off', () => {
    expect(DEFAULT_DROPDOWN.bounce).toBe(false);
  });
  it('icon button scales default to 1.05 / 0.95', () => {
    expect(DEFAULT_ICON_BUTTON).toEqual({ hoverScale: 1.05, pressScale: 0.95 });
  });
  it('text button scales default to 1.05 / 0.95', () => {
    expect(DEFAULT_TEXT_BUTTON).toEqual({ hoverScale: 1.05, pressScale: 0.95 });
  });
  it('slider defaults: increment 5, dragSpring is a SpringConfig', () => {
    expect(DEFAULT_SLIDER.increment).toBe(5);
    expect(DEFAULT_SLIDER.dragSpring.type).toBe('spring');
  });
});
```

- [ ] **Step 2: Run, expect fail**

```bash
npm test -- defaults
```

Expected: FAIL (file doesn't exist).

- [ ] **Step 3: Write defaults.ts**

```ts
import type {
  PopoverOptions, ToastOptions, SideMenuOptions, DropdownOptions,
  IconButtonOptions, TextButtonOptions, SliderOptions,
} from './types';

export const DEFAULT_POPOVER: PopoverOptions = { position: 'bottom' };
export const DEFAULT_TOAST: ToastOptions = { direction: 'bottom-right' };
export const DEFAULT_SIDE_MENU: SideMenuOptions = {
  side: 'left', kind: 'slide', bounce: false, layered: false,
};
export const DEFAULT_DROPDOWN: DropdownOptions = { bounce: false };
export const DEFAULT_ICON_BUTTON: IconButtonOptions = { hoverScale: 1.05, pressScale: 0.95 };
export const DEFAULT_TEXT_BUTTON: TextButtonOptions = { hoverScale: 1.05, pressScale: 0.95 };
export const DEFAULT_SLIDER: SliderOptions = {
  increment: 5,
  dragSpring: { type: 'spring', stiffness: 200, damping: 20, mass: 1 },
};
```

- [ ] **Step 4: Run, expect pass**

```bash
npm test -- defaults
```

Expected: 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/component-options/defaults.ts lib/component-options/defaults.test.ts
git commit -m "feat(component-options): default values per component"
```

---

### Task 3: URL encoding (encode.ts)

**Files:**
- Create: `lib/component-options/encode.ts`
- Test: `lib/component-options/encode.test.ts`

**Why:** Spec §5 — component options serialize as namespaced compact keys (e.g., `popover.pos=tr`). When side-by-side is on, B's keys also get the `b.` prefix.

- [ ] **Step 1: Write the failing test**

`lib/component-options/encode.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { encodeComponentOptions } from './encode';
import type { ComponentOptions } from './types';

describe('encodeComponentOptions', () => {
  it('returns empty params when options are empty', () => {
    const params = new URLSearchParams();
    encodeComponentOptions(params, '', {});
    expect(params.toString()).toBe('');
  });

  it('encodes popover position with namespaced key', () => {
    const params = new URLSearchParams();
    encodeComponentOptions(params, '', { popover: { position: 'top-right' } });
    expect(params.get('popover.pos')).toBe('tr');
  });

  it('encodes toast direction', () => {
    const params = new URLSearchParams();
    encodeComponentOptions(params, '', { toast: { direction: 'bottom-left' } });
    expect(params.get('toast.dir')).toBe('bl');
  });

  it('encodes side menu options', () => {
    const params = new URLSearchParams();
    encodeComponentOptions(params, '', {
      sideMenu: { side: 'right', kind: 'dissolve', bounce: true, layered: false },
    });
    expect(params.get('sideMenu.side')).toBe('right');
    expect(params.get('sideMenu.kind')).toBe('dissolve');
    expect(params.get('sideMenu.bounce')).toBe('1');
    expect(params.get('sideMenu.layered')).toBe('0');
  });

  it('encodes dropdown bounce', () => {
    const params = new URLSearchParams();
    encodeComponentOptions(params, '', { dropdown: { bounce: true } });
    expect(params.get('dropdown.bounce')).toBe('1');
  });

  it('encodes icon button hover and press scale', () => {
    const params = new URLSearchParams();
    encodeComponentOptions(params, '', {
      iconButton: { hoverScale: 1.1, pressScale: 0.9 },
    });
    expect(params.get('iconButton.hov')).toBe('1.1');
    expect(params.get('iconButton.pre')).toBe('0.9');
  });

  it('encodes slider increment and drag spring', () => {
    const params = new URLSearchParams();
    encodeComponentOptions(params, '', {
      slider: {
        increment: 10,
        dragSpring: { type: 'spring', stiffness: 300, damping: 25, mass: 1.5 },
      },
    });
    expect(params.get('slider.inc')).toBe('10');
    expect(params.get('slider.s')).toBe('300');
    expect(params.get('slider.d')).toBe('25');
    expect(params.get('slider.m')).toBe('1.5');
  });

  it('applies pane prefix to all keys', () => {
    const params = new URLSearchParams();
    encodeComponentOptions(params, 'b.', { popover: { position: 'top' } });
    expect(params.get('b.popover.pos')).toBe('t');
  });
});
```

- [ ] **Step 2: Run, expect fail**

```bash
npm test -- encode
```

Expected: FAIL.

- [ ] **Step 3: Write encode.ts**

```ts
import type { ComponentOptions, PopoverPosition, ToastDirection } from './types';

const POPOVER_POS_TO_CODE: Record<PopoverPosition, string> = {
  'top-left': 'tl', 'top': 't', 'top-right': 'tr',
  'left': 'l', 'right': 'r',
  'bottom-left': 'bl', 'bottom': 'b', 'bottom-right': 'br',
};

const TOAST_DIR_TO_CODE: Record<ToastDirection, string> = {
  'top-left': 'tl', 'top': 't', 'top-right': 'tr',
  'bottom-left': 'bl', 'bottom': 'b', 'bottom-right': 'br',
};

export function encodeComponentOptions(
  params: URLSearchParams,
  prefix: string,
  opts: Partial<ComponentOptions>,
): void {
  const k = (key: string) => `${prefix}${key}`;

  if (opts.popover) {
    params.set(k('popover.pos'), POPOVER_POS_TO_CODE[opts.popover.position]);
  }
  if (opts.toast) {
    params.set(k('toast.dir'), TOAST_DIR_TO_CODE[opts.toast.direction]);
  }
  if (opts.sideMenu) {
    params.set(k('sideMenu.side'), opts.sideMenu.side);
    params.set(k('sideMenu.kind'), opts.sideMenu.kind);
    params.set(k('sideMenu.bounce'), opts.sideMenu.bounce ? '1' : '0');
    params.set(k('sideMenu.layered'), opts.sideMenu.layered ? '1' : '0');
  }
  if (opts.dropdown) {
    params.set(k('dropdown.bounce'), opts.dropdown.bounce ? '1' : '0');
  }
  if (opts.iconButton) {
    params.set(k('iconButton.hov'), String(opts.iconButton.hoverScale));
    params.set(k('iconButton.pre'), String(opts.iconButton.pressScale));
  }
  if (opts.textButton) {
    params.set(k('textButton.hov'), String(opts.textButton.hoverScale));
    params.set(k('textButton.pre'), String(opts.textButton.pressScale));
  }
  if (opts.slider) {
    params.set(k('slider.inc'), String(opts.slider.increment));
    params.set(k('slider.s'), String(opts.slider.dragSpring.stiffness));
    params.set(k('slider.d'), String(opts.slider.dragSpring.damping));
    params.set(k('slider.m'), String(opts.slider.dragSpring.mass));
  }
}
```

- [ ] **Step 4: Run, expect pass**

```bash
npm test -- encode
```

Expected: 8 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/component-options/encode.ts lib/component-options/encode.test.ts
git commit -m "feat(component-options): URL encoder with namespaced keys"
```

---

### Task 4: URL decoding (decode.ts)

**Files:**
- Create: `lib/component-options/decode.ts`
- Test: `lib/component-options/decode.test.ts`

- [ ] **Step 1: Write the failing test**

`lib/component-options/decode.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { decodeComponentOptions } from './decode';

describe('decodeComponentOptions', () => {
  it('returns empty object when no relevant keys', () => {
    const params = new URLSearchParams();
    const result = decodeComponentOptions(params, '', 'popover');
    expect(result).toEqual({});
  });

  it('decodes popover position', () => {
    const params = new URLSearchParams('popover.pos=tr');
    const result = decodeComponentOptions(params, '', 'popover');
    expect(result.popover?.position).toBe('top-right');
  });

  it('falls back to default popover position when key missing', () => {
    const params = new URLSearchParams();
    const result = decodeComponentOptions(params, '', 'popover');
    // returns empty if no keys; caller merges with defaults
    expect(result.popover).toBeUndefined();
  });

  it('ignores keys belonging to other components', () => {
    const params = new URLSearchParams('toast.dir=tl&popover.pos=tr');
    const result = decodeComponentOptions(params, '', 'popover');
    expect(result.popover?.position).toBe('top-right');
    expect(result.toast).toBeUndefined();
  });

  it('decodes toast direction', () => {
    const params = new URLSearchParams('toast.dir=bl');
    const result = decodeComponentOptions(params, '', 'toast');
    expect(result.toast?.direction).toBe('bottom-left');
  });

  it('decodes side menu options', () => {
    const params = new URLSearchParams(
      'sideMenu.side=right&sideMenu.kind=dissolve&sideMenu.bounce=1&sideMenu.layered=0',
    );
    const result = decodeComponentOptions(params, '', 'sideMenu');
    expect(result.sideMenu).toEqual({
      side: 'right', kind: 'dissolve', bounce: true, layered: false,
    });
  });

  it('decodes dropdown bounce', () => {
    const params = new URLSearchParams('dropdown.bounce=1');
    const result = decodeComponentOptions(params, '', 'dropdown');
    expect(result.dropdown?.bounce).toBe(true);
  });

  it('decodes icon button scales', () => {
    const params = new URLSearchParams('iconButton.hov=1.1&iconButton.pre=0.9');
    const result = decodeComponentOptions(params, '', 'iconButton');
    expect(result.iconButton).toEqual({ hoverScale: 1.1, pressScale: 0.9 });
  });

  it('decodes slider with drag spring', () => {
    const params = new URLSearchParams(
      'slider.inc=10&slider.s=300&slider.d=25&slider.m=1.5',
    );
    const result = decodeComponentOptions(params, '', 'slider');
    expect(result.slider?.increment).toBe(10);
    expect(result.slider?.dragSpring).toEqual({
      type: 'spring', stiffness: 300, damping: 25, mass: 1.5,
    });
  });

  it('respects pane prefix', () => {
    const params = new URLSearchParams('b.popover.pos=t');
    const result = decodeComponentOptions(params, 'b.', 'popover');
    expect(result.popover?.position).toBe('top');
  });

  it('falls back gracefully on garbage', () => {
    const params = new URLSearchParams('popover.pos=xyz');
    const result = decodeComponentOptions(params, '', 'popover');
    expect(result.popover).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run, expect fail**

```bash
npm test -- decode
```

- [ ] **Step 3: Write decode.ts**

```ts
import type {
  ComponentOptions, ComponentOptionsKey,
  PopoverPosition, ToastDirection, SideMenuKind, SideMenuSide,
} from './types';

const POPOVER_CODE_TO_POS: Record<string, PopoverPosition> = {
  tl: 'top-left', t: 'top', tr: 'top-right',
  l: 'left', r: 'right',
  bl: 'bottom-left', b: 'bottom', br: 'bottom-right',
};

const TOAST_CODE_TO_DIR: Record<string, ToastDirection> = {
  tl: 'top-left', t: 'top', tr: 'top-right',
  bl: 'bottom-left', b: 'bottom', br: 'bottom-right',
};

const SIDE_MENU_KINDS: SideMenuKind[] = ['slide', 'dissolve', 'scale', 'push'];
const SIDE_MENU_SIDES: SideMenuSide[] = ['left', 'right'];

function parseNum(raw: string | null): number | null {
  if (raw == null) return null;
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}

function parseBool(raw: string | null): boolean | null {
  if (raw === '1') return true;
  if (raw === '0') return false;
  return null;
}

export function decodeComponentOptions(
  params: URLSearchParams,
  prefix: string,
  optionsKey: ComponentOptionsKey,
): Partial<ComponentOptions> {
  const k = (key: string) => `${prefix}${key}`;

  if (optionsKey === 'popover') {
    const code = params.get(k('popover.pos'));
    const position = code ? POPOVER_CODE_TO_POS[code] : null;
    return position ? { popover: { position } } : {};
  }

  if (optionsKey === 'toast') {
    const code = params.get(k('toast.dir'));
    const direction = code ? TOAST_CODE_TO_DIR[code] : null;
    return direction ? { toast: { direction } } : {};
  }

  if (optionsKey === 'sideMenu') {
    const sideRaw = params.get(k('sideMenu.side'));
    const kindRaw = params.get(k('sideMenu.kind'));
    const side = sideRaw && SIDE_MENU_SIDES.includes(sideRaw as SideMenuSide)
      ? (sideRaw as SideMenuSide) : null;
    const kind = kindRaw && SIDE_MENU_KINDS.includes(kindRaw as SideMenuKind)
      ? (kindRaw as SideMenuKind) : null;
    const bounce = parseBool(params.get(k('sideMenu.bounce')));
    const layered = parseBool(params.get(k('sideMenu.layered')));
    if (side && kind && bounce !== null && layered !== null) {
      return { sideMenu: { side, kind, bounce, layered } };
    }
    return {};
  }

  if (optionsKey === 'dropdown') {
    const bounce = parseBool(params.get(k('dropdown.bounce')));
    return bounce !== null ? { dropdown: { bounce } } : {};
  }

  if (optionsKey === 'iconButton') {
    const hov = parseNum(params.get(k('iconButton.hov')));
    const pre = parseNum(params.get(k('iconButton.pre')));
    return hov !== null && pre !== null
      ? { iconButton: { hoverScale: hov, pressScale: pre } }
      : {};
  }

  if (optionsKey === 'textButton') {
    const hov = parseNum(params.get(k('textButton.hov')));
    const pre = parseNum(params.get(k('textButton.pre')));
    return hov !== null && pre !== null
      ? { textButton: { hoverScale: hov, pressScale: pre } }
      : {};
  }

  if (optionsKey === 'slider') {
    const inc = parseNum(params.get(k('slider.inc')));
    const s = parseNum(params.get(k('slider.s')));
    const d = parseNum(params.get(k('slider.d')));
    const m = parseNum(params.get(k('slider.m')));
    if (inc !== null && s !== null && d !== null && m !== null) {
      return {
        slider: {
          increment: inc,
          dragSpring: { type: 'spring', stiffness: s, damping: d, mass: m },
        },
      };
    }
    return {};
  }

  return {};
}
```

- [ ] **Step 4: Run, expect pass**

```bash
npm test -- decode
```

Expected: 11 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/component-options/decode.ts lib/component-options/decode.test.ts
git commit -m "feat(component-options): URL decoder with namespaced keys"
```

---

### Task 5: Wire componentOptions into PlaygroundState and useUrlState

**Files:**
- Modify: `lib/url-state.ts`
- Modify: `hooks/useUrlState.ts`
- Test: `lib/url-state.test.ts` (extend)
- Modify: `components/demos/registry.ts` (add `optionsKey` field)

- [ ] **Step 1: Add optionsKey to registry**

Modify `components/demos/registry.ts`. Add a parallel map:

```ts
import type { ComponentOptionsKey } from '@/lib/component-options/types';

export const OPTIONS_KEYS: Partial<Record<ComponentId, ComponentOptionsKey>> = {
  'popover': 'popover',
  'toast': 'toast',
  'side-menu': 'sideMenu',
  'dropdown': 'dropdown',
  'icon-button': 'iconButton',
  'text-button': 'textButton',
  'slider': 'slider',
};

export function getOptionsKey(id: ComponentId): ComponentOptionsKey | undefined {
  return OPTIONS_KEYS[id];
}
```

- [ ] **Step 2: Extend PlaygroundState in lib/url-state.ts**

```ts
import type { ComponentOptions } from './component-options/types';
import { encodeComponentOptions } from './component-options/encode';
import { decodeComponentOptions } from './component-options/decode';
import { getOptionsKey } from '@/components/demos/registry';

export type PlaygroundState = {
  componentId: ComponentId;
  configA: AnimationConfig;
  configB?: AnimationConfig;
  componentOptionsA: Partial<ComponentOptions>;
  componentOptionsB?: Partial<ComponentOptions>;
  sideBySide: boolean;
};

// Update serializeState:
export function serializeState(state: PlaygroundState): URLSearchParams {
  const params = new URLSearchParams();
  params.set('c', state.componentId);
  encodeConfig(params, '', state.configA);
  encodeComponentOptions(params, '', state.componentOptionsA);
  if (state.sideBySide && state.configB) {
    params.set('sbs', '1');
    encodeConfig(params, 'b.', state.configB);
    if (state.componentOptionsB) {
      encodeComponentOptions(params, 'b.', state.componentOptionsB);
    }
  }
  return params;
}

// Update parseState:
export function parseState(input: string | URLSearchParams): PlaygroundState {
  const params = typeof input === 'string' ? new URLSearchParams(input) : input;
  const rawId = params.get('c') ?? '';
  const componentId = isComponentId(rawId) ? rawId : DEFAULT_COMPONENT_ID;
  const configA = parseConfigAt(params, '', DEFAULT_TWEEN);
  const sideBySide = params.get('sbs') === '1';
  const configB = sideBySide ? parseConfigAt(params, 'b.', DEFAULT_SPRING) : undefined;

  const optionsKey = getOptionsKey(componentId);
  const componentOptionsA = optionsKey
    ? decodeComponentOptions(params, '', optionsKey)
    : {};
  const componentOptionsB = sideBySide && optionsKey
    ? decodeComponentOptions(params, 'b.', optionsKey)
    : undefined;

  return { componentId, configA, configB, componentOptionsA, componentOptionsB, sideBySide };
}
```

- [ ] **Step 3: Extend tests**

Add to `lib/url-state.test.ts`:

```ts
import { DEFAULT_POPOVER } from './component-options/defaults';

describe('PlaygroundState with component options', () => {
  it('round-trips popover position', () => {
    const state: PlaygroundState = {
      componentId: 'popover',
      configA: DEFAULT_TWEEN,
      componentOptionsA: { popover: { position: 'top-right' } },
      sideBySide: false,
    };
    const params = serializeState(state);
    expect(params.get('popover.pos')).toBe('tr');
    const parsed = parseState(params);
    expect(parsed.componentOptionsA.popover?.position).toBe('top-right');
  });

  it('round-trips per-pane options when side-by-side', () => {
    const state: PlaygroundState = {
      componentId: 'popover',
      configA: DEFAULT_TWEEN,
      configB: DEFAULT_TWEEN,
      componentOptionsA: { popover: { position: 'top-right' } },
      componentOptionsB: { popover: { position: 'bottom-left' } },
      sideBySide: true,
    };
    const params = serializeState(state);
    expect(params.get('popover.pos')).toBe('tr');
    expect(params.get('b.popover.pos')).toBe('bl');
  });

  it('parses v1 URL (no component options) without error', () => {
    const params = new URLSearchParams('c=popover&t=tween&dur=250');
    const parsed = parseState(params);
    expect(parsed.componentOptionsA).toEqual({});
  });
});
```

- [ ] **Step 4: Verify useUrlState requires no changes**

`hooks/useUrlState.ts` derives initial state via `parseState(window.location.search)` and updates state via spread updaters. Both paths flow through the new `PlaygroundState` shape automatically:

- Initial parse: `parseState` now returns `componentOptionsA: {}` and `componentOptionsB: undefined` for v1 URLs; that's correct.
- Updates: existing `setState((prev) => ({ ...prev, ... }))` calls preserve the new fields.

No code changes to `useUrlState.ts`. Just confirm by reading the file.

- [ ] **Step 5: Run all tests**

```bash
npm test
```

Expected: all pass (existing 29 + 8 new + 11 new = ~48).

- [ ] **Step 6: Commit**

```bash
git add lib/url-state.ts lib/url-state.test.ts hooks/useUrlState.ts components/demos/registry.ts
git commit -m "feat(state): wire componentOptions into PlaygroundState and useUrlState"
```

---

## Sub-phase 8a-ii — Per-demo logical size + pane scale-to-fit

### Task 6: Add logicalSize to demo registry

**Files:**
- Modify: `components/demos/registry.ts`

- [ ] **Step 1: Add logical sizes**

```ts
export type LogicalSize = { width: number; height: number };

export const LOGICAL_SIZES: Record<ComponentId, LogicalSize> = {
  'icon-button':  { width: 200, height: 200 },
  'text-button':  { width: 240, height: 80 },
  'toggle':       { width: 200, height: 80 },
  'checkbox':     { width: 200, height: 80 },
  'accordion':    { width: 360, height: 320 },
  'tabs':         { width: 360, height: 200 },
  'stepper':      { width: 480, height: 160 },
  'slider':       { width: 360, height: 120 },
  'input-field':  { width: 320, height: 120 },
  'search-input': { width: 320, height: 280 },
  'dropdown':     { width: 240, height: 360 },
  'popover':      { width: 320, height: 280 },
  'modal':        { width: 480, height: 360 },
  'date-picker':  { width: 320, height: 380 },
  'toast':        { width: 390, height: 880 },
  'side-menu':    { width: 360, height: 480 },
  'chips':        { width: 360, height: 160 },
};

export function getLogicalSize(id: ComponentId): LogicalSize {
  return LOGICAL_SIZES[id];
}
```

- [ ] **Step 2: Smoke-test**

Add to `components/demos/registry.test.ts`:

```ts
import { LOGICAL_SIZES, COMPONENT_IDS } from './registry';

describe('logical sizes', () => {
  it('every component has a logical size', () => {
    for (const id of COMPONENT_IDS) {
      expect(LOGICAL_SIZES[id]).toBeDefined();
      expect(LOGICAL_SIZES[id].width).toBeGreaterThan(0);
      expect(LOGICAL_SIZES[id].height).toBeGreaterThan(0);
    }
  });
  it('toast is 390x880', () => {
    expect(LOGICAL_SIZES['toast']).toEqual({ width: 390, height: 880 });
  });
});
```

```bash
npm test -- registry
```

- [ ] **Step 3: Commit**

```bash
git add components/demos/registry.ts components/demos/registry.test.ts
git commit -m "feat(demos): logical sizes per component"
```

---

### Task 7: Build PaneScaler

**Files:**
- Create: `components/playground/PaneScaler.tsx`

**Why:** Spec §4 — pane wrapper measures itself, computes scale, applies `transform: scale()` to a logical-size container. Outer container takes the *scaled* size so flex layout is correct.

- [ ] **Step 1: Create the file**

```tsx
'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type Props = {
  width: number;
  height: number;
  children: ReactNode;
};

export function PaneScaler({ width, height, children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current?.parentElement;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      const paneW = el.clientWidth;
      const paneH = el.clientHeight;
      // padding inside the pane is currently p-8 → 32px on each side
      const usableW = Math.max(0, paneW - 64);
      const usableH = Math.max(0, paneH - 64);
      const next = Math.min(usableW / width, usableH / height, 1);
      setScale(next > 0 ? next : 1);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [width, height]);

  return (
    <div
      ref={containerRef}
      style={{ width: width * scale, height: height * scale }}
      className="relative"
    >
      <div
        style={{
          width,
          height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
        className="absolute left-0 top-0"
      >
        {children}
      </div>
    </div>
  );
}
```

Notes:
- The outer ref-bound div takes `(width × scale) × (height × scale)` so flex layout in the pane treats it as the actual visual size.
- The inner div has logical size and is scaled with `transform: scale()` from `top-left`.
- ResizeObserver watches the parent (the Pane) and recomputes on resize.

- [ ] **Step 2: Manual quick test**

Use it once in any demo (e.g., toast) to verify scaling works visually. We'll wire it into all demos in the next task.

- [ ] **Step 3: Commit**

```bash
git add components/playground/PaneScaler.tsx
git commit -m "feat(playground): PaneScaler with ResizeObserver scale-to-fit"
```

---

### Task 8: Wire PaneScaler into PlaygroundShell + DemoFrame

**Files:**
- Modify: `components/demos/DemoFrame.tsx`
- Modify: `components/playground/PlaygroundShell.tsx`

**Why:** Replace the simple `DemoFrame` (just a flex container) with one that uses logical sizes. The shell already knows the active component id; we look up the logical size and pass it to the scaler.

- [ ] **Step 1: Update DemoFrame**

```tsx
'use client';

import type { ReactNode } from 'react';
import { PaneScaler } from '@/components/playground/PaneScaler';
import { getLogicalSize, type ComponentId } from '@/components/demos/registry';

export function DemoFrame({
  componentId,
  children,
}: {
  componentId: ComponentId;
  children: ReactNode;
}) {
  const size = getLogicalSize(componentId);
  return (
    <PaneScaler width={size.width} height={size.height}>
      {children}
    </PaneScaler>
  );
}
```

- [ ] **Step 2: Update PlaygroundShell to pass componentId to DemoFrame**

In `components/playground/PlaygroundShell.tsx`, change the two `<DemoFrame ...>` usages:

```tsx
paneA={<DemoFrame componentId={state.componentId} key={triggerKey}><Demo config={state.configA} triggerKey={triggerKey} /></DemoFrame>}
paneB={<DemoFrame componentId={state.componentId} key={triggerKey}><Demo config={configB} triggerKey={triggerKey} /></DemoFrame>}
```

- [ ] **Step 3: Update demos to use full logical-size container**

Many demos currently use `max-w-md` or `w-full` outer wrappers. With PaneScaler providing a fixed-size box, demos should use `w-full h-full` on their outermost wrapper so they fill the logical size.

For each demo, change the outermost div from `w-full max-w-md` (or similar) to `flex h-full w-full items-center justify-center`. This is repetitive; create a helper or just do it per demo.

The minimal change: in every `components/demos/*Demo.tsx`, change the outer return from something like `<div className="flex w-full max-w-xs">` to `<div className="flex h-full w-full items-center justify-center">`. This makes each demo center itself in its logical-size box.

- [ ] **Step 4: Smoke-test all demos**

```bash
npm test
```

- [ ] **Step 5: Manual check**

```bash
npm run dev
```

Switch through each component. Toast (390×880) now scales down to fit the pane; you can see the entire phone preview without scrollbars. Smaller demos (Toggle 200×80) appear at native size.

- [ ] **Step 6: Commit**

```bash
git add components/demos/DemoFrame.tsx components/playground/PlaygroundShell.tsx components/demos/*.tsx
git commit -m "feat(playground): wire logical sizes through DemoFrame + PaneScaler"
```

---

## Sub-phase 8a-iii — Canonical trigger ref pattern (Toggle as proof-of-concept)

### Task 9: Add useDemoTrigger hook

**Files:**
- Create: `hooks/useDemoTrigger.ts`

- [ ] **Step 1: Create the hook**

```ts
import { useImperativeHandle, type Ref } from 'react';

export type SingleTrigger = {
  kind: 'single';
  trigger: () => void;
};

export type DualTrigger = {
  kind: 'dual';
  primary: () => void;
  primaryLabel: string;
  secondary: () => void;
  secondaryLabel: string;
};

export type DemoTriggerHandle = SingleTrigger | DualTrigger;

export function useDemoTrigger(
  ref: Ref<DemoTriggerHandle> | undefined,
  handle: DemoTriggerHandle,
): void {
  useImperativeHandle(ref, () => handle, [handle]);
}
```

- [ ] **Step 2: Smoke-test**

`hooks/useDemoTrigger.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRef } from 'react';
import { useDemoTrigger, type DemoTriggerHandle } from './useDemoTrigger';

describe('useDemoTrigger', () => {
  it('exposes the trigger handle on the ref', () => {
    let called = 0;
    const handle: DemoTriggerHandle = {
      kind: 'single',
      trigger: () => { called++; },
    };
    const { result } = renderHook(() => {
      const ref = useRef<DemoTriggerHandle>(null);
      useDemoTrigger(ref, handle);
      return ref;
    });
    expect(result.current.current?.kind).toBe('single');
    if (result.current.current?.kind === 'single') {
      result.current.current.trigger();
    }
    expect(called).toBe(1);
  });
});
```

```bash
npm test -- useDemoTrigger
```

- [ ] **Step 3: Commit**

```bash
git add hooks/useDemoTrigger.ts hooks/useDemoTrigger.test.ts
git commit -m "feat(hooks): useDemoTrigger ref helper"
```

---

### Task 10: Update DemoProps to forward refs

**Files:**
- Modify: `components/demos/index.tsx`

- [ ] **Step 1: Update DemoProps to accept a ref**

```tsx
'use client';

import dynamic from 'next/dynamic';
import { forwardRef, type ComponentType, type ForwardRefExoticComponent, type RefAttributes } from 'react';
import type { ComponentId } from './registry';
import type { AnimationConfig } from '@/lib/animation/types';
import type { ComponentOptions } from '@/lib/component-options/types';
import type { DemoTriggerHandle } from '@/hooks/useDemoTrigger';

export type DemoProps = {
  config: AnimationConfig;
  options: Partial<ComponentOptions>;
  triggerKey: number;
};

export type DemoComponent = ForwardRefExoticComponent<
  DemoProps & RefAttributes<DemoTriggerHandle>
>;

export const DEMOS: Record<ComponentId, DemoComponent> = {
  'icon-button':  dynamic(() => import('./IconButtonDemo'),  { ssr: false }) as DemoComponent,
  'text-button':  dynamic(() => import('./TextButtonDemo'),  { ssr: false }) as DemoComponent,
  'toggle':       dynamic(() => import('./ToggleDemo'),      { ssr: false }) as DemoComponent,
  'checkbox':     dynamic(() => import('./CheckboxDemo'),    { ssr: false }) as DemoComponent,
  'accordion':    dynamic(() => import('./AccordionDemo'),   { ssr: false }) as DemoComponent,
  'tabs':         dynamic(() => import('./TabsDemo'),        { ssr: false }) as DemoComponent,
  'stepper':      dynamic(() => import('./StepperDemo'),     { ssr: false }) as DemoComponent,
  'slider':       dynamic(() => import('./SliderDemo'),      { ssr: false }) as DemoComponent,
  'input-field':  dynamic(() => import('./InputFieldDemo'),  { ssr: false }) as DemoComponent,
  'search-input': dynamic(() => import('./SearchInputDemo'), { ssr: false }) as DemoComponent,
  'dropdown':     dynamic(() => import('./DropdownDemo'),    { ssr: false }) as DemoComponent,
  'popover':      dynamic(() => import('./PopoverDemo'),     { ssr: false }) as DemoComponent,
  'modal':        dynamic(() => import('./ModalDemo'),       { ssr: false }) as DemoComponent,
  'date-picker':  dynamic(() => import('./DatePickerDemo'),  { ssr: false }) as DemoComponent,
  'toast':        dynamic(() => import('./ToastDemo'),       { ssr: false }) as DemoComponent,
  'side-menu':    dynamic(() => import('./SideMenuDemo'),    { ssr: false }) as DemoComponent,
  'chips':        dynamic(() => import('./ChipsDemo'),       { ssr: false }) as DemoComponent,
};

export function getDemo(id: ComponentId): DemoComponent {
  return DEMOS[id];
}
```

**Note on `next/dynamic` + forwardRef compatibility:** Per Next.js 16 docs (`node_modules/next/dist/docs/`), dynamic imports do support refs when the imported component is a forwardRef component. The `as DemoComponent` cast tells TypeScript the dynamic loader preserves refs; React in practice does forward refs through `dynamic()` for forwardRef components in Next 16.

- [ ] **Step 2: Verify the dynamic + forwardRef pattern works**

Read the relevant Next.js docs:

```bash
ls node_modules/next/dist/docs/ | grep -i dynamic
```

If the docs don't confirm forwardRef support, run a quick spike: add a forwardRef component to one demo and verify the ref reaches it. (The Toggle update in Task 11 is exactly this spike.)

- [ ] **Step 3: Commit**

```bash
git add components/demos/index.tsx
git commit -m "feat(demos): widen DemoProps to support refs and component options"
```

---

### Task 11: Convert ToggleDemo to use forwardRef + useDemoTrigger

**Files:**
- Modify: `components/demos/ToggleDemo.tsx`

**Why:** Toggle is the proof-of-concept that the trigger ref pattern works end-to-end through `next/dynamic`.

- [ ] **Step 1: Rewrite ToggleDemo with forwardRef**

```tsx
'use client';

import { forwardRef, useState } from 'react';
import { motion } from 'motion/react';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import { useDemoTrigger, type DemoTriggerHandle } from '@/hooks/useDemoTrigger';
import type { DemoProps } from './index';

const ToggleDemo = forwardRef<DemoTriggerHandle, DemoProps>(function ToggleDemo({ config }, ref) {
  const [on, setOn] = useState(false);
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  useDemoTrigger(ref, {
    kind: 'single',
    trigger: () => setOn((v) => !v),
  });

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
          animate={{ x: on ? 28 : 4 }}
          transition={motionTransition}
        />
      ) : (
        <span
          className="absolute top-1 block h-6 w-6 rounded-full bg-white shadow"
          style={{
            transform: `translateX(${on ? 28 : 4}px)`,
            transition: 'transform var(--duration) var(--easing)',
            ...cssStyle,
          }}
        />
      )}
    </button>
  );
});

export default ToggleDemo;
```

- [ ] **Step 2: Smoke-test**

```bash
npm test -- ToggleDemo
```

- [ ] **Step 3: Wire two refs in PlaygroundShell**

Modify `components/playground/PlaygroundShell.tsx`. We're shifting from `triggerKey`-bumping (which remounted the whole subtree) to ref-based triggers. Refs would break if the subtree remounts on every Replay click, so we drop the `key={triggerKey}` on `<DemoFrame>` *now*. Demos that haven't been refactored yet (the other 16) will still receive `triggerKey` as a prop temporarily; it just won't change anymore. We'll fully delete it in Task 12.

```tsx
import { useRef } from 'react';
import type { DemoTriggerHandle } from '@/hooks/useDemoTrigger';

// Inside the component:
const refA = useRef<DemoTriggerHandle>(null);
const refB = useRef<DemoTriggerHandle>(null);

function handleTriggerBoth() {
  if (refA.current?.kind === 'single') refA.current.trigger();
  if (refB.current?.kind === 'single') refB.current.trigger();
}

// Pass refs to demos; note: NO key={triggerKey} on DemoFrame anymore.
paneA={
  <DemoFrame componentId={state.componentId}>
    <Demo ref={refA} config={state.configA} options={state.componentOptionsA} triggerKey={triggerKey} />
  </DemoFrame>
}
paneB={
  <DemoFrame componentId={state.componentId}>
    <Demo ref={refB} config={configB} options={state.componentOptionsB ?? {}} triggerKey={triggerKey} />
  </DemoFrame>
}

// Pass handleTriggerBoth to Canvas as onReplay:
<Canvas
  ...
  onReplay={handleTriggerBoth}
  ...
/>
```

Don't increment `triggerKey` anywhere; for now Demos that still depend on the prop just see a stable `0`. Task 12 deletes the prop entirely.

- [ ] **Step 4: Manual check**

```bash
npm run dev
```

Open `http://localhost:3000/?c=toggle&sbs=1`. Click "Trigger both" — both toggles flip together.

- [ ] **Step 5: Commit**

```bash
git add components/demos/ToggleDemo.tsx components/playground/PlaygroundShell.tsx
git commit -m "feat(playground): canonical trigger pattern verified with Toggle"
```

---

## Sub-phase 8b — Roll out canonical triggers across remaining 16 demos

### Task 12: Convert all remaining demos + special-case Chips

**Files:**
- Modify: `components/demos/CheckboxDemo.tsx`
- Modify: `components/demos/IconButtonDemo.tsx`
- Modify: `components/demos/TextButtonDemo.tsx`
- Modify: `components/demos/AccordionDemo.tsx`
- Modify: `components/demos/TabsDemo.tsx`
- Modify: `components/demos/StepperDemo.tsx`
- Modify: `components/demos/SliderDemo.tsx`
- Modify: `components/demos/InputFieldDemo.tsx`
- Modify: `components/demos/SearchInputDemo.tsx`
- Modify: `components/demos/DropdownDemo.tsx`
- Modify: `components/demos/PopoverDemo.tsx`
- Modify: `components/demos/ModalDemo.tsx`
- Modify: `components/demos/DatePickerDemo.tsx`
- Modify: `components/demos/ToastDemo.tsx`
- Modify: `components/demos/SideMenuDemo.tsx`
- Modify: `components/demos/ChipsDemo.tsx`
- Modify: `components/playground/Canvas.tsx`
- Modify: `components/playground/PlaygroundShell.tsx`

**Why:** Phase 8a-iii proved the ref pattern; now apply across all demos. Each demo wraps its export in `forwardRef<DemoTriggerHandle, DemoProps>` and calls `useDemoTrigger(ref, ...)` with its canonical trigger function. Chips uses a `dual` trigger and the Canvas footer renders two buttons when active.

This task is large. Subdivide by component during execution; the engineer commits per group of 3-4 demos.

- [ ] **Step 1: Per the canonical trigger table in the spec, implement triggers for each demo**

The spec table (in `docs/superpowers/specs/2026-05-07-playground-v2-design.md` under "Canonical triggers") gives the trigger semantics. Briefly:

| Demo | Single/Dual | Behavior |
|---|---|---|
| Checkbox | single | toggle checked |
| IconButton | single | toggle liked (heart fill) |
| TextButton | single | trigger click visual |
| Accordion | single | open/cycle next item |
| Tabs | single | cycle to next tab |
| Stepper | single | advance step, cycling |
| Slider | single | advance value by `options.slider?.increment ?? 5`, cycling at 100→0 |
| InputField | single | focus → type a sample word → blur |
| SearchInput | single | focus → type "but" → wait 300ms → clear → blur |
| Dropdown | single | toggle open |
| Popover | single | toggle open |
| Modal | single | open, setTimeout to close after 2000ms |
| Toast | single | fire one toast |
| DatePicker | single | toggle open |
| SideMenu | single | toggle open |
| Chips | dual | primary: add chip; secondary: remove chip |

For each demo, the pattern is:

```tsx
const Foo = forwardRef<DemoTriggerHandle, DemoProps>(function FooDemo({ config }, ref) {
  // ...existing state/hooks...
  useDemoTrigger(ref, {
    kind: 'single',
    trigger: () => { /* canonical action */ },
  });
  // ...existing JSX...
});
export default Foo;
```

For Chips:

```tsx
useDemoTrigger(ref, {
  kind: 'dual',
  primary: () => addChip(),
  primaryLabel: 'Add chip',
  secondary: () => removeChip(),
  secondaryLabel: 'Remove chip',
});
```

For InputField (timed sequence):

```tsx
const inputRef = useRef<HTMLInputElement>(null);
useDemoTrigger(ref, {
  kind: 'single',
  trigger: () => {
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    setTimeout(() => { setValue('Sample'); }, 200);
    setTimeout(() => { input.blur(); }, 1200);
  },
});
```

For Modal (auto-close after 2s):

```tsx
useDemoTrigger(ref, {
  kind: 'single',
  trigger: () => {
    setOpen(true);
    setTimeout(() => setOpen(false), 2000);
  },
});
```

- [ ] **Step 2: Update Canvas to support dual triggers**

Modify `components/playground/Canvas.tsx`:

```tsx
'use client';

import { Button } from '@/components/ui/button';
import { Play, ArrowLeftRight, Plus, Minus } from 'lucide-react';
import { ReactNode } from 'react';

type FooterTrigger =
  | { kind: 'single'; onTrigger: () => void; label: string }
  | { kind: 'dual'; onPrimary: () => void; primaryLabel: string; onSecondary: () => void; secondaryLabel: string };

type Props = {
  paneA: ReactNode;
  paneB?: ReactNode;
  sideBySide: boolean;
  footerTrigger?: FooterTrigger;
  onSwap?: () => void;
};

export function Canvas({ paneA, paneB, sideBySide, footerTrigger, onSwap }: Props) {
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
      {sideBySide && footerTrigger && (
        <div className="flex h-12 items-center justify-center gap-2 border-t bg-background">
          {footerTrigger.kind === 'single' ? (
            <Button size="sm" onClick={footerTrigger.onTrigger}>
              <Play className="mr-2 h-3.5 w-3.5" />
              {footerTrigger.label}
            </Button>
          ) : (
            <>
              <Button size="sm" onClick={footerTrigger.onPrimary}>
                <Plus className="mr-2 h-3.5 w-3.5" />
                {footerTrigger.primaryLabel}
              </Button>
              <Button size="sm" variant="outline" onClick={footerTrigger.onSecondary}>
                <Minus className="mr-2 h-3.5 w-3.5" />
                {footerTrigger.secondaryLabel}
              </Button>
            </>
          )}
          {onSwap && (
            <Button size="sm" variant="outline" onClick={onSwap}>
              <ArrowLeftRight className="mr-2 h-3.5 w-3.5" />
              Swap
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// (Pane component unchanged from Phase 7 task 15)
```

- [ ] **Step 3: Wire footerTrigger in PlaygroundShell**

```tsx
// Replace handleTriggerBoth with footerTrigger derivation:
const footerTrigger = (() => {
  // Read from refA's current handle (same shape as refB)
  const handle = refA.current;
  if (!handle) return undefined;
  if (handle.kind === 'single') {
    return {
      kind: 'single' as const,
      label: 'Trigger both',
      onTrigger: () => {
        if (refA.current?.kind === 'single') refA.current.trigger();
        if (refB.current?.kind === 'single') refB.current.trigger();
      },
    };
  }
  return {
    kind: 'dual' as const,
    primaryLabel: handle.primaryLabel,
    secondaryLabel: handle.secondaryLabel,
    onPrimary: () => {
      if (refA.current?.kind === 'dual') refA.current.primary();
      if (refB.current?.kind === 'dual') refB.current.primary();
    },
    onSecondary: () => {
      if (refA.current?.kind === 'dual') refA.current.secondary();
      if (refB.current?.kind === 'dual') refB.current.secondary();
    },
  };
})();

// ... pass to Canvas:
<Canvas
  sideBySide={state.sideBySide}
  paneA={...}
  paneB={...}
  footerTrigger={footerTrigger}
  onSwap={swapConfigs}
/>
```

**Note:** reading `refA.current` synchronously in render is non-idiomatic; on first render the ref is null. To fix, store the trigger shape in state (a small `useEffect` updates it after the demo mounts). Alternative: have each demo expose its trigger shape as a static export, looked up by component id. The cleaner approach: add a `triggerShape: 'single' | 'dual'` map in the registry alongside `OPTIONS_KEYS`:

```ts
export const TRIGGER_SHAPES: Record<ComponentId, 'single' | 'dual'> = {
  'chips': 'dual',
  // all others default to 'single':
  'icon-button': 'single', 'text-button': 'single', 'toggle': 'single',
  'checkbox': 'single', 'accordion': 'single', 'tabs': 'single',
  'stepper': 'single', 'slider': 'single', 'input-field': 'single',
  'search-input': 'single', 'dropdown': 'single', 'popover': 'single',
  'modal': 'single', 'date-picker': 'single', 'toast': 'single',
  'side-menu': 'single',
};
```

Then PlaygroundShell reads `TRIGGER_SHAPES[componentId]` directly to derive `footerTrigger`, no ref read in render needed. Use this approach.

- [ ] **Step 4: Remove triggerKey plumbing**

After all 17 demos use canonical triggers, delete:
- The `triggerKey` state in `PlaygroundShell.tsx`.
- The `triggerKey` prop on `DemoFrame`.
- The `triggerKey` field in `DemoProps`.
- The `key={triggerKey}` on `<DemoFrame>` instances.

Demos no longer remount; they persist state across triggers (the canonical trigger functions handle reset where needed).

- [ ] **Step 5: Smoke-test all demos**

```bash
npm test
```

- [ ] **Step 6: Manual QA**

```bash
npm run dev
```

For each component, toggle side-by-side on, click "Trigger both" — verify both demos perform the canonical action. For Chips, verify the two buttons (Add chip / Remove chip).

- [ ] **Step 7: Commit (in 3-4 batches as you go)**

```bash
git add components/demos/CheckboxDemo.tsx components/demos/IconButtonDemo.tsx components/demos/TextButtonDemo.tsx
git commit -m "feat(demos): canonical triggers for checkbox/icon-button/text-button"

# ... continue per group ...

git add components/playground/Canvas.tsx components/playground/PlaygroundShell.tsx components/demos/registry.ts components/demos/index.tsx components/demos/DemoFrame.tsx
git commit -m "feat(playground): footer trigger system; remove triggerKey plumbing"
```

---

## Sub-phase 8c — Simple new options (dropdown bounce, button hover/press scale)

### Task 13: Wire componentOptions through DemoProps + ConfigPanel UI for these three components

**Files:**
- Modify: `components/playground/PlaygroundShell.tsx` (already pipes options after Task 11)
- Create: `components/playground/options/DropdownOptions.tsx`
- Create: `components/playground/options/IconButtonOptions.tsx`
- Create: `components/playground/options/TextButtonOptions.tsx`
- Modify: `components/playground/PlaygroundShell.tsx` (render options panel section per active component)
- Modify: `components/demos/DropdownDemo.tsx` (consume `options.dropdown.bounce`)
- Modify: `components/demos/IconButtonDemo.tsx` (consume `options.iconButton`)
- Modify: `components/demos/TextButtonDemo.tsx` (consume `options.textButton`)

- [ ] **Step 1: Build the UI components for each option**

`components/playground/options/DropdownOptions.tsx`:

```tsx
'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import type { DropdownOptions } from '@/lib/component-options/types';
import type { AnimationConfig } from '@/lib/animation/types';

type Props = {
  value: DropdownOptions;
  onChange: (next: DropdownOptions) => void;
  config: AnimationConfig;
};

export function DropdownOptionsPanel({ value, onChange, config }: Props) {
  const isSpring = config.type === 'spring';
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs">Bounce</Label>
        {isSpring ? (
          <Switch checked={value.bounce} onCheckedChange={(b) => onChange({ ...value, bounce: b })} />
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span><Switch checked={false} disabled /></span>
              </TooltipTrigger>
              <TooltipContent>Bounce requires spring animation</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}
```

(If `@/components/ui/switch` doesn't exist, run `npx shadcn@latest add switch`.)

`components/playground/options/IconButtonOptions.tsx`:

```tsx
'use client';

import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import type { IconButtonOptions } from '@/lib/component-options/types';

type Props = {
  value: IconButtonOptions;
  onChange: (next: IconButtonOptions) => void;
};

export function IconButtonOptionsPanel({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <Label className="text-xs">Hover scale</Label>
          <span className="text-xs tabular-nums text-muted-foreground">{value.hoverScale.toFixed(2)}</span>
        </div>
        <Slider
          value={[value.hoverScale]}
          min={1.0} max={1.5} step={0.01}
          onValueChange={(arr) => onChange({ ...value, hoverScale: Array.isArray(arr) ? arr[0] : arr })}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <Label className="text-xs">Press scale</Label>
          <span className="text-xs tabular-nums text-muted-foreground">{value.pressScale.toFixed(2)}</span>
        </div>
        <Slider
          value={[value.pressScale]}
          min={0.5} max={1.0} step={0.01}
          onValueChange={(arr) => onChange({ ...value, pressScale: Array.isArray(arr) ? arr[0] : arr })}
        />
      </div>
    </div>
  );
}
```

`components/playground/options/TextButtonOptions.tsx`: identical structure to `IconButtonOptions`, swapping the type.

- [ ] **Step 2: Add a "Component options" PanelSection in PlaygroundShell**

In `PanelTabContents`:

```tsx
import { getOptionsKey } from '@/components/demos/registry';
import { DropdownOptionsPanel } from './options/DropdownOptions';
import { IconButtonOptionsPanel } from './options/IconButtonOptions';
import { TextButtonOptionsPanel } from './options/TextButtonOptions';
import {
  DEFAULT_DROPDOWN, DEFAULT_ICON_BUTTON, DEFAULT_TEXT_BUTTON,
} from '@/lib/component-options/defaults';

// Add a new section between Animation and Code:
const optionsKey = getOptionsKey(componentId);
const optionsPanel = (() => {
  if (optionsKey === 'dropdown') {
    return (
      <DropdownOptionsPanel
        value={options.dropdown ?? DEFAULT_DROPDOWN}
        onChange={(next) => onOptionsChange({ ...options, dropdown: next })}
        config={config}
      />
    );
  }
  if (optionsKey === 'iconButton') {
    return (
      <IconButtonOptionsPanel
        value={options.iconButton ?? DEFAULT_ICON_BUTTON}
        onChange={(next) => onOptionsChange({ ...options, iconButton: next })}
      />
    );
  }
  if (optionsKey === 'textButton') {
    return (
      <TextButtonOptionsPanel
        value={options.textButton ?? DEFAULT_TEXT_BUTTON}
        onChange={(next) => onOptionsChange({ ...options, textButton: next })}
      />
    );
  }
  return null;
})();

// In the JSX, between Animation and Code:
{optionsPanel && (
  <PanelSection title="Component options">{optionsPanel}</PanelSection>
)}
```

`PanelTabContents` props now also include `options: Partial<ComponentOptions>` and `onOptionsChange: (next: Partial<ComponentOptions>) => void`. Wire from the parent `PlaygroundShell`.

- [ ] **Step 3: Update DropdownDemo to consume bounce**

Read the demo. The dropdown opens with a scale+fade animation. Add a bounce wrapper when `options.dropdown?.bounce && config.type === 'spring'`:

In the spring branch's `transition={motionTransition}`, when bounce is on, override stiffness with a lower-damped variant (e.g., spread `motionTransition` and overwrite `damping` with `motionTransition.damping * 0.6`). Or use a separate `motionTransition` derived to amplify overshoot.

```tsx
const bounce = options.dropdown?.bounce && config.type === 'spring';
const transition = bounce
  ? { ...motionTransition, damping: (motionTransition.damping ?? 20) * 0.6 }
  : motionTransition;
```

- [ ] **Step 4: Update IconButtonDemo to consume hover/press scale**

In the spring branch, replace fixed `scale: liked ? [1, 1.3, 1] : 1` with options-driven values:

```tsx
const { hoverScale, pressScale } = options.iconButton ?? DEFAULT_ICON_BUTTON;

// Use Motion's whileHover/whileTap:
<motion.button
  whileHover={{ scale: hoverScale }}
  whileTap={{ scale: pressScale }}
  transition={motionTransition}
  // ...
>
  ...
</motion.button>
```

- [ ] **Step 5: Update TextButtonDemo similarly**

Wrap the `<button>` in `<motion.button>` and add `whileHover` / `whileTap` driven by options.

- [ ] **Step 6: Smoke-test**

```bash
npm test
```

- [ ] **Step 7: Manual check**

```bash
npm run dev
```

For each of the three: drag the option sliders / toggle the bounce switch, confirm the demo responds.

- [ ] **Step 8: Commit**

```bash
git add components/playground/options components/playground/PlaygroundShell.tsx components/demos/DropdownDemo.tsx components/demos/IconButtonDemo.tsx components/demos/TextButtonDemo.tsx
git commit -m "feat(options): dropdown bounce; icon/text button hover & press scale"
```

---

## Sub-phase 8d — Slider full rework

### Task 14: Single-thumb slider with increment + drag spring

**Files:**
- Modify: `components/demos/SliderDemo.tsx`
- Create: `components/playground/options/SliderOptions.tsx`
- Modify: `components/playground/PlaygroundShell.tsx` (add slider options panel)

**Why:** Spec §Slider — single thumb, configurable increment, drag-feel spring (separate from global config), end labels "0" and "100."

- [ ] **Step 1: Create SliderOptionsPanel**

```tsx
'use client';

import { Slider as UISlider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { SLIDER_LIMITS } from '@/lib/animation/types';
import type { SliderOptions } from '@/lib/component-options/types';

type Props = {
  value: SliderOptions;
  onChange: (next: SliderOptions) => void;
};

export function SliderOptionsPanel({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <Label className="text-xs">Increment</Label>
          <span className="text-xs tabular-nums text-muted-foreground">{value.increment}</span>
        </div>
        <UISlider
          value={[value.increment]}
          min={1} max={25} step={1}
          onValueChange={(arr) =>
            onChange({ ...value, increment: Array.isArray(arr) ? arr[0] : arr })}
        />
      </div>
      <div className="border-t pt-3" />
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Drag feel (spring)
      </div>
      <LabeledNum
        label="Stiffness"
        value={value.dragSpring.stiffness}
        min={SLIDER_LIMITS.stiffness.min} max={SLIDER_LIMITS.stiffness.max} step={1}
        onChange={(n) =>
          onChange({ ...value, dragSpring: { ...value.dragSpring, stiffness: n } })}
      />
      <LabeledNum
        label="Damping"
        value={value.dragSpring.damping}
        min={SLIDER_LIMITS.damping.min} max={SLIDER_LIMITS.damping.max} step={1}
        onChange={(n) =>
          onChange({ ...value, dragSpring: { ...value.dragSpring, damping: n } })}
      />
      <LabeledNum
        label="Mass"
        value={value.dragSpring.mass}
        min={SLIDER_LIMITS.mass.min} max={SLIDER_LIMITS.mass.max} step={0.1}
        onChange={(n) =>
          onChange({ ...value, dragSpring: { ...value.dragSpring, mass: n } })}
      />
    </div>
  );
}

function LabeledNum({
  label, value, min, max, step, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <Label className="text-xs">{label}</Label>
        <span className="text-xs tabular-nums text-muted-foreground">
          {Number(value.toFixed(2))}
        </span>
      </div>
      <UISlider
        value={[value]} min={min} max={max} step={step}
        onValueChange={(arr) => onChange(Array.isArray(arr) ? arr[0] : arr)}
      />
    </div>
  );
}
```

- [ ] **Step 2: Wire it into PanelTabContents**

```tsx
if (optionsKey === 'slider') {
  return (
    <SliderOptionsPanel
      value={options.slider ?? DEFAULT_SLIDER}
      onChange={(next) => onOptionsChange({ ...options, slider: next })}
    />
  );
}
```

- [ ] **Step 3: Rewrite SliderDemo with single thumb + drag spring**

```tsx
'use client';

import { forwardRef, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useDemoTrigger, type DemoTriggerHandle } from '@/hooks/useDemoTrigger';
import { DEFAULT_SLIDER } from '@/lib/component-options/defaults';
import type { DemoProps } from './index';

const SliderDemo = forwardRef<DemoTriggerHandle, DemoProps>(function SliderDemo({ options }, ref) {
  const sliderOpts = options.slider ?? DEFAULT_SLIDER;
  const [target, setTarget] = useState(40);
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  function snap(v: number): number {
    const clamped = Math.max(0, Math.min(100, v));
    return Math.round(clamped / sliderOpts.increment) * sliderOpts.increment;
  }

  function pickFromClientX(clientX: number): number {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return target;
    const ratio = (clientX - rect.left) / rect.width;
    return snap(ratio * 100);
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    draggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setTarget(pickFromClientX(e.clientX));
  }
  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    setTarget(pickFromClientX(e.clientX));
  }
  function handlePointerUp() {
    draggingRef.current = false;
  }

  useDemoTrigger(ref, {
    kind: 'single',
    trigger: () => {
      setTarget((v) => {
        const next = v + sliderOpts.increment;
        return next > 100 ? 0 : next;
      });
    },
  });

  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative h-1 w-full cursor-pointer rounded-full bg-zinc-200"
      >
        <motion.div
          className="absolute -top-1.5 h-4 w-4 rounded-full bg-foreground"
          animate={{ left: `calc(${target}% - 8px)` }}
          transition={sliderOpts.dragSpring}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>0</span>
        <span>100</span>
      </div>
    </div>
  );
});

export default SliderDemo;
```

Notes:
- Single thumb, drag via pointer events.
- Snap to `sliderOpts.increment` on drop and during drag.
- Thumb animates to snapped position using `sliderOpts.dragSpring` (Motion's spring with the configured stiffness/damping/mass). The global animation config is no longer used for this demo — only the drag spring matters here, since the demo's only animation is thumb release.
- "0" and "100" labels at the ends.
- Canonical trigger advances by one increment, cycling.

- [ ] **Step 4: Smoke-test**

```bash
npm test -- SliderDemo
```

- [ ] **Step 5: Manual check**

```bash
npm run dev
```

Open `http://localhost:3000/?c=slider`. Drag — thumb snaps to nearest 5. Change increment in panel — snapping updates. Tweak drag spring stiffness/damping — release feels different.

- [ ] **Step 6: Commit**

```bash
git add components/demos/SliderDemo.tsx components/playground/options/SliderOptions.tsx components/playground/PlaygroundShell.tsx
git commit -m "feat(slider): single thumb, configurable increment, drag-feel spring, end labels"
```

---

## Sub-phase 8e — Popover position

### Task 15: Popover position option (8 positions, instant repositioning)

**Files:**
- Modify: `components/demos/PopoverDemo.tsx`
- Create: `components/playground/options/PopoverOptions.tsx`
- Modify: `components/playground/PlaygroundShell.tsx`

- [ ] **Step 1: Create PopoverOptionsPanel**

```tsx
'use client';

import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import type { PopoverOptions, PopoverPosition } from '@/lib/component-options/types';

const POSITIONS: { value: PopoverPosition; label: string }[] = [
  { value: 'top-left',    label: 'Top left' },
  { value: 'top',         label: 'Top' },
  { value: 'top-right',   label: 'Top right' },
  { value: 'left',        label: 'Left' },
  { value: 'right',       label: 'Right' },
  { value: 'bottom-left', label: 'Bottom left' },
  { value: 'bottom',      label: 'Bottom' },
  { value: 'bottom-right',label: 'Bottom right' },
];

type Props = {
  value: PopoverOptions;
  onChange: (next: PopoverOptions) => void;
};

export function PopoverOptionsPanel({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs">Position</Label>
      <Select
        value={value.position}
        onValueChange={(v) => onChange({ position: v as PopoverPosition })}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {POSITIONS.map(({ value: v, label }) => (
            <SelectItem key={v} value={v}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
```

- [ ] **Step 2: Wire into PlaygroundShell**

In the optionsPanel branch:

```tsx
if (optionsKey === 'popover') {
  return (
    <PopoverOptionsPanel
      value={options.popover ?? DEFAULT_POPOVER}
      onChange={(next) => onOptionsChange({ ...options, popover: next })}
    />
  );
}
```

- [ ] **Step 3: Update PopoverDemo to consume position**

Read the file. The popover uses base-ui's Popover. Map the 8-position option to the library's `side` and `align` props:

```ts
const POSITION_TO_PLACEMENT: Record<PopoverPosition, { side: 'top'|'bottom'|'left'|'right'; align: 'start'|'center'|'end' }> = {
  'top-left':     { side: 'top',    align: 'start' },
  'top':          { side: 'top',    align: 'center' },
  'top-right':    { side: 'top',    align: 'end' },
  'left':         { side: 'left',   align: 'center' },
  'right':        { side: 'right',  align: 'center' },
  'bottom-left':  { side: 'bottom', align: 'start' },
  'bottom':       { side: 'bottom', align: 'center' },
  'bottom-right': { side: 'bottom', align: 'end' },
};
```

In the demo, look up the placement based on `options.popover?.position ?? 'bottom'` and pass to the popover library. If the library is base-ui:

```tsx
<Popover.Positioner side={placement.side} align={placement.align} sideOffset={4}>
  ...
</Popover.Positioner>
```

If using a shadcn wrapper that doesn't expose these, drill them through.

- [ ] **Step 4: Smoke-test**

```bash
npm test -- PopoverDemo
```

- [ ] **Step 5: Manual check**

```bash
npm run dev
```

Open `http://localhost:3000/?c=popover`. Toggle position option — popover snaps to each placement.

- [ ] **Step 6: Commit**

```bash
git add components/demos/PopoverDemo.tsx components/playground/options/PopoverOptions.tsx components/playground/PlaygroundShell.tsx
git commit -m "feat(popover): 8-position option"
```

---

## Sub-phase 8f — Toast direction

### Task 16: Toast direction option (6 directions)

**Files:**
- Modify: `components/demos/ToastDemo.tsx`
- Create: `components/playground/options/ToastOptions.tsx`
- Modify: `components/playground/PlaygroundShell.tsx`

- [ ] **Step 1: Create ToastOptionsPanel**

```tsx
'use client';

import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import type { ToastOptions, ToastDirection } from '@/lib/component-options/types';

const DIRECTIONS: { value: ToastDirection; label: string }[] = [
  { value: 'top-left',     label: 'Top left' },
  { value: 'top',          label: 'Top' },
  { value: 'top-right',    label: 'Top right' },
  { value: 'bottom-left',  label: 'Bottom left' },
  { value: 'bottom',       label: 'Bottom' },
  { value: 'bottom-right', label: 'Bottom right' },
];

type Props = {
  value: ToastOptions;
  onChange: (next: ToastOptions) => void;
};

export function ToastOptionsPanel({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs">Direction</Label>
      <Select
        value={value.direction}
        onValueChange={(v) => onChange({ direction: v as ToastDirection })}
      >
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {DIRECTIONS.map(({ value: v, label }) => (
            <SelectItem key={v} value={v}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
```

- [ ] **Step 2: Wire into PlaygroundShell**

```tsx
if (optionsKey === 'toast') {
  return (
    <ToastOptionsPanel
      value={options.toast ?? DEFAULT_TOAST}
      onChange={(next) => onOptionsChange({ ...options, toast: next })}
    />
  );
}
```

- [ ] **Step 3: Update ToastDemo to use direction**

The current demo likely uses Sonner. Sonner's `<Toaster position={...}>` accepts `top-left | top-center | top-right | bottom-left | bottom-center | bottom-right`. Map our keys:

```ts
const DIRECTION_TO_SONNER: Record<ToastDirection, ToasterProps['position']> = {
  'top-left':     'top-left',
  'top':          'top-center',
  'top-right':    'top-right',
  'bottom-left':  'bottom-left',
  'bottom':       'bottom-center',
  'bottom-right': 'bottom-right',
};
```

In the demo, the Toaster lives inside the phone preview and uses `position={DIRECTION_TO_SONNER[options.toast?.direction ?? 'bottom-right']}`. Sonner handles the slide-in direction automatically based on position.

- [ ] **Step 4: Smoke-test**

```bash
npm test -- ToastDemo
```

- [ ] **Step 5: Manual check**

```bash
npm run dev
```

Open `http://localhost:3000/?c=toast`. Toggle direction — toast appears in the new corner with the corresponding slide-in.

- [ ] **Step 6: Commit**

```bash
git add components/demos/ToastDemo.tsx components/playground/options/ToastOptions.tsx components/playground/PlaygroundShell.tsx
git commit -m "feat(toast): 6-direction option"
```

---

## Sub-phase 8g — Side menu (4 kinds + bounce + layered + side)

### Task 17: Side menu options + animation kinds

**Files:**
- Modify: `components/demos/SideMenuDemo.tsx`
- Create: `components/playground/options/SideMenuOptions.tsx`
- Modify: `components/playground/PlaygroundShell.tsx`

- [ ] **Step 1: Create SideMenuOptionsPanel**

```tsx
'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import type {
  SideMenuOptions, SideMenuKind, SideMenuSide,
} from '@/lib/component-options/types';
import type { AnimationConfig } from '@/lib/animation/types';

const KINDS: { value: SideMenuKind; label: string }[] = [
  { value: 'slide',    label: 'Slide' },
  { value: 'dissolve', label: 'Dissolve' },
  { value: 'scale',    label: 'Scale' },
  { value: 'push',     label: 'Push' },
];

type Props = {
  value: SideMenuOptions;
  onChange: (next: SideMenuOptions) => void;
  config: AnimationConfig;
};

export function SideMenuOptionsPanel({ value, onChange, config }: Props) {
  const isSpring = config.type === 'spring';
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">Side</Label>
        <Select
          value={value.side}
          onValueChange={(v) => onChange({ ...value, side: v as SideMenuSide })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">Animation</Label>
        <Select
          value={value.kind}
          onValueChange={(v) => onChange({ ...value, kind: v as SideMenuKind })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {KINDS.map(({ value: v, label }) => (
              <SelectItem key={v} value={v}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs">Bounce</Label>
        {isSpring ? (
          <Switch
            checked={value.bounce}
            onCheckedChange={(b) => onChange({ ...value, bounce: b })}
          />
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span><Switch checked={false} disabled /></span>
              </TooltipTrigger>
              <TooltipContent>Bounce requires spring animation</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs">Layered</Label>
        <Switch
          checked={value.layered}
          onCheckedChange={(b) => onChange({ ...value, layered: b })}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire into PlaygroundShell**

```tsx
if (optionsKey === 'sideMenu') {
  return (
    <SideMenuOptionsPanel
      value={options.sideMenu ?? DEFAULT_SIDE_MENU}
      onChange={(next) => onOptionsChange({ ...options, sideMenu: next })}
      config={config}
    />
  );
}
```

- [ ] **Step 3: Rewrite SideMenuDemo to support all options**

```tsx
'use client';

import { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import { useDemoTrigger, type DemoTriggerHandle } from '@/hooks/useDemoTrigger';
import { DEFAULT_SIDE_MENU } from '@/lib/component-options/defaults';
import type { DemoProps } from './index';

const NAV_ITEMS = ['Home', 'Search', 'Library', 'Profile', 'Settings'];

const SideMenuDemo = forwardRef<DemoTriggerHandle, DemoProps>(function SideMenuDemo({ config, options }, ref) {
  const opts = options.sideMenu ?? DEFAULT_SIDE_MENU;
  const [open, setOpen] = useState(false);
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  useDemoTrigger(ref, {
    kind: 'single',
    trigger: () => setOpen((v) => !v),
  });

  const isLeft = opts.side === 'left';
  const widthPct = 0.6;

  // Compute initial/animate/exit based on `kind`:
  function variantsForKind() {
    switch (opts.kind) {
      case 'slide':
        return {
          initial: { x: isLeft ? '-100%' : '100%', opacity: 1 },
          animate: { x: 0, opacity: 1 },
          exit: { x: isLeft ? '-100%' : '100%', opacity: 1 },
        };
      case 'dissolve':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        };
      case 'scale':
        return {
          initial: { scaleX: 0, opacity: 1 },
          animate: { scaleX: 1, opacity: 1 },
          exit: { scaleX: 0, opacity: 1 },
        };
      case 'push':
        return {
          initial: { x: isLeft ? '-100%' : '100%' },
          animate: { x: 0 },
          exit: { x: isLeft ? '-100%' : '100%' },
        };
    }
  }

  const variants = variantsForKind();
  const transformOrigin = opts.kind === 'scale'
    ? (isLeft ? 'left center' : 'right center')
    : undefined;

  // Bounce: on spring + bounce ON, lower damping for amplified overshoot:
  const transition =
    opts.bounce && config.type === 'spring'
      ? { ...motionTransition, damping: ((motionTransition as { damping?: number }).damping ?? 20) * 0.6 }
      : motionTransition;

  // Push effect: shift the page content
  const pageShift =
    opts.kind === 'push' && open
      ? (isLeft ? `${widthPct * 100}%` : `-${widthPct * 100}%`)
      : '0%';

  return (
    <div className="relative h-full w-full overflow-hidden bg-white">
      <motion.div
        className="flex h-full w-full flex-col items-center justify-center"
        animate={{ x: pageShift }}
        transition={transition}
      >
        <Button onClick={() => setOpen(true)}>
          <Menu className="mr-2 h-4 w-4" />
          Open menu
        </Button>
        <p className="mt-4 text-xs text-muted-foreground">Page content</p>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.aside
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
            transition={transition}
            style={{
              transformOrigin,
              [isLeft ? 'left' : 'right']: 0,
            }}
            className="absolute top-0 z-10 h-full bg-zinc-900 text-white shadow-xl"
            // width set in the inline style below via a ratio of pane:
          >
            <div style={{ width: `${widthPct * 100}%`, minWidth: 200 }} className="flex h-full flex-col p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold">Menu</span>
                <button onClick={() => setOpen(false)} aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <nav className="flex flex-col gap-1">
                {NAV_ITEMS.map((item, i) => (
                  <motion.div
                    key={item}
                    initial={opts.layered ? { opacity: 0, x: isLeft ? -10 : 10 } : false}
                    animate={{ opacity: 1, x: 0 }}
                    transition={
                      opts.layered
                        ? { ...transition, delay: 0.1 + i * 0.05 }
                        : { duration: 0 }
                    }
                    className="rounded px-3 py-2 text-sm hover:bg-zinc-800"
                  >
                    {item}
                  </motion.div>
                ))}
              </nav>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
});

export default SideMenuDemo;
```

Notes:
- `kind` selects which initial/animate/exit set to use.
- `bounce` (spring only) reduces damping by 40% for amplified overshoot.
- `layered` adds per-item delay so nav items animate in sequence.
- `push` shifts the page content using `pageShift`.
- `cssStyle` and `isSpring` from useAnimationStyle aren't used for the asymmetric paths above; this demo uses Motion exclusively and adapts via `transition`.

- [ ] **Step 4: Smoke-test**

```bash
npm test -- SideMenuDemo
```

- [ ] **Step 5: Manual check**

```bash
npm run dev
```

For each kind (slide / dissolve / scale / push), open the menu in single and side-by-side. Toggle bounce and layered. Verify left and right sides.

- [ ] **Step 6: Commit**

```bash
git add components/demos/SideMenuDemo.tsx components/playground/options/SideMenuOptions.tsx components/playground/PlaygroundShell.tsx
git commit -m "feat(side-menu): 4 animation kinds + bounce + layered + side"
```

---

## Final tasks

### Task 18: Update todos.md and CLAUDE.md

**Files:**
- Modify: `todos.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Append Phase 8 task list to todos.md**

```markdown
## Phase 8 — Architecture & new options

[ ] Phase 8a-i — Task 1: ComponentOptions types
[ ] Phase 8a-i — Task 2: Component option defaults
[ ] Phase 8a-i — Task 3: URL encoder
[ ] Phase 8a-i — Task 4: URL decoder
[ ] Phase 8a-i — Task 5: Wire componentOptions into state
[ ] Phase 8a-ii — Task 6: Logical sizes in registry
[ ] Phase 8a-ii — Task 7: PaneScaler component
[ ] Phase 8a-ii — Task 8: Wire PaneScaler through DemoFrame
[ ] Phase 8a-iii — Task 9: useDemoTrigger hook
[ ] Phase 8a-iii — Task 10: DemoProps with refs
[ ] Phase 8a-iii — Task 11: Toggle proof-of-concept
[ ] Phase 8b — Task 12: Roll out canonical triggers across 16 demos
[ ] Phase 8c — Task 13: Dropdown bounce + button hover/press scale
[ ] Phase 8d — Task 14: Slider full rework
[ ] Phase 8e — Task 15: Popover position
[ ] Phase 8f — Task 16: Toast direction
[ ] Phase 8g — Task 17: Side menu options
```

- [ ] **Step 2: Add a Phase 8 stub to CLAUDE.md**

```markdown
### 🚧 Phase 8 — Architecture & new options (in progress)

Plan: `docs/superpowers/plans/2026-05-07-playground-v2-phase-8.md`
Spec: `docs/superpowers/specs/2026-05-07-playground-v2-design.md`

Status: not started.
```

- [ ] **Step 3: Commit docs**

```bash
git add todos.md CLAUDE.md
git commit -m "docs: add Phase 8 task list and progress stub"
```

---

### Task 19: Final manual QA pass

- [ ] **Step 1: Full test suite**

```bash
npm test
```

- [ ] **Step 2: Type check**

```bash
npm run build
```

- [ ] **Step 3: Manual QA checklist**

```bash
npm run dev
```

Per spec, verify:

- [ ] Every component still renders single-pane and side-by-side
- [ ] "Trigger both" fires the canonical interaction on both panes for every component
- [ ] Chips shows "Add chip" / "Remove chip" buttons in the footer when active
- [ ] PaneScaler scales the toast phone (390×880) to fit; smaller demos render at native size
- [ ] Popover stays inside its pane in side-by-side
- [ ] Modal opens fullscreen in its pane, auto-closes after 2s on Trigger both
- [ ] Slider single thumb, snaps to 5 (or whatever increment), drag-feel spring works
- [ ] Popover position option produces all 8 placements
- [ ] Toast direction option produces all 6 corners
- [ ] Side menu kinds (slide/dissolve/scale/push) all work with bounce + layered + side toggles
- [ ] Dropdown bounce works on spring; toggle disabled on tween
- [ ] Icon button heart fill + hover/press scales work
- [ ] Text button hover/press scales work
- [ ] URL state round-trips: copy URL with options, paste in new tab — same result
- [ ] v1 share URL (no component options) parses without error and uses defaults

- [ ] **Step 4: Mark all Phase 8 tasks complete**

Tick boxes in `todos.md`. Update CLAUDE.md status to ✅ complete.

```bash
git add todos.md CLAUDE.md
git commit -m "docs: Phase 8 complete"
```

---

## Self-review checklist

- [ ] All Phase 8 spec items addressed by a task
- [ ] All foundation tasks (8a-i, 8a-ii, 8a-iii) ship before dependent work
- [ ] All file paths exact, all code complete
- [ ] All tasks have a test step + commit step
- [ ] Type names consistent across tasks (`SideMenuKind`, `PopoverPosition`, etc.)
- [ ] No reference to types/functions defined later
- [ ] `triggerKey` plumbing fully removed by end of Task 12
