import { describe, it, expect } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import type { ComponentType } from 'react';
import { COMPONENT_IDS } from '@/components/demos/registry';
import { DEFAULT_TWEEN, DEFAULT_SPRING } from '@/lib/animation/defaults';
import type { DemoProps } from '@/components/demos/index';

// Direct imports — bypasses next/dynamic which doesn't work in jsdom/Vitest
import AccordionDemo from '@/components/demos/AccordionDemo';
import CheckboxDemo from '@/components/demos/CheckboxDemo';
import ChipsDemo from '@/components/demos/ChipsDemo';
import DatePickerDemo from '@/components/demos/DatePickerDemo';
import DropdownDemo from '@/components/demos/DropdownDemo';
import IconButtonDemo from '@/components/demos/IconButtonDemo';
import InputFieldDemo from '@/components/demos/InputFieldDemo';
import ModalDemo from '@/components/demos/ModalDemo';
import PopoverDemo from '@/components/demos/PopoverDemo';
import SearchInputDemo from '@/components/demos/SearchInputDemo';
import SideMenuDemo from '@/components/demos/SideMenuDemo';
import SliderDemo from '@/components/demos/SliderDemo';
import StepperDemo from '@/components/demos/StepperDemo';
import TabsDemo from '@/components/demos/TabsDemo';
import TextButtonDemo from '@/components/demos/TextButtonDemo';
import ToastDemo from '@/components/demos/ToastDemo';
import ToggleDemo from '@/components/demos/ToggleDemo';

const DEMO_MAP: Record<string, ComponentType<DemoProps>> = {
  'accordion':    AccordionDemo,
  'checkbox':     CheckboxDemo,
  'chips':        ChipsDemo,
  'date-picker':  DatePickerDemo,
  'dropdown':     DropdownDemo,
  'icon-button':  IconButtonDemo,
  'input-field':  InputFieldDemo,
  'modal':        ModalDemo,
  'popover':      PopoverDemo,
  'search-input': SearchInputDemo,
  'side-menu':    SideMenuDemo,
  'slider':       SliderDemo,
  'stepper':      StepperDemo,
  'tabs':         TabsDemo,
  'text-button':  TextButtonDemo,
  'toast':        ToastDemo,
  'toggle':       ToggleDemo,
};

describe('demos smoke test', () => {
  for (const id of COMPONENT_IDS) {
    it(`${id} renders with tween config`, async () => {
      const Demo = DEMO_MAP[id];
      const { container } = render(<Demo config={DEFAULT_TWEEN} options={{}} />);
      await waitFor(() => expect(container.firstChild).toBeTruthy());
    });

    it(`${id} renders with spring config`, async () => {
      const Demo = DEMO_MAP[id];
      const { container } = render(<Demo config={DEFAULT_SPRING} options={{}} />);
      await waitFor(() => expect(container.firstChild).toBeTruthy());
    });
  }
});
