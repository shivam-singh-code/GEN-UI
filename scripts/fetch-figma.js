// scripts/fetch-figma.js
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({path: '../.env'});

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const FIGMA_FILE_URL = process.env.FIGMA_FILE_URL;

if (!FIGMA_TOKEN || !FIGMA_FILE_URL) {
  throw new Error('Missing FIGMA_TOKEN or FIGMA_FILE_URL');
}

// Extract FILE_KEY
function extractFileKey(url) {
  const match = url.match(/figma\.com\/(file|design)\/([^/]+)/);
  if (!match) {
    throw new Error('Invalid Figma file URL');
  }
  return match[2];
}

const FILE_KEY = extractFileKey(FIGMA_FILE_URL);

async function fetchFigmaFile() {
  const response = await fetch(
    `https://api.figma.com/v1/files/${FILE_KEY}`,
    {
      headers: {
        'X-Figma-Token': `${FIGMA_TOKEN}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.status}`);
  }

  const data = await response.json();

  fs.mkdirSync('./output', { recursive: true });
  fs.writeFileSync(
    './output/figma-raw.json',
    JSON.stringify(data, null, 2)
  );

  console.log('✅ Figma file fetched successfully');
  console.log(`📄 Saved to output/figma-raw.json`);
}

fetchFigmaFile().catch(console.error);
