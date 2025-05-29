'use client';

import { RefObject } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Capture the DOM node referenced by `ref`, rasterise it with html2canvas,
 * embed the image into a single‑page A4 PDF and **return a Blob URL** that you
 * can open or download.
 *
 * ```tsx
 * const pdfUrl = await createPdf(printRef, `Incident-${id}.pdf`);
 * window.open(pdfUrl, '_blank');
 * ```
 */
export default async function createPdf<T extends HTMLElement>(
  ref: RefObject<T | null>,
  title = 'Document'
): Promise<string | null> {
  if (!ref.current) return null;

  /* ------------------------------------------------------------------
     html2canvas cannot parse CSS Color‑4 oklch() values (Tailwind default).
     Convert every occurrence in background / text / border colours to HEX,
     then restore them after the PDF is produced.
  ------------------------------------------------------------------ */
  // Dynamically import Culori’s named exports
  const { converter, parse, formatHex } = (await import('culori')) as typeof import('culori');
  const toRGB = converter('rgb');

  type StyleProp = keyof CSSStyleDeclaration;
  type Fix = { el: HTMLElement; prop: StyleProp; original: string };

  const fixes: Fix[] = [];

  const convert = (str: string) =>
    str.replace(/oklch\([^)]+\)/gi, (match) => {
      const parsed = parse(match);
      const rgb = parsed ? toRGB(parsed) : undefined;
      return rgb ? formatHex(rgb) : '#ffffff';
    });

  const COLOR_PROPS: ReadonlyArray<keyof CSSStyleDeclaration> = [
    'color',
    'background',
    'backgroundColor',
    'backgroundImage',
    'borderColor',
    'outlineColor',
    'boxShadow',
    'textShadow',
  ] as const;

  const walk = (node: HTMLElement) => {
    const style = getComputedStyle(node);

    COLOR_PROPS.forEach((propName) => {
      const value = style.getPropertyValue(propName as string);
      if (!/oklch\(/i.test(value)) return;

      const converted = convert(value);
      fixes.push({ el: node, prop: propName as StyleProp, original: value });

      node.style.setProperty(
        propName as string,
        converted,
        style.getPropertyPriority(propName as string)
      );
    });

    Array.from(node.children).forEach((c) => walk(c as HTMLElement));
  };

  walk(ref.current);

  // Render the DOM node to a high‑resolution canvas
  const canvas = await html2canvas(ref.current, { scale: 2 });
  const imgData = canvas.toDataURL('image/png');

  // Create an A4 PDF (210 × 297 mm)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Preserve aspect ratio
  const imgProps = pdf.getImageProperties(imgData);
  const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;

  // Add first page
  pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pdfHeight);

  // Handle overflow onto additional pages, if needed
  let position = -pageHeight;
  while (pdfHeight + position > 0) {
    position += pageHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, pageWidth, pdfHeight);
  }

  // Output as Blob URL so caller can decide what to do
  const blob = pdf.output('blob');
  // ---- restore original colour values ----
  fixes.forEach(({ el, prop, original }) => {
    el.style.setProperty(prop as string, original);
  });
  return URL.createObjectURL(blob);
}
