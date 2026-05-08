'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import type { DemoProps } from './index';

const ITEMS = [
  { id: '1', title: 'What is a micro-interaction?', body: 'Small moments of feedback. Toggles, ripples, transitions.' },
  { id: '2', title: 'Why do they matter?', body: 'They make interfaces feel alive and responsive.' },
  { id: '3', title: 'When do they go wrong?', body: 'When they are too long, too linear, or block input.' },
];

export default function AccordionDemo({ config }: DemoProps) {
  const [open, setOpen] = useState<string[]>(['1']);
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  return (
    <div className="w-full max-w-md space-y-1">
      {ITEMS.map((it) => {
        const isOpen = open.includes(it.id);
        return (
          <div key={it.id} className="overflow-hidden rounded border bg-white">
            <button
              type="button"
              className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium"
              onClick={() => setOpen((cur) => cur.includes(it.id) ? cur.filter((id) => id !== it.id) : [...cur, it.id])}
            >
              {it.title}
              <ChevronDown
                className="h-4 w-4"
                style={{
                  transform: `rotate(${isOpen ? 180 : 0}deg)`,
                  ...(isSpring ? {} : { transition: 'transform var(--duration) var(--easing)', ...cssStyle }),
                }}
              />
            </button>
            {isSpring ? (
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={motionTransition}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 text-sm text-muted-foreground">{it.body}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            ) : (
              <div
                className="overflow-hidden text-sm text-muted-foreground"
                style={{
                  maxHeight: isOpen ? 200 : 0,
                  opacity: isOpen ? 1 : 0,
                  transition: 'max-height var(--duration) var(--easing), opacity var(--duration) var(--easing)',
                  ...cssStyle,
                }}
              >
                <div className="px-3 pb-3">{it.body}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
