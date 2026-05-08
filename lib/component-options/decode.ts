import type {
  ComponentOptions, ComponentOptionsKey,
  PopoverPosition, ToastDirection, SideMenuKind, SideMenuSide,
} from './types';

const POPOVER_CODE_TO_POS: Record<string, PopoverPosition> = {
  tl: 'top-left', t: 'top', tr: 'top-right',
  l: 'left', r: 'right',
  bl: 'bottom-left', b: 'bottom', br: 'bottom-right',
};

const TOAST_CODE_TO_DIR: Record<string, ToastDirection> = {
  tl: 'top-left', t: 'top', tr: 'top-right',
  bl: 'bottom-left', b: 'bottom', br: 'bottom-right',
};

const SIDE_MENU_KINDS: SideMenuKind[] = ['slide', 'dissolve', 'scale', 'push'];
const SIDE_MENU_SIDES: SideMenuSide[] = ['left', 'right'];

function parseNum(raw: string | null): number | null {
  if (raw == null) return null;
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}

function parseBool(raw: string | null): boolean | null {
  if (raw === '1') return true;
  if (raw === '0') return false;
  return null;
}

export function decodeComponentOptions(
  params: URLSearchParams,
  prefix: string,
  optionsKey: ComponentOptionsKey,
): Partial<ComponentOptions> {
  const k = (key: string) => `${prefix}${key}`;

  if (optionsKey === 'popover') {
    const code = params.get(k('popover.pos'));
    const position = code ? POPOVER_CODE_TO_POS[code] : null;
    return position ? { popover: { position } } : {};
  }

  if (optionsKey === 'toast') {
    const code = params.get(k('toast.dir'));
    const direction = code ? TOAST_CODE_TO_DIR[code] : null;
    return direction ? { toast: { direction } } : {};
  }

  if (optionsKey === 'sideMenu') {
    const sideRaw = params.get(k('sideMenu.side'));
    const kindRaw = params.get(k('sideMenu.kind'));
    const side = sideRaw && SIDE_MENU_SIDES.includes(sideRaw as SideMenuSide)
      ? (sideRaw as SideMenuSide) : null;
    const kind = kindRaw && SIDE_MENU_KINDS.includes(kindRaw as SideMenuKind)
      ? (kindRaw as SideMenuKind) : null;
    const bounce = parseBool(params.get(k('sideMenu.bounce')));
    const layered = parseBool(params.get(k('sideMenu.layered')));
    if (side && kind && bounce !== null && layered !== null) {
      return { sideMenu: { side, kind, bounce, layered } };
    }
    return {};
  }

  if (optionsKey === 'dropdown') {
    const bounce = parseBool(params.get(k('dropdown.bounce')));
    return bounce !== null ? { dropdown: { bounce } } : {};
  }

  if (optionsKey === 'iconButton') {
    const hov = parseNum(params.get(k('iconButton.hov')));
    const pre = parseNum(params.get(k('iconButton.pre')));
    return hov !== null && pre !== null
      ? { iconButton: { hoverScale: hov, pressScale: pre } }
      : {};
  }

  if (optionsKey === 'textButton') {
    const hov = parseNum(params.get(k('textButton.hov')));
    const pre = parseNum(params.get(k('textButton.pre')));
    return hov !== null && pre !== null
      ? { textButton: { hoverScale: hov, pressScale: pre } }
      : {};
  }

  if (optionsKey === 'slider') {
    const inc = parseNum(params.get(k('slider.inc')));
    const s = parseNum(params.get(k('slider.s')));
    const d = parseNum(params.get(k('slider.d')));
    const m = parseNum(params.get(k('slider.m')));
    if (inc !== null && s !== null && d !== null && m !== null) {
      return {
        slider: {
          increment: inc,
          dragSpring: { type: 'spring', stiffness: s, damping: d, mass: m },
        },
      };
    }
    return {};
  }

  return {};
}
