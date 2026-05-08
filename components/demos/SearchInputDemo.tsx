'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X } from 'lucide-react';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import type { DemoProps } from './index';

const DATA = ['Modal', 'Toast', 'Toggle', 'Tabs', 'Dropdown', 'Slider'];

export default function SearchInputDemo({ config }: DemoProps) {
  const [q, setQ] = useState('');
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);
  const filtered = q ? DATA.filter((d) => d.toLowerCase().includes(q.toLowerCase())) : [];

  return (
    <div className="relative w-full max-w-xs">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.currentTarget.value)}
          placeholder="Search…"
          className="w-full rounded border bg-white py-2 pl-8 pr-8 text-sm"
        />
        {isSpring ? (
          <AnimatePresence>
            {q && (
              <motion.button
                key="clear"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={motionTransition}
                onClick={() => setQ('')}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>
        ) : (
          <button
            onClick={() => setQ('')}
            aria-hidden={!q}
            className="absolute right-2 top-1/2 -translate-y-1/2"
            style={{
              opacity: q ? 1 : 0,
              transform: `translateY(-50%) scale(${q ? 1 : 0.6})`,
              pointerEvents: q ? 'auto' : 'none',
              transition: 'opacity var(--duration) var(--easing), transform var(--duration) var(--easing)',
              ...cssStyle,
            }}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {filtered.length > 0 && (
        <div
          className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded border bg-white shadow-sm"
          style={{
            transition: isSpring ? undefined : 'all var(--duration) var(--easing)',
            ...(!isSpring ? cssStyle : {}),
          }}
        >
          {filtered.map((r) => (
            <div key={r} className="px-3 py-1.5 text-sm hover:bg-muted">{r}</div>
          ))}
        </div>
      )}
    </div>
  );
}
