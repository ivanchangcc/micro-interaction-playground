'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import type { DemoProps } from './index';

const ITEMS = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape', 'Honeydew'];

export default function DropdownDemo({ config }: DemoProps) {
  const [open, setOpen] = useState(false);
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded border bg-white px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Account <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {isSpring ? (
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.96 }}
              transition={motionTransition}
              className="absolute left-0 top-full mt-1 w-40 origin-top rounded border bg-white shadow max-h-[280px] overflow-y-auto"
            >
              {ITEMS.map((it) => (
                <div key={it} className="cursor-pointer px-3 py-1.5 text-sm hover:bg-muted">{it}</div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <div
          className="absolute left-0 top-full mt-1 w-40 origin-top rounded border bg-white shadow max-h-[280px] overflow-y-auto"
          style={{
            opacity: open ? 1 : 0,
            transform: `scale(${open ? 1 : 0.96}) translateY(${open ? 0 : -4}px)`,
            pointerEvents: open ? 'auto' : 'none',
            transition: 'opacity var(--duration) var(--easing), transform var(--duration) var(--easing)',
            ...cssStyle,
          }}
        >
          {ITEMS.map((it) => (
            <div key={it} className="cursor-pointer px-3 py-1.5 text-sm hover:bg-muted">{it}</div>
          ))}
        </div>
      )}
    </div>
  );
}
