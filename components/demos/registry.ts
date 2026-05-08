export const COMPONENT_IDS = [
  'icon-button',
  'text-button',
  'toggle',
  'checkbox',
  'accordion',
  'tabs',
  'stepper',
  'slider',
  'input-field',
  'search-input',
  'dropdown',
  'popover',
  'modal',
  'date-picker',
  'toast',
  'side-menu',
  'chips',
] as const;

export type ComponentId = (typeof COMPONENT_IDS)[number];

const LABELS: Record<ComponentId, string> = {
  'icon-button': 'Icon button',
  'text-button': 'Text button',
  'toggle': 'Toggle',
  'checkbox': 'Checkbox',
  'accordion': 'Accordion',
  'tabs': 'Tabs',
  'stepper': 'Stepper',
  'slider': 'Slider',
  'input-field': 'Input field',
  'search-input': 'Search input',
  'dropdown': 'Dropdown',
  'popover': 'Popover',
  'modal': 'Modal',
  'date-picker': 'Date picker',
  'toast': 'Toast',
  'side-menu': 'Side menu',
  'chips': 'Chips',
};

export function isComponentId(value: string): value is ComponentId {
  return (COMPONENT_IDS as readonly string[]).includes(value);
}

export function getComponentLabel(id: ComponentId | string): string {
  return isComponentId(id) ? LABELS[id] : '';
}

export const DEFAULT_COMPONENT_ID: ComponentId = 'toggle';

import type { ComponentOptionsKey } from '@/lib/component-options/types';

export const OPTIONS_KEYS: Partial<Record<ComponentId, ComponentOptionsKey>> = {
  'popover': 'popover',
  'toast': 'toast',
  'side-menu': 'sideMenu',
  'dropdown': 'dropdown',
  'icon-button': 'iconButton',
  'text-button': 'textButton',
  'slider': 'slider',
};

export function getOptionsKey(id: ComponentId): ComponentOptionsKey | undefined {
  return OPTIONS_KEYS[id];
}

export type LogicalSize = { width: number; height: number };

export const LOGICAL_SIZES: Record<ComponentId, LogicalSize> = {
  'icon-button':  { width: 200, height: 200 },
  'text-button':  { width: 240, height: 80 },
  'toggle':       { width: 200, height: 80 },
  'checkbox':     { width: 200, height: 80 },
  'accordion':    { width: 360, height: 320 },
  'tabs':         { width: 360, height: 200 },
  'stepper':      { width: 480, height: 160 },
  'slider':       { width: 360, height: 120 },
  'input-field':  { width: 320, height: 120 },
  'search-input': { width: 320, height: 280 },
  'dropdown':     { width: 240, height: 360 },
  'popover':      { width: 320, height: 280 },
  'modal':        { width: 480, height: 360 },
  'date-picker':  { width: 320, height: 380 },
  'toast':        { width: 390, height: 880 },
  'side-menu':    { width: 360, height: 480 },
  'chips':        { width: 360, height: 160 },
};

export function getLogicalSize(id: ComponentId): LogicalSize {
  return LOGICAL_SIZES[id];
}
