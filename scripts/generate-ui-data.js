// scripts/generate-ui-data.js
import fs from 'fs';

const schema = JSON.parse(
  fs.readFileSync('./output/ui-schema.json', 'utf-8')
);

function inferType(text) {
  return /^[\d₹,]+$/.test(text) ? 'number' : 'string';
}

function normalizeFieldName(text, index) {
  if (index === 0) return 'label';
  if (index === 1) return 'value';
  return `field${index}`;
}

function generateInterface(component) {
  const interfaceName = `${component.name}UI`;
  const fields = component.texts.map((text, i) => {
    return `  ${normalizeFieldName(text, i)}: ${inferType(text)};`;
  });

  return `
export interface ${interfaceName} {
${fields.join('\n')}
}
`.trim();
}

function generateMock(component) {
  const interfaceName = `${component.name}UI`;
  const mockName = component.name.toUpperCase() + '_MOCK';

  const values = component.texts.map((text, i) => {
    const key = normalizeFieldName(text, i);
    const value = inferType(text) === 'number'
      ? text.replace(/[^\d]/g, '')
      : `'${text}'`;
    return `    ${key}: ${value}`;
  });

  return `
import { ${interfaceName} } from '../ui-models/${component.name.toLowerCase()}.ui';

export const ${mockName}: ${interfaceName}[] = [
  {
${values.join(',\n')}
  }
];
`.trim();
}

// ---------- generate ----------

schema.pages.forEach(page => {
  page.components.forEach(component => {
    const modelDir = './generated/ui-models';
    const mockDir = './generated/ui-mock';

    fs.mkdirSync(modelDir, { recursive: true });
    fs.mkdirSync(mockDir, { recursive: true });

    fs.writeFileSync(
      `${modelDir}/${component.name.toLowerCase()}.ui.ts`,
      generateInterface(component)
    );

    fs.writeFileSync(
      `${mockDir}/${component.name.toLowerCase()}.mock.ts`,
      generateMock(component)
    );
  });
});

console.log('✅ UI models and mock data generated');
