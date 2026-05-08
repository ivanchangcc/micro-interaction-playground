import { describe, it, expect } from 'vitest';
import { serializeState, parseState, type PlaygroundState } from './url-state';
import { DEFAULT_TWEEN, DEFAULT_SPRING } from './animation/defaults';

const baseTweenState: PlaygroundState = {
  componentId: 'modal',
  configA: DEFAULT_TWEEN,
  componentOptionsA: {},
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

describe('parseState', () => {
  it('round-trips a tween config with named easing', () => {
    const original: PlaygroundState = {
      componentId: 'modal',
      configA: { type: 'tween', duration: 300, easing: 'ease-out' },
      componentOptionsA: {},
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
      componentOptionsA: {},
      sideBySide: false,
    };
    const parsed = parseState(serializeState(original));
    expect(parsed).toEqual(original);
  });

  it('round-trips a spring config', () => {
    const original: PlaygroundState = {
      componentId: 'toggle',
      configA: DEFAULT_SPRING,
      componentOptionsA: {},
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
      componentOptionsA: {},
      componentOptionsB: undefined,
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

  it('round-trips component options when component has options support', () => {
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
