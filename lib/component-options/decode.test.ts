import { describe, it, expect } from 'vitest';
import { decodeComponentOptions } from './decode';

describe('decodeComponentOptions', () => {
  it('returns empty object when no relevant keys', () => {
    const params = new URLSearchParams();
    const result = decodeComponentOptions(params, '', 'popover');
    expect(result).toEqual({});
  });

  it('decodes popover position', () => {
    const params = new URLSearchParams('popover.pos=tr');
    const result = decodeComponentOptions(params, '', 'popover');
    expect(result.popover?.position).toBe('top-right');
  });

  it('falls back to default popover position when key missing', () => {
    const params = new URLSearchParams();
    const result = decodeComponentOptions(params, '', 'popover');
    // returns empty if no keys; caller merges with defaults
    expect(result.popover).toBeUndefined();
  });

  it('ignores keys belonging to other components', () => {
    const params = new URLSearchParams('toast.dir=tl&popover.pos=tr');
    const result = decodeComponentOptions(params, '', 'popover');
    expect(result.popover?.position).toBe('top-right');
    expect(result.toast).toBeUndefined();
  });

  it('decodes toast direction', () => {
    const params = new URLSearchParams('toast.dir=bl');
    const result = decodeComponentOptions(params, '', 'toast');
    expect(result.toast?.direction).toBe('bottom-left');
  });

  it('decodes side menu options', () => {
    const params = new URLSearchParams(
      'sideMenu.side=right&sideMenu.kind=dissolve&sideMenu.bounce=1&sideMenu.layered=0',
    );
    const result = decodeComponentOptions(params, '', 'sideMenu');
    expect(result.sideMenu).toEqual({
      side: 'right', kind: 'dissolve', bounce: true, layered: false,
    });
  });

  it('decodes dropdown bounce', () => {
    const params = new URLSearchParams('dropdown.bounce=1');
    const result = decodeComponentOptions(params, '', 'dropdown');
    expect(result.dropdown?.bounce).toBe(true);
  });

  it('decodes icon button scales', () => {
    const params = new URLSearchParams('iconButton.hov=1.1&iconButton.pre=0.9');
    const result = decodeComponentOptions(params, '', 'iconButton');
    expect(result.iconButton).toEqual({ hoverScale: 1.1, pressScale: 0.9 });
  });

  it('decodes slider with drag spring', () => {
    const params = new URLSearchParams(
      'slider.inc=10&slider.s=300&slider.d=25&slider.m=1.5',
    );
    const result = decodeComponentOptions(params, '', 'slider');
    expect(result.slider?.increment).toBe(10);
    expect(result.slider?.dragSpring).toEqual({
      type: 'spring', stiffness: 300, damping: 25, mass: 1.5,
    });
  });

  it('respects pane prefix', () => {
    const params = new URLSearchParams('b.popover.pos=t');
    const result = decodeComponentOptions(params, 'b.', 'popover');
    expect(result.popover?.position).toBe('top');
  });

  it('falls back gracefully on garbage', () => {
    const params = new URLSearchParams('popover.pos=xyz');
    const result = decodeComponentOptions(params, '', 'popover');
    expect(result.popover).toBeUndefined();
  });
});
