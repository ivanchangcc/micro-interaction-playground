'use client';

import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import type { AnimationConfig } from '@/lib/animation/types';
import {
  configToCssVars,
  configToMotionTransition,
} from '@/lib/animation/apply';

export type AnimationStyle = {
  cssStyle: CSSProperties;
  motionTransition: ReturnType<typeof configToMotionTransition>;
  isSpring: boolean;
};

export function useAnimationStyle(config: AnimationConfig): AnimationStyle {
  return useMemo(
    () => ({
      cssStyle: configToCssVars(config) as CSSProperties,
      motionTransition: configToMotionTransition(config),
      isSpring: config.type === 'spring',
    }),
    [config],
  );
}
