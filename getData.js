import fs from 'fs';

const bases = [
  'https://llmdemos.hyperpg.site/backend-hypery-1',
  'https://llmdemos.hyperpg.site/backend-hypery-2',
  'https://llmdemos.hyperpg.site/backend-hypery-3',
  'https://llmdemos.hyperpg.site/backend-hypery-4',
  'https://llmdemos.hyperpg.site/backend-hypery-5',
  'https://llmdemos.hyperpg.site/backend-hypery-6',
  'https://llmdemos.hyperpg.site/backend-hypery-7'
];

const endpoints = [
  '/logs?limit=500&skip=0',
  '/royalties'
];

async function fetchEndpoints() {
  const results = [];
  for (const base of bases) {
    const entry = { base, responses: {} };
    for (const endpoint of endpoints) {
      try {
        const url = `${base}${endpoint}`;
        const res = await fetch(url);
        const data = await res.json();
        entry.responses[endpoint] = data;
      } catch (err) {
        entry.responses[endpoint] = { error: err.message };
      }
    }
    results.push(entry);
  }
  fs.writeFileSync('resultados.json', JSON.stringify(results, null, 2));
  console.log('Resultados guardados en resultados.json');
}

fetchEndpoints();