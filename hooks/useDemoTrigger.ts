import { useImperativeHandle, type Ref } from 'react';

export type SingleTrigger = {
  kind: 'single';
  trigger: () => void;
};

export type DualTrigger = {
  kind: 'dual';
  primary: () => void;
  primaryLabel: string;
  secondary: () => void;
  secondaryLabel: string;
};

export type DemoTriggerHandle = SingleTrigger | DualTrigger;

export function useDemoTrigger(
  ref: Ref<DemoTriggerHandle> | undefined,
  handle: DemoTriggerHandle,
): void {
  useImperativeHandle(ref, () => handle, [handle]);
}
