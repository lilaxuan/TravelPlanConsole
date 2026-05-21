import { useEffect, useRef, useState } from 'react';

interface AnimatedCountProps {
  value: number | null;
  durationMs?: number;
  /** Toggles when the parent wants a visual pulse (e.g. value changed). */
  pulseKey?: number;
  className?: string;
}

const formatter = new Intl.NumberFormat();

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function AnimatedCount({
  value,
  durationMs = 1200,
  className,
}: AnimatedCountProps): React.ReactElement {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);
  const startRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (value == null) return;
    fromRef.current = display;
    startRef.current = performance.now();
    const target = value;

    function frame(now: number) {
      const t = Math.min(1, (now - startRef.current) / durationMs);
      const eased = easeOutCubic(t);
      const v = Math.round(fromRef.current + (target - fromRef.current) * eased);
      setDisplay(v);
      if (t < 1) rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, durationMs]);

  return <span className={className}>{formatter.format(display)}</span>;
}
