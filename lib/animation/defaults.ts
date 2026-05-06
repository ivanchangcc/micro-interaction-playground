import type { TweenConfig, SpringConfig } from './types';

export const DEFAULT_TWEEN: TweenConfig = {
  type: 'tween',
  duration: 250,
  easing: { cubicBezier: [0.4, 0, 0.2, 1] }, // Material standard
};

export const DEFAULT_SPRING: SpringConfig = {
  type: 'spring',
  stiffness: 170,
  damping: 26,
  mass: 1,
};
