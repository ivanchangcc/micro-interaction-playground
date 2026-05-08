'use client';

import { forwardRef, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import { useDemoTrigger, type DemoTriggerHandle } from '@/hooks/useDemoTrigger';
import type { DemoProps } from './index';
import type { ToastDirection } from '@/lib/component-options/types';

// Map our direction to CSS positioning and enter/exit offset
type PositionStyle = {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  transform?: string;
};

function getPositionStyle(direction: ToastDirection): PositionStyle {
  switch (direction) {
    case 'top-left':     return { top: '40px', left: '12px' };
    case 'top':          return { top: '40px', left: '50%', transform: 'translateX(-50%)' };
    case 'top-right':    return { top: '40px', right: '12px' };
    case 'bottom-left':  return { bottom: '12px', left: '12px' };
    case 'bottom':       return { bottom: '12px', left: '50%', transform: 'translateX(-50%)' };
    case 'bottom-right': return { bottom: '12px', right: '12px' };
  }
}

function getMotionOffset(direction: ToastDirection): { x?: number; y?: number } {
  switch (direction) {
    case 'top-left':     return { x: -120 };
    case 'top':          return { y: -40 };
    case 'top-right':    return { x: 120 };
    case 'bottom-left':  return { x: -120 };
    case 'bottom':       return { y: 40 };
    case 'bottom-right': return { x: 120 };
  }
}

function getCssOffset(direction: ToastDirection): { transform: string } {
  switch (direction) {
    case 'top-left':     return { transform: 'translateX(-120px)' };
    case 'top':          return { transform: 'translateX(-50%) translateY(-40px)' };
    case 'top-right':    return { transform: 'translateX(120px)' };
    case 'bottom-left':  return { transform: 'translateX(-120px)' };
    case 'bottom':       return { transform: 'translateX(-50%) translateY(40px)' };
    case 'bottom-right': return { transform: 'translateX(120px)' };
  }
}

function getCssVisible(direction: ToastDirection): { transform: string } {
  if (direction === 'top' || direction === 'bottom') {
    return { transform: 'translateX(-50%)' };
  }
  return { transform: 'translateX(0px)' };
}

const ToastDemo = forwardRef<DemoTriggerHandle, DemoProps>(function ToastDemo({ config, options }, ref) {
  const [visible, setVisible] = useState(false);
  const [toastKey, setToastKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  const direction: ToastDirection = options.toast?.direction ?? 'bottom-right';
  const positionStyle = getPositionStyle(direction);
  const motionOffset = getMotionOffset(direction);
  const cssOffset = getCssOffset(direction);
  const cssVisible = getCssVisible(direction);

  function show() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToastKey((k) => k + 1);
    setVisible(true);
    timerRef.current = setTimeout(() => setVisible(false), 2400);
  }

  useDemoTrigger(ref, () => ({
    kind: 'single',
    trigger: show,
  }), [show]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[20px] border-2 bg-zinc-50">
      <div className="absolute inset-x-0 top-0 h-7 bg-zinc-100 text-center text-[10px] leading-7 text-muted-foreground">
        Phone preview
      </div>
      <div className="flex h-full items-center justify-center">
        <Button size="sm" onClick={show}>Show toast</Button>
      </div>
      {isSpring ? (
        <AnimatePresence>
          {visible && (
            <motion.div
              key={toastKey}
              initial={{ opacity: 0, ...motionOffset }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, ...motionOffset }}
              transition={motionTransition}
              style={positionStyle}
              className="absolute w-[200px] rounded-md bg-zinc-900 px-3 py-2 text-xs text-white shadow-lg"
            >
              Saved successfully.
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <div
          key={toastKey}
          className="absolute w-[200px] rounded-md bg-zinc-900 px-3 py-2 text-xs text-white shadow-lg"
          style={{
            ...positionStyle,
            opacity: visible ? 1 : 0,
            transform: visible ? cssVisible.transform : cssOffset.transform,
            transition: 'opacity var(--duration) var(--easing), transform var(--duration) var(--easing)',
            ...cssStyle,
          }}
        >
          Saved successfully.
        </div>
      )}
    </div>
  );
});

export default ToastDemo;
