'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { ComponentId } from './registry';
import type { AnimationConfig } from '@/lib/animation/types';

export type DemoProps = { config: AnimationConfig; triggerKey: number };

export const DEMOS: Record<ComponentId, ComponentType<DemoProps>> = {
  'icon-button':  dynamic(() => import('./IconButtonDemo'),  { ssr: false }),
  'text-button':  dynamic(() => import('./TextButtonDemo'),  { ssr: false }),
  'toggle':       dynamic(() => import('./ToggleDemo'),      { ssr: false }),
  'checkbox':     dynamic(() => import('./CheckboxDemo'),    { ssr: false }),
  'accordion':    dynamic(() => import('./AccordionDemo'),   { ssr: false }),
  'tabs':         dynamic(() => import('./TabsDemo'),        { ssr: false }),
  'stepper':      dynamic(() => import('./StepperDemo'),     { ssr: false }),
  'slider':       dynamic(() => import('./SliderDemo'),      { ssr: false }),
  'input-field':  dynamic(() => import('./InputFieldDemo'),  { ssr: false }),
  'search-input': dynamic(() => import('./SearchInputDemo'), { ssr: false }),
  'dropdown':     dynamic(() => import('./DropdownDemo'),    { ssr: false }),
  'popover':      dynamic(() => import('./PopoverDemo'),     { ssr: false }),
  'modal':        dynamic(() => import('./ModalDemo'),       { ssr: false }),
  'date-picker':  dynamic(() => import('./DatePickerDemo'),  { ssr: false }),
  'toast':        dynamic(() => import('./ToastDemo'),       { ssr: false }),
  'side-menu':    dynamic(() => import('./SideMenuDemo'),    { ssr: false }),
  'chips':        dynamic(() => import('./ChipsDemo'),       { ssr: false }),
};

export function getDemo(id: ComponentId): ComponentType<DemoProps> {
  return DEMOS[id];
}
