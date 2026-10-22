# SkyCast - Ultimate Weather Forecast Dashboard

SkyCast is a modern, responsive web application for hyper-local meteorological forecasting powered by open science APIs (Open-Meteo).

---

## Features

1. **Location Settings & Coordinate Search:** Preset dropdown city selection and manual latitude/longitude input.
2. **24-Hour Temperature Curve Chart:** High-definition Chart.js temperature curve with interactive tooltips.
3. **7-Day General Forecast Grid:** Synchronized multi-day forecast cards allowing users to view hourly projections for any day.
4. **Geographic Forecast Access ("Browse by Country"):**
   - **3-Level Accordion:** Worldwide hierarchical dataset structured as Country → Province/Region → City.
   - **Default Location:** Opens with Philippines → South Cotabato → City of Koronadal expanded and loaded.
   - **Search Filtering:** 150ms debounced search matching countries, provinces/regions, or cities with auto-expansion and result capping (top 12 countries, 15 regions/country, 8 cities/region).
   - **Pagination:** Handles large provinces with over 100 cities via "Show 100 more of N" pagination buttons.
   - **Accessibility:** Uses standard HTML `<button type="button">` elements, `aria-expanded` and `aria-hidden` attributes, `:focus-visible` outlines (`2px solid #8b84ff`), and minimum 44px touch targets.
   - **Safe Rendering:** Built using vanilla JavaScript with `DocumentFragment` and `textContent` DOM nodes to prevent XSS.

---

## Data Architecture (`data/world.json`)

The Geographic Forecast Access feature utilizes a compact, multi-dimensional nested array format:

```javascript
world = [
  [countryCode, countryName, [
    [regionName, [
      [cityName, latitude, longitude],
      ...
    ]],
    ...
  ]],
  ...
]
```

### Indexed Array Constants
- **Country:** `COUNTRY_CODE = 0`, `COUNTRY_NAME = 1`, `COUNTRY_REGIONS = 2`
- **Region:** `REGION_NAME = 0`, `REGION_CITIES = 1`
- **City:** `CITY_NAME = 0`, `CITY_LAT = 1`, `CITY_LON = 2`, `CITY_SEARCH = 3` *(appended in memory on load)*

---

## Local Server Requirement

To run SkyCast locally, you **must** serve the files using a local HTTP web server (such as Python's built-in HTTP server or Node `http-server`). Modern browsers block `fetch()` requests for local JSON files (`data/world.json`) when opened via the `file://` protocol.

### Running SkyCast Locally:
```bash
# Using Python 3
python3 -m http.server 3000

# Or using Node http-server
npx http-server -p 3000
```
Then open your browser to `http://localhost:3000`.

---

## Dataset Regeneration

If you need to regenerate `data/world.json` from the source repository:

```bash
node scripts/build-world.js
```

### Dataset Attribution
World geographical data provided by [dr5hn/countries-states-cities-database](https://github.com/dr5hn/countries-states-cities-database).
