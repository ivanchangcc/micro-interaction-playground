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
