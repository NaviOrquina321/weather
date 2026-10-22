const fs = require('fs');
const path = require('path');
const https = require('https');

const DATA_URL = "https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/json/countries%2Bstates%2Bcities.json";
const OUTPUT_PATH = path.join(__dirname, '../data/world.json');

console.log("Fetching country-state-city database from dr5hn repository...");

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch ${url}, status: ${res.statusCode}`));
      }
      let rawData = '';
      res.on('data', chunk => rawData += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(rawData));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function build() {
  try {
    const rawData = await fetchUrl(DATA_URL);
    console.log(`Downloaded raw data for ${rawData.length} countries.`);

    // Data format: world = [[code, name, regions], ...]
    // regions = [[regionName, cities], ...]
    // cities = [[cityName, lat, lon], ...]
    const world = [];

    for (const country of rawData) {
      const code = country.iso2 || country.iso3 || "";
      const name = country.name || "";
      const states = country.states || [];

      const regions = [];

      for (const state of states) {
        const regionName = state.name || "General Region";
        const rawCities = state.cities || [];

        const cities = [];
        for (const city of rawCities) {
          const cityName = city.name;
          const lat = parseFloat(city.latitude);
          const lon = parseFloat(city.longitude);

          if (cityName && !isNaN(lat) && !isNaN(lon)) {
            cities.push([cityName, lat, lon]);
          }
        }

        if (cities.length > 0) {
          regions.push([regionName, cities]);
        }
      }

      if (regions.length > 0) {
        world.push([code, name, regions]);
      }
    }

    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(world));
    console.log(`Successfully generated ${OUTPUT_PATH} (${(fs.statSync(OUTPUT_PATH).size / (1024 * 1024)).toFixed(2)} MB)`);
  } catch (err) {
    console.error("Error building world.json:", err);
    process.exit(1);
  }
}

build();
