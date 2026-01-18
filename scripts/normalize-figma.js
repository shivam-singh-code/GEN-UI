// scripts/normalize-figma.js
import fs from 'fs';

const raw = JSON.parse(
  fs.readFileSync('./output/figma-raw.json', 'utf-8')
);

// ---------- helpers ----------

function toKebabCase(str) {
  return str.toLowerCase().replace(/\s+/g, '-');
}

function extractLayout(node) {
  if (!node.layoutMode) return null;

  return {
    display: 'flex',
    direction: node.layoutMode === 'HORIZONTAL' ? 'row' : 'column',
    gap: node.itemSpacing || 0
  };
}

function extractTexts(node, acc = []) {
  if (node.type === 'TEXT' && node.characters) {
    acc.push(node.characters);
  }

  if (node.children) {
    node.children.forEach(child => extractTexts(child, acc));
  }

  return acc;
}

function isRepeatable(node) {
  return (
    node.type === 'COMPONENT' ||
    node.type === 'INSTANCE' ||
    (node.children && node.children.length > 1)
  );
}

// ---------- main normalize ----------

function normalize() {
  const pages = [];

  const canvases = raw.document.children || [];

  canvases.forEach(canvas => {
    if (canvas.type !== 'CANVAS') return;

    const page = {
      name: canvas.name,
      route: `/${toKebabCase(canvas.name)}`,
      components: []
    };

    (canvas.children || []).forEach(node => {
      if (!['FRAME', 'COMPONENT'].includes(node.type)) return;

      const component = {
        name: node.name.replace(/\s+/g, ''),
        type: 'component',
        layout: extractLayout(node),
        texts: extractTexts(node),
        repeatable: isRepeatable(node)
      };

      page.components.push(component);
    });

    pages.push(page);
  });

  return { pages };
}

// ---------- write output ----------

const uiSchema = normalize();

fs.writeFileSync(
  './output/ui-schema.json',
  JSON.stringify(uiSchema, null, 2)
);

console.log('✅ UI schema generated');
console.log('📄 Saved to output/ui-schema.json');
