const fs = require('fs');
const https = require('https');
const path = require('path');

const DATA_URL = 'https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/json/countries+states+cities.json';
const OUTPUT_PATH = path.join(__dirname, '../data/world.json');
const JS_OUTPUT_PATH = path.join(__dirname, '../data/world.js');

console.log('Downloading countries, states, and cities dataset...');

https.get(DATA_URL, (res) => {
  let rawData = '';
  res.setEncoding('utf8');

  res.on('data', (chunk) => {
    rawData += chunk;
  });

  res.on('end', () => {
    try {
      console.log('Download complete. Parsing dataset...');
      const fullData = JSON.parse(rawData);

      // Multi-dimensional array structure:
      // world = [ countryRow, ... ]
      // countryRow = [ code, countryName, regionsArray ]
      // regionsArray = [ regionRow, ... ]
      // regionRow = [ regionName, citiesArray ]
      // citiesArray = [ cityRow, ... ]
      // cityRow = [ cityName, latNumber, lonNumber ]

      const world = [];

      fullData.forEach((c) => {
        const code = c.iso2 || c.iso3 || 'XX';
        const countryName = c.name;
        const states = c.states || [];

        const regions = [];

        states.forEach((s) => {
          const regionName = s.name;
          const citiesRaw = s.cities || [];

          const cities = [];
          citiesRaw.forEach((ct) => {
            const cityName = ct.name;
            const lat = ct.latitude ? parseFloat(parseFloat(ct.latitude).toFixed(2)) : 0;
            const lon = ct.longitude ? parseFloat(parseFloat(ct.longitude).toFixed(2)) : 0;
            cities.push([cityName, lat, lon]);
          });

          // Only add region if it has cities, or keep it if desired
          if (cities.length > 0) {
            regions.push([regionName, cities]);
          }
        });

        if (regions.length > 0) {
          world.push([code, countryName, regions]);
        }
      });

      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(world));
      fs.writeFileSync(JS_OUTPUT_PATH, `window.WORLD_DATA = ${JSON.stringify(world)};`);
      console.log(`Successfully generated multi-dimensional world.json and world.js datasets!`);
      console.log(`Total countries processed: ${world.length}`);
    } catch (e) {
      console.error('Error processing dataset:', e.message);
      process.exit(1);
    }
  });
}).on('error', (e) => {
  console.error(`Error downloading dataset: ${e.message}`);
  process.exit(1);
});
