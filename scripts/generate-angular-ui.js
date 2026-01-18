// scripts/generate-angular-ui.js
import fs from 'fs';
const DESIGN_TOKENS_PATH = '../../design-tokens/design-tokens';
const schema = JSON.parse(
  fs.readFileSync('./output/ui-schema.json', 'utf-8')
);

function kebab(name) {
  return name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function generateTS(name) {
  return `
import { Component, Input } from '@angular/core';
import { ${name}UI } from '../../ui-models/${name.toLowerCase()}.ui';

@Component({
  selector: 'app-${kebab(name)}',
  standalone: true,
  templateUrl: './${kebab(name)}.component.html',
  styleUrls: ['./${kebab(name)}.component.scss']
})
export class ${name}Component {
  @Input({ required: true }) data!: ${name}UI;
}
`.trim();
}

function generateHTML(component) {
  return `
<div class="${kebab(component.name)}">
  <div class="label">{{ data.label }}</div>
  <div class="value">{{ data.value }}</div>
</div>
`.trim();
}

// function generateSCSS(component) {
//   const layout = component.layout || {};
//   return `
// .${kebab(component.name)} {
//   display: ${layout.display || 'block'};
//   flex-direction: ${layout.direction || 'row'};
//   gap: ${layout.gap || 0}px;
//   padding: 16px;
//   border-radius: 12px;
//   background: #ffffff;
// }
// `.trim();
// }

// ---------- generate ----------

function generateSCSS(component) {
  const layout = component.layout || {};
  
  return `
@import '${DESIGN_TOKENS_PATH}';

.${kebab(component.name)} {
  display: ${layout.display || 'flex'};
  flex-direction: column; // mobile-first
  gap: ${layout.gap || 12}px;
  padding: ${layout.padding || 16}px;
  border-radius: ${layout.borderRadius || 12}px;
  background: ${layout.bgColor || '#ffffff'};
  font-family: ${layout.fontFamily || 'sans-serif'};

  @media (min-width: 768px) { // tablet
    flex-direction: ${layout.direction || 'row'};
    gap: ${(layout.gap || 12) + 4}px;
  }

  @media (min-width: 1024px) { // desktop
    gap: ${(layout.gap || 12) + 8}px;
  }
}
`.trim();
}


// schema.pages.forEach(page => {
//   page.components.forEach(component => {
//     const dir = `./angular/components/${kebab(component.name)}`;
//     fs.mkdirSync(dir, { recursive: true });

//     fs.writeFileSync(
//       `${dir}/${kebab(component.name)}.component.ts`,
//       generateTS(component.name)
//     );

//     fs.writeFileSync(
//       `${dir}/${kebab(component.name)}.component.html`,
//       generateHTML(component)
//     );

//     fs.writeFileSync(
//         `${dir}/${kebab(component.name)}.component.scss`,
//         generateSCSS(component)
//     );
//   });
// });

schema.pages.forEach(page => {
  page.components.forEach(component => {
    const dir = `./angular/components/${kebab(component.name)}`;
    fs.mkdirSync(dir, { recursive: true });

    // TS
    fs.writeFileSync(
      `${dir}/${kebab(component.name)}.component.ts`,
      generateTS(component.name)
    );

    // HTML
    fs.writeFileSync(
      `${dir}/${kebab(component.name)}.component.html`,
      generateHTML(component)
    );

    // SCSS → now responsive + design tokens
    fs.writeFileSync(
      `${dir}/${kebab(component.name)}.component.scss`,
      generateSCSS(component)
    );
  });
});

console.log('✅ Angular UI components generated');
