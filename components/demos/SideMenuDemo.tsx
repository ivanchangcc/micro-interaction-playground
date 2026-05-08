'use client';

import { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Home, Settings, User, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import { useDemoTrigger, type DemoTriggerHandle } from '@/hooks/useDemoTrigger';
import type { DemoProps } from './index';

const ITEMS = [
  { icon: Home, label: 'Home' },
  { icon: User, label: 'Profile' },
  { icon: Bell, label: 'Notifications' },
  { icon: Settings, label: 'Settings' },
];

const SideMenuDemo = forwardRef<DemoTriggerHandle, DemoProps>(function SideMenuDemo({ config }, ref) {
  const [open, setOpen] = useState(false);
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  useDemoTrigger(ref, {
    kind: 'single',
    trigger: () => setOpen((v) => !v),
  });

  return (
    <div className="flex h-full w-full items-center justify-center">
    <div className="relative h-full w-full overflow-hidden rounded-lg border bg-white">
      <div className="flex h-10 items-center gap-2 border-b bg-zinc-50 px-3">
        <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
          <Menu className="h-4 w-4" />
        </Button>
        <span className="text-xs text-muted-foreground">Demo app</span>
      </div>
      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
        Click the menu icon
      </div>
      {isSpring ? (
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={motionTransition}
                className="absolute inset-0 bg-black/40"
                onClick={() => setOpen(false)}
              />
              <motion.aside
                key="panel"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={motionTransition}
                className="absolute inset-y-0 left-0 flex w-56 flex-col gap-1 bg-white p-3 shadow-xl"
              >
                <SideMenuContent onClose={() => setOpen(false)} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      ) : (
        <>
          <div
            className="absolute inset-0 bg-black"
            style={{
              opacity: open ? 0.4 : 0,
              pointerEvents: open ? 'auto' : 'none',
              transition: 'opacity var(--duration) var(--easing)',
              ...cssStyle,
            }}
            onClick={() => setOpen(false)}
          />
          <aside
            className="absolute inset-y-0 left-0 flex w-56 flex-col gap-1 bg-white p-3 shadow-xl"
            style={{
              transform: `translateX(${open ? '0%' : '-100%'})`,
              transition: 'transform var(--duration) var(--easing)',
              ...cssStyle,
            }}
          >
            <SideMenuContent onClose={() => setOpen(false)} />
          </aside>
        </>
      )}
    </div>
    </div>
  );
});

export default SideMenuDemo;

function SideMenuContent({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold">Menu</span>
        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onClose}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      {ITEMS.map(({ icon: Icon, label }) => (
        <button
          key={label}
          type="button"
          className="flex items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </>
  );
}
