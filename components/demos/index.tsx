'use client';

import dynamic from 'next/dynamic';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import type { ComponentId } from './registry';
import type { AnimationConfig } from '@/lib/animation/types';
import type { ComponentOptions } from '@/lib/component-options/types';
import type { DemoTriggerHandle } from '@/hooks/useDemoTrigger';

export type DemoProps = {
  config: AnimationConfig;
  options: Partial<ComponentOptions>;
  triggerKey: number;
};

export type DemoComponent = ForwardRefExoticComponent<
  DemoProps & RefAttributes<DemoTriggerHandle>
>;

export const DEMOS: Record<ComponentId, DemoComponent> = {
  'icon-button':  dynamic(() => import('./IconButtonDemo'),  { ssr: false }) as DemoComponent,
  'text-button':  dynamic(() => import('./TextButtonDemo'),  { ssr: false }) as DemoComponent,
  'toggle':       dynamic(() => import('./ToggleDemo'),      { ssr: false }) as DemoComponent,
  'checkbox':     dynamic(() => import('./CheckboxDemo'),    { ssr: false }) as DemoComponent,
  'accordion':    dynamic(() => import('./AccordionDemo'),   { ssr: false }) as DemoComponent,
  'tabs':         dynamic(() => import('./TabsDemo'),        { ssr: false }) as DemoComponent,
  'stepper':      dynamic(() => import('./StepperDemo'),     { ssr: false }) as DemoComponent,
  'slider':       dynamic(() => import('./SliderDemo'),      { ssr: false }) as DemoComponent,
  'input-field':  dynamic(() => import('./InputFieldDemo'),  { ssr: false }) as DemoComponent,
  'search-input': dynamic(() => import('./SearchInputDemo'), { ssr: false }) as DemoComponent,
  'dropdown':     dynamic(() => import('./DropdownDemo'),    { ssr: false }) as DemoComponent,
  'popover':      dynamic(() => import('./PopoverDemo'),     { ssr: false }) as DemoComponent,
  'modal':        dynamic(() => import('./ModalDemo'),       { ssr: false }) as DemoComponent,
  'date-picker':  dynamic(() => import('./DatePickerDemo'),  { ssr: false }) as DemoComponent,
  'toast':        dynamic(() => import('./ToastDemo'),       { ssr: false }) as DemoComponent,
  'side-menu':    dynamic(() => import('./SideMenuDemo'),    { ssr: false }) as DemoComponent,
  'chips':        dynamic(() => import('./ChipsDemo'),       { ssr: false }) as DemoComponent,
};

export function getDemo(id: ComponentId): DemoComponent {
  return DEMOS[id];
}
