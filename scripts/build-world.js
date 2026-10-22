const fs = require('fs');
const path = require('path');
const https = require('https');

const RAW_URL = 'https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/json/countries%2Bstates%2Bcities.json';
const OUTPUT_FILE = path.join(__dirname, '../data/world.json');

function parseCoord(val) {
  if (val === null || val === undefined || val === '') return null;
  const num = parseFloat(val);
  if (isNaN(num)) return null;
  return Math.round(num * 100) / 100;
}

function fetchData(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`HTTP status code ${res.statusCode}`));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('Fetching raw dataset from GitHub...');
  let rawCountries;
  try {
    rawCountries = await fetchData(RAW_URL);
    console.log(`Downloaded ${rawCountries.length} raw country records.`);
  } catch (err) {
    console.error('Failed to download dataset:', err);
    process.exit(1);
  }

  const result = [];

  for (const c of rawCountries) {
    const cName = (c.name || '').trim();
    const cIso2 = (c.iso2 || '').trim();
    if (!cName) continue;

    const cLat = parseCoord(c.latitude);
    const cLon = parseCoord(c.longitude);

    let provincesList = [];

    const rawStates = Array.isArray(c.states) ? c.states : [];

    for (const s of rawStates) {
      const sName = (s.name || '').trim();
      if (!sName) continue;

      const sLat = parseCoord(s.latitude) ?? cLat;
      const sLon = parseCoord(s.longitude) ?? cLon;

      let citiesList = [];
      const rawCities = Array.isArray(s.cities) ? s.cities : [];

      for (const ci of rawCities) {
        const ciName = (ci.name || '').trim();
        if (!ciName) continue;
        const ciLat = parseCoord(ci.latitude) ?? sLat;
        const ciLon = parseCoord(ci.longitude) ?? sLon;

        if (ciLat !== null && ciLon !== null) {
          citiesList.push([ciName, ciLat, ciLon]);
        }
      }

      // If province has no valid cities, use province itself as one city entry
      if (citiesList.length === 0) {
        if (sLat !== null && sLon !== null) {
          citiesList.push([sName, sLat, sLon]);
        }
      }

      if (citiesList.length > 0) {
        // Sort cities alphabetically
        citiesList.sort((a, b) => a[0].localeCompare(b[0]));
        provincesList.push([sName, citiesList]);
      }
    }

    // If country has no valid provinces, use country itself as one province and city entry
    if (provincesList.length === 0) {
      if (cLat !== null && cLon !== null) {
        provincesList.push([cName, [[cName, cLat, cLon]]]);
      }
    }

    if (provincesList.length > 0) {
      // Sort provinces alphabetically
      provincesList.sort((a, b) => a[0].localeCompare(b[0]));
      result.push([cIso2, cName, provincesList]);
    }
  }

  // Sort countries alphabetically
  result.sort((a, b) => a[1].localeCompare(b[1]));

  console.log(`Writing processed world data (${result.length} countries) to ${OUTPUT_FILE}...`);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result));

  const stats = fs.statSync(OUTPUT_FILE);
  console.log(`Done! Output file size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
}

main();
