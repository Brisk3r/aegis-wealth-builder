/**
 * Client-side SVG Optimizer & Formatter Utility
 */

export function sanitizeAndFormatSvg(rawSvg: string): string {
  if (!rawSvg) return "";
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawSvg, "image/svg+xml");
    const svg = doc.querySelector("svg");
    if (!svg) return rawSvg;
    
    // Ensure xmlns is set
    if (!svg.getAttribute("xmlns")) {
      svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    }

    return new XMLSerializer().serializeToString(doc);
  } catch {
    return rawSvg;
  }
}

export function minifySvg(rawSvg: string): string {
  if (!rawSvg) return "";
  return rawSvg
    .replace(/<!--[\s\S]*?-->/g, "") // remove comments
    .replace(/>\s+</g, "><") // remove whitespace between tags
    .replace(/\s{2,}/g, " ") // collapse spaces
    .trim();
}

export function cleanSvgMetadata(rawSvg: string): string {
  if (!rawSvg) return "";
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawSvg, "image/svg+xml");
    
    // Remove metadata elements
    const metadataTags = doc.querySelectorAll("metadata, title, desc, sketch\\:type");
    metadataTags.forEach((el) => el.remove());

    // Remove sketch/inkscape/sodipodi attributes
    const allNodes = doc.querySelectorAll("*");
    allNodes.forEach((node) => {
      const attrs = Array.from(node.attributes);
      attrs.forEach((attr) => {
        if (
          attr.name.startsWith("sketch:") ||
          attr.name.startsWith("inkscape:") ||
          attr.name.startsWith("sodipodi:") ||
          attr.name === "xmlns:sketch" ||
          attr.name === "xmlns:inkscape"
        ) {
          node.removeAttribute(attr.name);
        }
      });
    });

    return new XMLSerializer().serializeToString(doc);
  } catch {
    return rawSvg;
  }
}

export function convertSvgToReactJsx(rawSvg: string, componentName: string = "CustomIcon"): string {
  if (!rawSvg) return "";
  
  // Convert standard SVG attributes to camelCase for React
  const jsx = rawSvg
    .replace(/class=/g, "className=")
    .replace(/stroke-width=/g, "strokeWidth=")
    .replace(/stroke-linecap=/g, "strokeLinecap=")
    .replace(/stroke-linejoin=/g, "strokeLinejoin=")
    .replace(/stroke-miterlimit=/g, "strokeMiterlimit=")
    .replace(/stroke-dasharray=/g, "strokeDasharray=")
    .replace(/stroke-dashoffset=/g, "strokeDashoffset=")
    .replace(/stroke-opacity=/g, "strokeOpacity=")
    .replace(/fill-rule=/g, "fillRule=")
    .replace(/fill-opacity=/g, "fillOpacity=")
    .replace(/clip-rule=/g, "clipRule=")
    .replace(/clip-path=/g, "clipPath=")
    .replace(/stop-color=/g, "stopColor=")
    .replace(/stop-opacity=/g, "stopOpacity=")
    .replace(/xmlns:xlink=/g, "xmlnsXlink=");

  return `import React from 'react';

export default function ${componentName}(props: React.SVGProps<SVGSVGElement>) {
  return (
    ${jsx.split('\n').join('\n    ')}
  );
}`;
}

export function convertSvgToVue(rawSvg: string): string {
  if (!rawSvg) return "";
  return `<template>
  ${rawSvg.split('\n').join('\n  ')}
</template>

<script setup>
// SVG Component
</script>`;
}
