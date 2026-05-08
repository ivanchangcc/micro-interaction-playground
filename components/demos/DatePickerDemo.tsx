'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import type { DemoProps } from './index';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function DatePickerDemo({ config }: DemoProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState({ month: 4, year: 2026 }); // May 2026
  const [selected, setSelected] = useState<{ day: number; month: number; year: number } | null>(null);
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const firstDow = (new Date(view.year, view.month, 1).getDay() + 6) % 7; // Mon=0
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length < 42) cells.push(null);

  function nudge(delta: number) {
    setView(({ month, year }) => {
      let m = month + delta;
      let y = year;
      while (m < 0) { m += 12; y -= 1; }
      while (m > 11) { m -= 12; y += 1; }
      return { month: m, year: y };
    });
  }

  const triggerLabel = selected
    ? `${MONTH_NAMES[selected.month]} ${selected.day}, ${selected.year}`
    : 'Pick a date';

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="relative">
      <Button variant="outline" onClick={() => setOpen((v) => !v)}>
        <Calendar className="mr-2 h-4 w-4" />
        {triggerLabel}
      </Button>
      {isSpring ? (
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -4 }}
              transition={motionTransition}
              style={{ transformOrigin: 'top left' }}
              className="absolute left-0 top-full z-10 mt-2 w-[280px] rounded-lg border bg-white p-3 shadow-lg"
            >
              <CalendarPanel
                view={view}
                cells={cells}
                selected={selected}
                onPrev={() => nudge(-1)}
                onNext={() => nudge(1)}
                onPick={(day) => setSelected({ day, month: view.month, year: view.year })}
              />
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <div
          className="absolute left-0 top-full z-10 mt-2 w-[280px] rounded-lg border bg-white p-3 shadow-lg"
          style={{
            transformOrigin: 'top left',
            opacity: open ? 1 : 0,
            transform: `scale(${open ? 1 : 0.96}) translateY(${open ? 0 : -4}px)`,
            pointerEvents: open ? 'auto' : 'none',
            transition: 'opacity var(--duration) var(--easing), transform var(--duration) var(--easing)',
            ...cssStyle,
          }}
        >
          <CalendarPanel
            view={view}
            cells={cells}
            selected={selected}
            onPrev={() => nudge(-1)}
            onNext={() => nudge(1)}
            onPick={(day) => setSelected({ day, month: view.month, year: view.year })}
          />
        </div>
      )}
      </div>
    </div>
  );
}

function CalendarPanel({
  view, cells, selected, onPrev, onNext, onPick,
}: {
  view: { month: number; year: number };
  cells: (number | null)[];
  selected: { day: number; month: number; year: number } | null;
  onPrev: () => void;
  onNext: () => void;
  onPick: (day: number) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <Button size="icon" variant="ghost" onClick={onPrev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">{MONTH_NAMES[view.month]} {view.year}</span>
        <Button size="icon" variant="ghost" onClick={onNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-2 grid grid-cols-7 gap-0.5 text-center text-[10px] text-muted-foreground">
        {/* index key intentional: static list with duplicate values (T, S) */}
        {DOW.map((d, i) => <div key={i}>{d}</div>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          const isSelected =
            day !== null && selected !== null &&
            selected.day === day && selected.month === view.month && selected.year === view.year;
          return (
            <button
              key={i}
              type="button"
              disabled={day === null}
              onClick={() => day !== null && onPick(day)}
              className={`h-7 rounded text-xs ${
                day === null
                  ? 'invisible'
                  : isSelected
                    ? 'bg-foreground text-background'
                    : 'hover:bg-muted'
              }`}
            >
              {day ?? ''}
            </button>
          );
        })}
      </div>
    </>
  );
}
