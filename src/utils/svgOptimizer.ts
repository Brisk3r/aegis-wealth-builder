/**
 * Client-side SVG Optimizer & Deep Attribute Parsing Utility
 */

export function applyDeepColorOverrides(
  rawSvg: string,
  fillColor?: string,
  strokeColor?: string,
  strokeWidth?: number
): string {
  if (!rawSvg) return "";
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawSvg, "image/svg+xml");
    const svg = doc.querySelector("svg");
    if (!svg) return rawSvg;

    const vectorElements = svg.querySelectorAll("path, circle, rect, polygon, polyline, ellipse, line, g");
    vectorElements.forEach((el) => {
      // Remove inline style locks for fill/stroke
      const currentStyle = el.getAttribute("style");
      if (currentStyle) {
        const cleanedStyle = currentStyle
          .replace(/fill\s*:\s*[^;]+;?/gi, "")
          .replace(/stroke\s*:\s*[^;]+;?/gi, "")
          .replace(/stroke-width\s*:\s*[^;]+;?/gi, "");
        if (cleanedStyle.trim()) {
          el.setAttribute("style", cleanedStyle);
        } else {
          el.removeAttribute("style");
        }
      }

      // Apply fill override if element uses fill
      if (fillColor && el.tagName !== "g") {
        const currentFill = el.getAttribute("fill");
        if (currentFill !== "none") {
          el.setAttribute("fill", fillColor);
        }
      }

      // Apply stroke override if element uses stroke
      if (strokeColor && el.tagName !== "g") {
        const currentStroke = el.getAttribute("stroke");
        if (currentStroke && currentStroke !== "none") {
          el.setAttribute("stroke", strokeColor);
        }
      }

      // Apply stroke width override
      if (strokeWidth !== undefined && el.tagName !== "g") {
        if (el.hasAttribute("stroke") || el.hasAttribute("stroke-width")) {
          el.setAttribute("stroke-width", strokeWidth.toString());
        }
      }
    });

    return new XMLSerializer().serializeToString(doc);
  } catch {
    return rawSvg;
  }
}

export function sanitizeAndFormatSvg(rawSvg: string): string {
  if (!rawSvg) return "";
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawSvg, "image/svg+xml");
    const svg = doc.querySelector("svg");
    if (!svg) return rawSvg;

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
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function cleanSvgMetadata(rawSvg: string): string {
  if (!rawSvg) return "";
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawSvg, "image/svg+xml");
    
    const metadataTags = doc.querySelectorAll("metadata, title, desc, sketch\\:type");
    metadataTags.forEach((el) => el.remove());

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
