// scripts/generate-design-tokens.js
import fs from 'fs';

const figmaRaw = JSON.parse(fs.readFileSync('./output/figma-raw.json', 'utf-8'));

const COLORS = {};
const FONTS = {};

// Extract color styles
if (figmaRaw.styles) {
  for (const [name, style] of Object.entries(figmaRaw.styles)) {
    if (style.styleType === 'FILL') {
      const node = figmaRaw.document.children.find(n => n.id === style.nodeId);
      if (node?.fills?.[0]?.color) {
        const c = node.fills[0].color;
        COLORS[name.replace(/[^a-zA-Z0-9]/g, '_')] =
          `rgb(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)})`;
      }
    } else if (style.styleType === 'TEXT') {
      const node = figmaRaw.document.children.find(n => n.id === style.nodeId);
      if (node?.style?.fontFamily) {
        FONTS[name.replace(/[^a-zA-Z0-9]/g, '_')] = node.style.fontFamily;
      }
    }
  }
}

const content = `
// Generated from Figma
export const COLORS = ${JSON.stringify(COLORS, null, 2)};
export const FONTS = ${JSON.stringify(FONTS, null, 2)};
`;

fs.mkdirSync('./angular/design-tokens', { recursive: true });
fs.writeFileSync('./angular/design-tokens/design-tokens.ts', content);

console.log('✅ Design tokens generated');
