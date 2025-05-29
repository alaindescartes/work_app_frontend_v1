'use client';

import { RefObject } from 'react';
import { useReactToPrint } from 'react-to-print';

/**
 * Simple wrapper around `useReactToPrint`.
 *
 * ```tsx
 * const printRef = useRef<HTMLDivElement>(null);
 * const handlePrint = usePrint(printRef, `Incident-${report.id}`);
 *
 * <Button onClick={handlePrint}>Print</Button>
 * <div ref={printRef}>…printable content…</div>
 * ```
 *
 * @param ref   A React ref pointing to the DOM node you want to print.
 * @param title Optional document/PDF title shown in the print dialog.
 */
export default function usePrint<T extends HTMLElement>(
  ref: RefObject<T | null>,
  title = 'Document'
) {
  return useReactToPrint({
    contentRef: ref,
    documentTitle: title,
    pageStyle: '@page { margin: 1cm 1.5cm; size: A4; }',
  });
}
