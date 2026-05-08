import { describe, it, expect } from 'vitest';
import { COMPONENT_IDS, getComponentLabel, LOGICAL_SIZES } from './registry';

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
