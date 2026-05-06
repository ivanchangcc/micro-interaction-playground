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
