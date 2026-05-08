'use client';

import { forwardRef, useState, useRef, useLayoutEffect } from 'react';
import { motion } from 'motion/react';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import { useDemoTrigger, type DemoTriggerHandle } from '@/hooks/useDemoTrigger';
import type { DemoProps } from './index';

const TABS = ['Overview', 'Settings', 'Activity'];

const TabsDemo = forwardRef<DemoTriggerHandle, DemoProps>(function TabsDemo({ config }, ref) {
  const [active, setActive] = useState(0);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  useLayoutEffect(() => {
    const el = refs.current[active];
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [active]);

  useDemoTrigger(ref, () => ({
    kind: 'single',
    trigger: () => setActive((v) => (v + 1) % TABS.length),
  }), []);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="w-full">
      <div className="relative flex border-b">
        {TABS.map((label, i) => (
          <button
            key={label}
            type="button"
            ref={(el) => { refs.current[i] = el; }}
            onClick={() => setActive(i)}
            className={`px-4 py-2 text-sm ${i === active ? 'font-medium' : 'text-muted-foreground'}`}
          >
            {label}
          </button>
        ))}
        {isSpring ? (
          <motion.div
            className="absolute bottom-0 h-[2px] bg-foreground"
            animate={{ left: indicator.left, width: indicator.width }}
            transition={motionTransition}
          />
        ) : (
          <div
            className="absolute bottom-0 h-[2px] bg-foreground"
            style={{
              left: indicator.left,
              width: indicator.width,
              transition: 'left var(--duration) var(--easing), width var(--duration) var(--easing)',
              ...cssStyle,
            }}
          />
        )}
      </div>
      <div className="p-4 text-sm">{TABS[active]} content goes here.</div>
      </div>
    </div>
  );
});

export default TabsDemo;
