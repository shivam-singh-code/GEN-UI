// scripts/generate-pages.js
import fs from 'fs';

const schema = JSON.parse(
  fs.readFileSync('./output/ui-schema.json', 'utf-8')
);

function kebab(name) {
  return name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

// Generate Angular page
schema.pages.forEach(page => {
  const pageDir = `./angular/pages/${kebab(page.name)}`;
  fs.mkdirSync(pageDir, { recursive: true });

  // Page TS
  const imports = page.components.map(c => `${c.name}Component`).join(', ');
  const importStatements = page.components.map(
    c => `import { ${c.name}Component } from '../../components/${kebab(c.name)}/${kebab(c.name)}.component';`
  ).join('\n');

  const inputsStatements = page.components.map(c => {
    const mockVar = `${c.name.toUpperCase()}_MOCK`;
    return `  ${kebab(c.name)} = ${mockVar};`;
  }).join('\n');

  const tsContent = `
import { Component } from '@angular/core';
${importStatements}
${page.components.map(c => `import { ${c.name.toUpperCase()}_MOCK } from '../../ui-mock/${kebab(c.name)}.mock';`).join('\n')}

@Component({
  standalone: true,
  imports: [${imports}],
  templateUrl: './${kebab(page.name)}.page.html',
  styleUrls: ['./${kebab(page.name)}.page.scss']
})
export class ${page.name.replace(/\s+/g, '')}Page {
${inputsStatements}
}
  `.trim();

  fs.writeFileSync(`${pageDir}/${kebab(page.name)}.page.ts`, tsContent);

  // Page HTML
  const htmlContent = page.components.map(c => {
    const compSelector = `app-${kebab(c.name)}`;
    const dataVar = kebab(c.name);
    if (c.repeatable) {
      return `<${compSelector} *ngFor="let item of ${dataVar}" [data]="item"></${compSelector}>`;
    } else {
      return `<${compSelector} [data]="${dataVar}"></${compSelector}>`;
    }
  }).join('\n');

  fs.writeFileSync(`${pageDir}/${kebab(page.name)}.page.html`, htmlContent);

  // Page SCSS (simple grid)
  const scssContent = `
:host {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(${page.components.length}, 1fr);
  }
}
  `.trim();

  fs.writeFileSync(`${pageDir}/${kebab(page.name)}.page.scss`, scssContent);
});

// ---------- Routes ----------
const routes = schema.pages.map(page => {
  return `{
  path: '${kebab(page.name)}',
  loadComponent: () => import('./pages/${kebab(page.name)}/${kebab(page.name)}.page')
      .then(m => m.${page.name.replace(/\s+/g, '')}Page)
}`;
}).join(',\n');

const routesContent = `
import { Routes } from '@angular/router';

export const routes: Routes = [
${routes},
{
  path: '',
  redirectTo: '${kebab(schema.pages[0].name)}',
  pathMatch: 'full'
}
];
`.trim();

fs.writeFileSync('./angular/app.routes.ts', routesContent);

console.log('✅ Angular pages and routes generated');
