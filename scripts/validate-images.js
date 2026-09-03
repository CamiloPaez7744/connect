const fs = require('fs');
const path = require('path');

// Check assets/images
const assetsDir = path.join(__dirname, '..', 'assets', 'images');
const assetFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.png')).sort();
console.log(`assets/images: ${assetFiles.length} PNGs (${assetFiles[0]} to ${assetFiles[assetFiles.length-1]})`);

// Check imageMap entries
const mapContent = fs.readFileSync(path.join(__dirname, '..', 'src', 'imageMap.ts'), 'utf8');
const mapEntries = [...mapContent.matchAll(/'(\d+)':/g)].map(m => m[1]);
console.log(`imageMap entries: ${mapEntries.length} (${mapEntries[0]} to ${mapEntries[mapEntries.length-1]})`);

// Verify every imageMap entry has a file
let errors = 0;
for (const key of mapEntries) {
  const filePath = path.join(assetsDir, `${key}.png`);
  if (!fs.existsSync(filePath)) {
    console.error(`MISSING FILE: assets/images/${key}.png (referenced in imageMap)`);
    errors++;
  }
}
// Verify every file has an imageMap entry
for (const file of assetFiles) {
  const key = file.replace('.png', '');
  if (!mapEntries.includes(key)) {
    console.error(`MISSING MAP ENTRY: ${file} exists but not in imageMap`);
    errors++;
  }
}

// Check positions.json
const positions = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'positions.json'), 'utf8'));
console.log(`positions.json: ${positions.length} positions (IDs 1-${positions.length})`);

// Verify all position IDs have images
let missingImages = 0;
for (let i = 1; i <= positions.length; i++) {
  const key = String(i).padStart(3, '0');
  if (!fs.existsSync(path.join(assetsDir, `${key}.png`))) {
    console.error(`MISSING IMAGE for position ID ${i}`);
    missingImages++;
  }
}

// Check data files
const questions = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'questions.json'), 'utf8'));
const dares = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'dares.json'), 'utf8'));
const senses = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'senses.json'), 'utf8'));
console.log(`questions.json: ${questions.length} questions`);
console.log(`dares.json: ${dares.length} dares`);
console.log(`senses.json: ${senses.length} senses`);

// Check imports in components
const positionsTsx = fs.readFileSync(path.join(__dirname, '..', 'app', '(tabs)', 'positions.tsx'), 'utf8');
const hasImageMapImport = positionsTsx.includes("import { imageMap } from '../../src/imageMap'");
const hasGetImageSource = positionsTsx.includes('function getImageSource');
const noMoreUriImages = !positionsTsx.includes('uri: `/images/');
console.log(`positions.tsx: import=${hasImageMapImport}, helper=${hasGetImageSource}, noUri=${noMoreUriImages}`);

const cardStack = fs.readFileSync(path.join(__dirname, '..', 'src', 'components', 'CardStack.tsx'), 'utf8');
const hasCardStackImport = cardStack.includes("import { imageMap } from '../imageMap'");
const hasPlatformCheck = cardStack.includes('Platform.OS');
console.log(`CardStack.tsx: import=${hasCardStackImport}, platformCheck=${hasPlatformCheck}`);

const evervault = fs.readFileSync(path.join(__dirname, '..', 'src', 'components', 'EvervaultCard.tsx'), 'utf8');
const hasEvervaultImport = evervault.includes("import { imageMap } from '../imageMap'");
console.log(`EvervaultCard.tsx: import=${hasEvervaultImport}`);

if (errors === 0 && missingImages === 0) {
  console.log('\n✅ ALL CHECKS PASSED');
} else {
  console.log(`\n❌ ${errors + missingImages} ERRORS FOUND`);
  process.exit(1);
}
