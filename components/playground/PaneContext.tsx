'use client';

import { createContext, useContext } from 'react';

export const PaneContext = createContext<HTMLElement | null>(null);

export function usePaneContainer(): HTMLElement | null {
  return useContext(PaneContext);
}
