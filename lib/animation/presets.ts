import type { AnimationConfig } from './types';
import { COMPONENT_IDS, type ComponentId } from '@/components/demos/registry';

export type Preset = {
  id: string;
  name: string;
  config: AnimationConfig;
  bad?: boolean;
  badReason?: string;
};

const MATERIAL: AnimationConfig = {
  type: 'tween',
  duration: 250,
  easing: { cubicBezier: [0.4, 0, 0.2, 1] },
};

const IOS_SPRING: AnimationConfig = {
  type: 'spring',
  stiffness: 170,
  damping: 26,
  mass: 1,
};

const SNAPPY: AnimationConfig = {
  type: 'tween',
  duration: 150,
  easing: 'ease-out',
};

const SLUGGISH: AnimationConfig = {
  type: 'tween',
  duration: 800,
  easing: 'linear',
};

const SLUGGISH_REASON =
  'Long duration plus linear easing makes the motion feel mechanical and unresponsive. Real motion accelerates and decelerates.';

const STANDARD_PRESETS: Preset[] = [
  { id: 'material', name: 'Material standard', config: MATERIAL },
  { id: 'ios-spring', name: 'iOS spring', config: IOS_SPRING },
  { id: 'snappy', name: 'Snappy', config: SNAPPY },
  { id: 'sluggish', name: 'Sluggish', config: SLUGGISH, bad: true, badReason: SLUGGISH_REASON },
];

export const PRESETS: Record<ComponentId, Preset[]> = Object.fromEntries(
  COMPONENT_IDS.map((id) => [id, STANDARD_PRESETS]),
) as Record<ComponentId, Preset[]>;

export function getPresets(id: ComponentId): Preset[] {
  return PRESETS[id] ?? STANDARD_PRESETS;
}
