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
