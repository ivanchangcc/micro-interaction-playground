'use client';

import { forwardRef, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useDemoTrigger, type DemoTriggerHandle } from '@/hooks/useDemoTrigger';
import { DEFAULT_SLIDER } from '@/lib/component-options/defaults';
import type { DemoProps } from './index';

const SliderDemo = forwardRef<DemoTriggerHandle, DemoProps>(function SliderDemo({ options }, ref) {
  const sliderOpts = options.slider ?? DEFAULT_SLIDER;
  const [target, setTarget] = useState(40);
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  function snap(v: number): number {
    const clamped = Math.max(0, Math.min(100, v));
    return Math.round(clamped / sliderOpts.increment) * sliderOpts.increment;
  }

  function pickFromClientX(clientX: number): number {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return target;
    const ratio = (clientX - rect.left) / rect.width;
    return snap(ratio * 100);
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    draggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setTarget(pickFromClientX(e.clientX));
  }
  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    setTarget(pickFromClientX(e.clientX));
  }
  function handlePointerUp() {
    draggingRef.current = false;
  }

  useDemoTrigger(ref, () => ({
    kind: 'single',
    trigger: () => {
      setTarget((v) => {
        const next = v + sliderOpts.increment;
        return next > 100 ? 0 : next;
      });
    },
  }), [sliderOpts.increment]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex w-full max-w-xs flex-col gap-2 px-4">
        <div
          ref={trackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative h-1 w-full cursor-pointer rounded-full bg-zinc-200"
        >
          <motion.div
            className="absolute -top-1.5 h-4 w-4 rounded-full bg-foreground"
            animate={{ left: `calc(${target}% - 8px)` }}
            transition={sliderOpts.dragSpring}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>0</span>
          <span>100</span>
        </div>
      </div>
    </div>
  );
});

export default SliderDemo;
