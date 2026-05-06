import type { AnimationConfig, EasingValue } from './animation/types';
import {
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
