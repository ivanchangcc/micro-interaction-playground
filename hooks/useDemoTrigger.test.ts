import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRef } from 'react';
import { useDemoTrigger, type DemoTriggerHandle } from './useDemoTrigger';

describe('useDemoTrigger', () => {
  it('exposes the trigger handle on the ref', () => {
    let called = 0;
    const handle: DemoTriggerHandle = {
      kind: 'single',
      trigger: () => { called++; },
    };
    const { result } = renderHook(() => {
      const ref = useRef<DemoTriggerHandle>(null);
      useDemoTrigger(ref, () => handle, []);
      return ref;
    });
    expect(result.current.current?.kind).toBe('single');
    if (result.current.current?.kind === 'single') {
      result.current.current.trigger();
    }
    expect(called).toBe(1);
  });
});
