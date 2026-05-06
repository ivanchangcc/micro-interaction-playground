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
