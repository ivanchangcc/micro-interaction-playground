'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type Props = {
  width: number;
  height: number;
  children: ReactNode;
};

export function PaneScaler({ width, height, children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current?.parentElement;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      const paneW = el.clientWidth;
      const paneH = el.clientHeight;
      // padding inside the pane is currently p-8 → 32px on each side
      const usableW = Math.max(0, paneW - 64);
      const usableH = Math.max(0, paneH - 64);
      const next = Math.min(usableW / width, usableH / height, 1);
      setScale(next > 0 ? next : 1);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [width, height]);

  return (
    <div
      ref={containerRef}
      style={{ width: width * scale, height: height * scale }}
      className="relative"
    >
      <div
        style={{
          width,
          height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
        className="absolute left-0 top-0"
      >
        {children}
      </div>
    </div>
  );
}
