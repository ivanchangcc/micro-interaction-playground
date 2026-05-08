import { describe, it, expect } from 'vitest';
import {
  DEFAULT_POPOVER,
  DEFAULT_TOAST,
  DEFAULT_SIDE_MENU,
  DEFAULT_DROPDOWN,
  DEFAULT_ICON_BUTTON,
  DEFAULT_TEXT_BUTTON,
  DEFAULT_SLIDER,
} from './defaults';

describe('component option defaults', () => {
  it('popover defaults to bottom', () => {
    expect(DEFAULT_POPOVER.position).toBe('bottom');
  });
  it('toast defaults to bottom-right', () => {
    expect(DEFAULT_TOAST.direction).toBe('bottom-right');
  });
  it('side menu defaults to left, slide, no bounce, no layered', () => {
    expect(DEFAULT_SIDE_MENU).toEqual({
      side: 'left', kind: 'slide', bounce: false, layered: false,
    });
  });
  it('dropdown bounce defaults off', () => {
    expect(DEFAULT_DROPDOWN.bounce).toBe(false);
  });
  it('icon button scales default to 1.05 / 0.95', () => {
    expect(DEFAULT_ICON_BUTTON).toEqual({ hoverScale: 1.05, pressScale: 0.95 });
  });
  it('text button scales default to 1.05 / 0.95', () => {
    expect(DEFAULT_TEXT_BUTTON).toEqual({ hoverScale: 1.05, pressScale: 0.95 });
  });
  it('slider defaults: increment 5, dragSpring is a SpringConfig', () => {
    expect(DEFAULT_SLIDER.increment).toBe(5);
    expect(DEFAULT_SLIDER.dragSpring.type).toBe('spring');
  });
});
