import { describe, it, expect } from 'vitest';
import { encodeComponentOptions } from './encode';
import type { ComponentOptions } from './types';

describe('encodeComponentOptions', () => {
  it('returns empty params when options are empty', () => {
    const params = new URLSearchParams();
    encodeComponentOptions(params, '', {});
    expect(params.toString()).toBe('');
  });

  it('encodes popover position with namespaced key', () => {
    const params = new URLSearchParams();
    encodeComponentOptions(params, '', { popover: { position: 'top-right' } });
    expect(params.get('popover.pos')).toBe('tr');
  });

  it('encodes toast direction', () => {
    const params = new URLSearchParams();
    encodeComponentOptions(params, '', { toast: { direction: 'bottom-left' } });
    expect(params.get('toast.dir')).toBe('bl');
  });

  it('encodes side menu options', () => {
    const params = new URLSearchParams();
    encodeComponentOptions(params, '', {
      sideMenu: { side: 'right', kind: 'dissolve', bounce: true, layered: false },
    });
    expect(params.get('sideMenu.side')).toBe('right');
    expect(params.get('sideMenu.kind')).toBe('dissolve');
    expect(params.get('sideMenu.bounce')).toBe('1');
    expect(params.get('sideMenu.layered')).toBe('0');
  });

  it('encodes dropdown bounce', () => {
    const params = new URLSearchParams();
    encodeComponentOptions(params, '', { dropdown: { bounce: true } });
    expect(params.get('dropdown.bounce')).toBe('1');
  });

  it('encodes icon button hover and press scale', () => {
    const params = new URLSearchParams();
    encodeComponentOptions(params, '', {
      iconButton: { hoverScale: 1.1, pressScale: 0.9 },
    });
    expect(params.get('iconButton.hov')).toBe('1.1');
    expect(params.get('iconButton.pre')).toBe('0.9');
  });

  it('encodes slider increment and drag spring', () => {
    const params = new URLSearchParams();
    encodeComponentOptions(params, '', {
      slider: {
        increment: 10,
        dragSpring: { type: 'spring', stiffness: 300, damping: 25, mass: 1.5 },
      },
    });
    expect(params.get('slider.inc')).toBe('10');
    expect(params.get('slider.s')).toBe('300');
    expect(params.get('slider.d')).toBe('25');
    expect(params.get('slider.m')).toBe('1.5');
  });

  it('applies pane prefix to all keys', () => {
    const params = new URLSearchParams();
    encodeComponentOptions(params, 'b.', { popover: { position: 'top' } });
    expect(params.get('b.popover.pos')).toBe('t');
  });
});
