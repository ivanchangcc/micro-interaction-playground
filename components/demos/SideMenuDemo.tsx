'use client';

import { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Home, Settings, User, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import { useDemoTrigger, type DemoTriggerHandle } from '@/hooks/useDemoTrigger';
import { DEFAULT_SIDE_MENU } from '@/lib/component-options/defaults';
import type { DemoProps } from './index';

const ITEMS = [
  { icon: Home, label: 'Home' },
  { icon: User, label: 'Profile' },
  { icon: Bell, label: 'Notifications' },
  { icon: Settings, label: 'Settings' },
];

const SideMenuDemo = forwardRef<DemoTriggerHandle, DemoProps>(function SideMenuDemo({ config, options }, ref) {
  const opts = options.sideMenu ?? DEFAULT_SIDE_MENU;
  const [open, setOpen] = useState(false);
  const { motionTransition } = useAnimationStyle(config);

  useDemoTrigger(ref, {
    kind: 'single',
    trigger: () => setOpen((v) => !v),
  });

  const isLeft = opts.side === 'left';
  const MENU_WIDTH = '14rem'; // w-56

  // Bounce: lower damping for overshoot effect
  const transition =
    opts.bounce && config.type === 'spring'
      ? { ...motionTransition, damping: ((motionTransition as { damping?: number }).damping ?? 20) * 0.6 }
      : motionTransition;

  // Per-kind animation variants
  function getVariants() {
    switch (opts.kind) {
      case 'slide':
        return {
          initial: { x: isLeft ? '-100%' : '100%' },
          animate: { x: 0 },
          exit: { x: isLeft ? '-100%' : '100%' },
        };
      case 'dissolve':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        };
      case 'scale':
        return {
          initial: { scaleX: 0 },
          animate: { scaleX: 1 },
          exit: { scaleX: 0 },
        };
      case 'push':
        return {
          initial: { x: isLeft ? '-100%' : '100%' },
          animate: { x: 0 },
          exit: { x: isLeft ? '-100%' : '100%' },
        };
    }
  }

  const variants = getVariants();
  const transformOrigin = opts.kind === 'scale'
    ? (isLeft ? 'left center' : 'right center')
    : undefined;

  // Push effect: shift the page content
  const pageShift = opts.kind === 'push' && open
    ? (isLeft ? MENU_WIDTH : `-${MENU_WIDTH}`)
    : '0px';

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border bg-white">
      <motion.div
        className="flex h-full w-full flex-col"
        animate={{ x: pageShift }}
        transition={transition}
      >
        <div className="flex h-10 items-center gap-2 border-b bg-zinc-50 px-3">
          <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
            <Menu className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground">Demo app</span>
        </div>
        <div className="flex flex-1 items-center justify-center text-xs text-muted-foreground">
          Click the menu icon
        </div>
      </motion.div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={transition}
              className="absolute inset-0 bg-black/40"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              key="panel"
              initial={variants.initial}
              animate={variants.animate}
              exit={variants.exit}
              transition={transition}
              style={{
                transformOrigin,
                [isLeft ? 'left' : 'right']: 0,
                top: 0,
                bottom: 0,
                position: 'absolute',
                width: MENU_WIDTH,
              }}
              className="flex flex-col gap-1 bg-white p-3 shadow-xl z-10"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold">Menu</span>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setOpen(false)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
              {ITEMS.map(({ icon: Icon, label }, i) => (
                <motion.button
                  key={label}
                  type="button"
                  initial={opts.layered ? { opacity: 0, x: isLeft ? -10 : 10 } : false}
                  animate={{ opacity: 1, x: 0 }}
                  transition={
                    opts.layered
                      ? { ...transition, delay: 0.05 + i * 0.05 }
                      : { duration: 0 }
                  }
                  className="flex items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </motion.button>
              ))}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
});

export default SideMenuDemo;
