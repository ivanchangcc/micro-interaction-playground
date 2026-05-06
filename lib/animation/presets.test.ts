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
