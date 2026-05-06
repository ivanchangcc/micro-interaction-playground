import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUrlState } from './useUrlState';
import { DEFAULT_SPRING } from '@/lib/animation/defaults';

describe('useUrlState', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('initial state comes from URL params', () => {
    window.history.replaceState({}, '', '/?c=modal');
    const { result } = renderHook(() => useUrlState());
    expect(result.current.state.componentId).toBe('modal');
  });

  it('setState updates the URL (debounced)', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useUrlState());
    act(() => {
      result.current.setState((s) => ({ ...s, componentId: 'modal' }));
    });
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    expect(window.location.search).toContain('c=modal');
    vi.useRealTimers();
  });

  it('round-trips a spring config', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useUrlState());
    act(() => {
      result.current.setState((s) => ({ ...s, configA: DEFAULT_SPRING }));
    });
    await act(async () => { vi.advanceTimersByTime(200); });
    expect(window.location.search).toContain('t=spring');
    vi.useRealTimers();
  });
});
