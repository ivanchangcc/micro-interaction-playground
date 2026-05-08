import { useImperativeHandle, type DependencyList, type Ref } from 'react';

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
  getHandle: () => DemoTriggerHandle,
  deps: DependencyList,
): void {
  useImperativeHandle(ref, getHandle, deps);
}
