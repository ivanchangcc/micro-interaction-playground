import { describe, it, expect } from 'vitest';
import type {
  ComponentOptions,
  PopoverPosition,
  ToastDirection,
  SideMenuKind,
} from './types';

describe('ComponentOptions types', () => {
  it('compiles with all option slices', () => {
    const opts: ComponentOptions = {
      popover: { position: 'top-right' },
      toast: { direction: 'bottom-left' },
      sideMenu: { side: 'left', kind: 'slide', bounce: true, layered: false },
      dropdown: { bounce: false },
      iconButton: { hoverScale: 1.05, pressScale: 0.95 },
      textButton: { hoverScale: 1.05, pressScale: 0.95 },
      slider: {
        increment: 5,
        dragSpring: { type: 'spring', stiffness: 200, damping: 20, mass: 1 },
      },
    };
    expect(opts.popover?.position).toBe('top-right');
  });

  it('PopoverPosition includes all 8 positions', () => {
    const positions: PopoverPosition[] = [
      'top-left', 'top', 'top-right', 'left', 'right',
      'bottom-left', 'bottom', 'bottom-right',
    ];
    expect(positions).toHaveLength(8);
  });

  it('ToastDirection includes all 6 directions', () => {
    const dirs: ToastDirection[] = [
      'top-left', 'top', 'top-right', 'bottom-left', 'bottom', 'bottom-right',
    ];
    expect(dirs).toHaveLength(6);
  });

  it('SideMenuKind includes all 4 kinds', () => {
    const kinds: SideMenuKind[] = ['slide', 'dissolve', 'scale', 'push'];
    expect(kinds).toHaveLength(4);
  });
});
