export type CubicBezier = readonly [number, number, number, number];

export type EasingValue =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | { cubicBezier: CubicBezier };

export type TweenConfig = {
  type: 'tween';
  duration: number; // ms, 0–2000
  easing: EasingValue;
};

export type SpringConfig = {
  type: 'spring';
  stiffness: number; // 1–500
  damping: number;   // 1–50
  mass: number;      // 0.1–10
};

export type AnimationConfig = TweenConfig | SpringConfig;

export const SLIDER_LIMITS = {
  duration: { min: 0, max: 2000 },
  stiffness: { min: 1, max: 500 },
  damping: { min: 1, max: 50 },
  mass: { min: 0.1, max: 10 },
} as const;
