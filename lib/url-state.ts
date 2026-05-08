import type { AnimationConfig, EasingValue } from './animation/types';
import {
  DEFAULT_COMPONENT_ID,
  isComponentId,
  getOptionsKey,
  type ComponentId,
} from '@/components/demos/registry';
import { DEFAULT_TWEEN, DEFAULT_SPRING } from './animation/defaults';
import { SLIDER_LIMITS } from './animation/types';
import type { ComponentOptions } from './component-options/types';
import { encodeComponentOptions } from './component-options/encode';
import { decodeComponentOptions } from './component-options/decode';

export type PlaygroundState = {
  componentId: ComponentId;
  configA: AnimationConfig;
  configB?: AnimationConfig;
  componentOptionsA: Partial<ComponentOptions>;
  componentOptionsB?: Partial<ComponentOptions>;
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
  const optionsKey = getOptionsKey(state.componentId);
  if (optionsKey && state.componentOptionsA) {
    encodeComponentOptions(params, '', state.componentOptionsA);
  }
  if (state.sideBySide && state.configB) {
    params.set('sbs', '1');
    encodeConfig(params, 'b.', state.configB);
    if (optionsKey && state.componentOptionsB) {
      encodeComponentOptions(params, 'b.', state.componentOptionsB);
    }
  }
  return params;
}

function clamp(value: number, min: number, max: number): number | null {
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

  const optionsKey = getOptionsKey(componentId);
  const componentOptionsA = optionsKey
    ? decodeComponentOptions(params, '', optionsKey)
    : {};
  const componentOptionsB = sideBySide && optionsKey
    ? decodeComponentOptions(params, 'b.', optionsKey)
    : undefined;

  return { componentId, configA, configB, componentOptionsA, componentOptionsB, sideBySide };
}
