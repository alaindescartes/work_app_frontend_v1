import React from 'react';

interface OverlayProps {
  /** Opacity from 0 – 1 (default = 0.6). */
  brightness?: number;
  /** Anything to render above the overlay. */
  children: React.ReactNode;
}

/**
 * Full‑screen dark overlay.
 *
 * Usage:
 * ```tsx
 * <Overlay brightness={0.4}>
 *   <Dialog />
 * </Overlay>
 * ```
 */
export default function Overlay({ brightness = 0.6, children }: OverlayProps) {
  const clamped = Math.max(0, Math.min(brightness, 1)); // ensure 0–1

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center text-white font-semibold"
      style={{ backgroundColor: `rgba(0,0,0,${clamped})` }}
    >
      {children}
    </div>
  );
}
