import type {
  PopoverOptions, ToastOptions, SideMenuOptions, DropdownOptions,
  IconButtonOptions, TextButtonOptions, SliderOptions,
} from './types';

export const DEFAULT_POPOVER: PopoverOptions = { position: 'bottom' };
export const DEFAULT_TOAST: ToastOptions = { direction: 'bottom-right' };
export const DEFAULT_SIDE_MENU: SideMenuOptions = {
  side: 'left', kind: 'slide', bounce: false, layered: false,
};
export const DEFAULT_DROPDOWN: DropdownOptions = { bounce: false };
export const DEFAULT_ICON_BUTTON: IconButtonOptions = { hoverScale: 1.05, pressScale: 0.95 };
export const DEFAULT_TEXT_BUTTON: TextButtonOptions = { hoverScale: 1.05, pressScale: 0.95 };
export const DEFAULT_SLIDER: SliderOptions = {
  increment: 5,
  dragSpring: { type: 'spring', stiffness: 200, damping: 20, mass: 1 },
};
