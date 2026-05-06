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
