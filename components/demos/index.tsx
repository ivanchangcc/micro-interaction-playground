'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { ComponentId } from './registry';
import type { AnimationConfig } from '@/lib/animation/types';

export type DemoProps = { config: AnimationConfig; triggerKey: number };

const DEMO_LOADERS: Record<ComponentId, () => Promise<{ default: ComponentType<DemoProps> }>> = {
  'icon-button':  () => import('./IconButtonDemo'),
  'text-button':  () => import('./TextButtonDemo'),
  'toggle':       () => import('./ToggleDemo'),
  'checkbox':     () => import('./CheckboxDemo'),
  'accordion':    () => import('./AccordionDemo'),
  'tabs':         () => import('./TabsDemo'),
  'stepper':      () => import('./StepperDemo'),
  'slider':       () => import('./SliderDemo'),
  'input-field':  () => import('./InputFieldDemo'),
  'search-input': () => import('./SearchInputDemo'),
  'dropdown':     () => import('./DropdownDemo'),
  'popover':      () => import('./PopoverDemo'),
  'modal':        () => import('./ModalDemo'),
  'date-picker':  () => import('./DatePickerDemo'),
  'toast':        () => import('./ToastDemo'),
  'side-menu':    () => import('./SideMenuDemo'),
  'chips':        () => import('./ChipsDemo'),
};

export function getDemo(id: ComponentId): ComponentType<DemoProps> {
  return dynamic(DEMO_LOADERS[id], { ssr: false });
}
