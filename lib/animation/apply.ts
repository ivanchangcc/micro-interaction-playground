import type { AnimationConfig, EasingValue } from './types';

const NAMED_TO_MOTION: Record<string, string> = {
  linear: 'linear',
  ease: 'easeInOut',
  'ease-in': 'easeIn',
  'ease-out': 'easeOut',
  'ease-in-out': 'easeInOut',
};

function easingToCss(easing: EasingValue): string {
  if (typeof easing === 'string') return easing;
  return `cubic-bezier(${easing.cubicBezier.join(', ')})`;
}

export function configToCssVars(config: AnimationConfig): Record<string, string> {
  if (config.type !== 'tween') return {};
  return {
    '--duration': `${config.duration}ms`,
    '--easing': easingToCss(config.easing),
  };
}

export function configToCssTransition(config: AnimationConfig): string {
  if (config.type !== 'tween') return '';
  return `all ${config.duration}ms ${easingToCss(config.easing)}`;
}

export function configToMotionTransition(config: AnimationConfig): any {
  if (config.type === 'spring') {
    return {
      type: 'spring' as const,
      stiffness: config.stiffness,
      damping: config.damping,
      mass: config.mass,
    };
  }
  const ease =
    typeof config.easing === 'string'
      ? NAMED_TO_MOTION[config.easing] ?? 'easeInOut'
      : ([...config.easing.cubicBezier] as [number, number, number, number]);
  return {
    type: 'tween' as const,
    duration: config.duration / 1000, // Motion uses seconds
    ease,
  };
}
