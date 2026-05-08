import type { ComponentOptions, PopoverPosition, ToastDirection } from './types';

const POPOVER_POS_TO_CODE: Record<PopoverPosition, string> = {
  'top-left': 'tl', 'top': 't', 'top-right': 'tr',
  'left': 'l', 'right': 'r',
  'bottom-left': 'bl', 'bottom': 'b', 'bottom-right': 'br',
};

const TOAST_DIR_TO_CODE: Record<ToastDirection, string> = {
  'top-left': 'tl', 'top': 't', 'top-right': 'tr',
  'bottom-left': 'bl', 'bottom': 'b', 'bottom-right': 'br',
};

export function encodeComponentOptions(
  params: URLSearchParams,
  prefix: string,
  opts: Partial<ComponentOptions>,
): void {
  const k = (key: string) => `${prefix}${key}`;

  if (opts.popover) {
    params.set(k('popover.pos'), POPOVER_POS_TO_CODE[opts.popover.position]);
  }
  if (opts.toast) {
    params.set(k('toast.dir'), TOAST_DIR_TO_CODE[opts.toast.direction]);
  }
  if (opts.sideMenu) {
    params.set(k('sideMenu.side'), opts.sideMenu.side);
    params.set(k('sideMenu.kind'), opts.sideMenu.kind);
    params.set(k('sideMenu.bounce'), opts.sideMenu.bounce ? '1' : '0');
    params.set(k('sideMenu.layered'), opts.sideMenu.layered ? '1' : '0');
  }
  if (opts.dropdown) {
    params.set(k('dropdown.bounce'), opts.dropdown.bounce ? '1' : '0');
  }
  if (opts.iconButton) {
    params.set(k('iconButton.hov'), String(opts.iconButton.hoverScale));
    params.set(k('iconButton.pre'), String(opts.iconButton.pressScale));
  }
  if (opts.textButton) {
    params.set(k('textButton.hov'), String(opts.textButton.hoverScale));
    params.set(k('textButton.pre'), String(opts.textButton.pressScale));
  }
  if (opts.slider) {
    params.set(k('slider.inc'), String(opts.slider.increment));
    params.set(k('slider.s'), String(opts.slider.dragSpring.stiffness));
    params.set(k('slider.d'), String(opts.slider.dragSpring.damping));
    params.set(k('slider.m'), String(opts.slider.dragSpring.mass));
  }
}
