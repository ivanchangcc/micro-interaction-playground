import type { SpringConfig } from '@/lib/animation/types';

export type PopoverPosition =
  | 'top-left' | 'top' | 'top-right'
  | 'left' | 'right'
  | 'bottom-left' | 'bottom' | 'bottom-right';

export type ToastDirection =
  | 'top-left' | 'top' | 'top-right'
  | 'bottom-left' | 'bottom' | 'bottom-right';

export type SideMenuKind = 'slide' | 'dissolve' | 'scale' | 'push';
export type SideMenuSide = 'left' | 'right';

export type PopoverOptions = { position: PopoverPosition };
export type ToastOptions = { direction: ToastDirection };
export type SideMenuOptions = {
  side: SideMenuSide;
  kind: SideMenuKind;
  bounce: boolean;
  layered: boolean;
};
export type DropdownOptions = { bounce: boolean };
export type IconButtonOptions = { hoverScale: number; pressScale: number };
export type TextButtonOptions = { hoverScale: number; pressScale: number };
export type SliderOptions = { increment: number; dragSpring: SpringConfig };

export type ComponentOptions = {
  popover?: PopoverOptions;
  toast?: ToastOptions;
  sideMenu?: SideMenuOptions;
  dropdown?: DropdownOptions;
  iconButton?: IconButtonOptions;
  textButton?: TextButtonOptions;
  slider?: SliderOptions;
};

export type ComponentOptionsKey = keyof ComponentOptions;
