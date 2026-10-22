(() => {
  // Data format index constants
  const COUNTRY_CODE = 0;
  const COUNTRY_NAME = 1;
  const COUNTRY_REGIONS = 2;

  const REGION_NAME = 0;
  const REGION_CITIES = 1;

  const CITY_NAME = 0;
  const CITY_LAT = 1;
  const CITY_LON = 2;
  const CITY_SEARCH = 3;

  let world = [];

  // Single state object as specified
  const state = {
    ready: false,
    failed: false,
    openCountry: -1,
    openRegion: "", // format "k|j"
    sel: null,      // { k, j, c } indexes into world
    q: "",
    shown: {}       // regionId -> number of cities shown
  };

  let searchTimeout = null;

  // Helper to create SVG chevron element
  function createChevronSVG(size, isOpen) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "cb-chevron" + (isOpen ? " cb-open" : ""));
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("width", size);
    svg.setAttribute("height", size);
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M6 3l5 5-5 5");
    svg.appendChild(path);

    return svg;
  }

  // Helper to format coordinates label
  function formatCoords(lat, lon) {
    const latStr = Number(lat).toFixed(2);
    const lonStr = Number(lon).toFixed(2);
    return `Lat ${latStr}  Lon ${lonStr}`;
  }

  // Core functions
  async function init() {
    try {
      const res = await fetch("data/world.json");
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      world = await res.json();

      // Append lowercased CITY_SEARCH index for each city
      for (let k = 0; k < world.length; k++) {
        const country = world[k];
        const regions = country[COUNTRY_REGIONS] || [];
        for (let j = 0; j < regions.length; j++) {
          const region = regions[j];
          const cities = region[REGION_CITIES] || [];
          for (let c = 0; c < cities.length; c++) {
            const city = cities[c];
            city[CITY_SEARCH] = (city[CITY_NAME] || "").toLowerCase();
          }
        }
      }

      state.ready = true;
      selectDefault();
    } catch (err) {
      console.error("Failed to load world data:", err);
      state.failed = true;
      render();
    }
  }

  function selectDefault() {
    let targetK = -1;
    let targetJ = -1;
    let targetC = -1;

    // Search for country code "PH", region "South Cotabato", city "City of Koronadal"
    for (let k = 0; k < world.length; k++) {
      if (world[k][COUNTRY_CODE] === "PH") {
        targetK = k;
        const regions = world[k][COUNTRY_REGIONS] || [];
        for (let j = 0; j < regions.length; j++) {
          if (regions[j][REGION_NAME] === "South Cotabato") {
            targetJ = j;
            const cities = regions[j][REGION_CITIES] || [];
            for (let c = 0; c < cities.length; c++) {
              if (cities[c][CITY_NAME] === "City of Koronadal") {
                targetC = c;
                break;
              }
            }
            if (targetC === -1 && cities.length > 0) {
              targetC = 0; // Fallback: first city of that region
            }
            break;
          }
        }
        if (targetJ === -1 && regions.length > 0) {
          targetJ = 0;
          if (regions[0][REGION_CITIES] && regions[0][REGION_CITIES].length > 0) {
            targetC = 0;
          }
        }
        break;
      }
    }

    if (targetK !== -1 && targetJ !== -1 && targetC !== -1) {
      state.openCountry = targetK;
      state.openRegion = `${targetK}|${targetJ}`;
      const sel = { k: targetK, j: targetJ, c: targetC };
      selectCity(sel, true);
    } else {
      render();
    }
  }

  function selectCity(sel, load) {
    state.sel = sel;
    const country = world[sel.k];
    const region = country[COUNTRY_REGIONS][sel.j];
    const city = region[REGION_CITIES][sel.c];

    const cityName = city[CITY_NAME];
    const regionName = region[REGION_NAME];
    const countryName = country[COUNTRY_NAME];
    const lat = city[CITY_LAT];
    const lon = city[CITY_LON];

    // Update Summary Card
    const elSummaryLabel = document.getElementById("cb-summary-label");
    const elSummaryCoords = document.getElementById("cb-summary-coords");

    if (elSummaryLabel) {
      elSummaryLabel.textContent = `${cityName}, ${regionName}, ${countryName}`;
    }
    if (elSummaryCoords) {
      elSummaryCoords.textContent = formatCoords(lat, lon);
    }

    render();

    if (load && typeof window.loadWeather === "function") {
      window.loadWeather(lat, lon, `${cityName}, ${countryName}`);
    }
  }

  function buildView() {
    const q = state.q.trim().toLowerCase();
    const isSearching = q.length >= 2;

    if (!isSearching) {
      // Normal Accordion View
      const countryViews = [];
      for (let k = 0; k < world.length; k++) {
        const country = world[k];
        const isOpen = (k === state.openCountry);
        const regions = country[COUNTRY_REGIONS] || [];

        const regionViews = [];
        if (isOpen) {
          for (let j = 0; j < regions.length; j++) {
            const region = regions[j];
            const regionId = `${k}|${j}`;
            const isRegionOpen = (regionId === state.openRegion);
            const cities = region[REGION_CITIES] || [];

            const cityViews = [];
            let remaining = 0;

            if (isRegionOpen) {
              const limit = state.shown[regionId] || 100;
              const count = Math.min(cities.length, limit);
              for (let c = 0; c < count; c++) {
                cityViews.push({ city: cities[c], origC: c });
              }
              remaining = cities.length - count;
            }

            regionViews.push({
              j,
              name: region[REGION_NAME],
              cityCount: cities.length,
              isOpen: isRegionOpen,
              cities: cityViews,
              remaining,
              regionId
            });
          }
        }

        countryViews.push({
          k,
          code: country[COUNTRY_CODE],
          name: country[COUNTRY_NAME],
          regionCount: regions.length,
          isOpen,
          regions: regionViews
        });
      }

      return { isSearching: false, capped: false, countries: countryViews };
    }

    // Search View with Filtering and Capping
    let capped = false;
    const countryViews = [];

    for (let k = 0; k < world.length; k++) {
      if (countryViews.length >= 12) {
        capped = true;
        break;
      }

      const country = world[k];
      const countryName = country[COUNTRY_NAME];
      const countryHit = countryName.toLowerCase().includes(q);
      const regions = country[COUNTRY_REGIONS] || [];

      const regionViews = [];

      for (let j = 0; j < regions.length; j++) {
        if (regionViews.length >= 15) {
          capped = true;
          break;
        }

        const region = regions[j];
        const regionName = region[REGION_NAME];
        const regionHit = countryHit || regionName.toLowerCase().includes(q);
        const cities = region[REGION_CITIES] || [];

        const matchingCities = [];
        for (let c = 0; c < cities.length; c++) {
          const city = cities[c];
          if (regionHit || city[CITY_SEARCH].includes(q)) {
            matchingCities.push({ city, origC: c });
          }
        }

        if (matchingCities.length === 0) continue;

        if (matchingCities.length > 8) {
          capped = true;
        }

        const displayedCities = matchingCities.slice(0, 8);

        regionViews.push({
          j,
          name: regionName,
          matchCount: matchingCities.length,
          isOpen: true,
          cities: displayedCities,
          remaining: 0,
          regionId: `${k}|${j}`
        });
      }

      if (regionViews.length === 0) continue;

      countryViews.push({
        k,
        code: country[COUNTRY_CODE],
        name: countryName,
        matchCount: regionViews.length,
        isOpen: true,
        regions: regionViews
      });
    }

    return { isSearching: true, capped, countries: countryViews };
  }

  function render() {
    const elList = document.getElementById("cb-list");
    if (!elList) return;

    elList.innerHTML = "";
    const frag = document.createDocumentFragment();

    if (!state.ready && !state.failed) {
      const msg = document.createElement("div");
      msg.className = "cb-message";
      msg.textContent = "Loading the world map data...";
      frag.appendChild(msg);
      elList.appendChild(frag);
      return;
    }

    if (state.failed) {
      const msg = document.createElement("div");
      msg.className = "cb-message cb-message-error";
      msg.textContent = "Could not load the location data. Please reopen this page.";
      frag.appendChild(msg);
      elList.appendChild(frag);
      return;
    }

    const view = buildView();

    if (view.countries.length === 0) {
      const msg = document.createElement("div");
      msg.className = "cb-message";
      msg.textContent = "No matching country, province or city.";
      frag.appendChild(msg);
      elList.appendChild(frag);
      return;
    }

    if (view.capped) {
      const note = document.createElement("div");
      note.className = "cb-capped-note";
      note.textContent = "Showing the top matches. Keep typing to narrow it down.";
      frag.appendChild(note);
    }

    for (let cIdx = 0; cIdx < view.countries.length; cIdx++) {
      const cView = view.countries[cIdx];
      const countryCard = document.createElement("div");
      countryCard.className = "cb-country-card";

      // Country Button Row
      const countryBtn = document.createElement("button");
      countryBtn.type = "button";
      countryBtn.className = "cb-country-btn";
      countryBtn.setAttribute("data-action", "country");
      countryBtn.setAttribute("data-k", cView.k);
      countryBtn.setAttribute("aria-expanded", cView.isOpen ? "true" : "false");

      const codeChip = document.createElement("span");
      codeChip.className = "cb-code-chip";
      codeChip.textContent = cView.code;
      countryBtn.appendChild(codeChip);

      const nameSpan = document.createElement("span");
      nameSpan.className = "cb-country-name";
      nameSpan.textContent = cView.name;
      countryBtn.appendChild(nameSpan);

      const countSpan = document.createElement("span");
      countSpan.className = "cb-count-text";
      const countVal = view.isSearching ? cView.matchCount : cView.regionCount;
      countSpan.textContent = `${countVal} ${countVal === 1 ? "region" : "regions"}`;
      countryBtn.appendChild(countSpan);

      countryBtn.appendChild(createChevronSVG(16, cView.isOpen));
      countryCard.appendChild(countryBtn);

      // Country Body
      if (cView.isOpen && cView.regions.length > 0) {
        const countryBody = document.createElement("div");
        countryBody.className = "cb-country-body";

        for (let rIdx = 0; rIdx < cView.regions.length; rIdx++) {
          const rView = cView.regions[rIdx];

          const regionBtn = document.createElement("button");
          regionBtn.type = "button";
          regionBtn.className = "cb-region-btn" + (rView.isOpen ? " cb-region-open" : "");
          regionBtn.setAttribute("data-action", "region");
          regionBtn.setAttribute("data-k", cView.k);
          regionBtn.setAttribute("data-j", rView.j);
          regionBtn.setAttribute("aria-expanded", rView.isOpen ? "true" : "false");

          const regNameSpan = document.createElement("span");
          regNameSpan.className = "cb-region-name";
          regNameSpan.textContent = rView.name;
          regionBtn.appendChild(regNameSpan);

          const regCountSpan = document.createElement("span");
          regCountSpan.className = "cb-count-text";
          const regCountVal = view.isSearching ? rView.matchCount : rView.cityCount;
          regCountSpan.textContent = `${regCountVal} ${regCountVal === 1 ? "city" : "cities"}`;
          regionBtn.appendChild(regCountSpan);

          regionBtn.appendChild(createChevronSVG(14, rView.isOpen));
          countryBody.appendChild(regionBtn);

          // City List inside Region
          if (rView.isOpen && rView.cities.length > 0) {
            const cityList = document.createElement("div");
            cityList.className = "cb-city-list";

            for (let ctIdx = 0; ctIdx < rView.cities.length; ctIdx++) {
              const ctView = rView.cities[ctIdx];
              const cityData = ctView.city;
              const isSelected = state.sel &&
                state.sel.k === cView.k &&
                state.sel.j === rView.j &&
                state.sel.c === ctView.origC;

              const cityBtn = document.createElement("button");
              cityBtn.type = "button";
              cityBtn.className = "cb-city-btn" + (isSelected ? " cb-selected" : "");
              cityBtn.setAttribute("data-action", "city");
              cityBtn.setAttribute("data-k", cView.k);
              cityBtn.setAttribute("data-j", rView.j);
              cityBtn.setAttribute("data-c", ctView.origC);

              const cityNameSpan = document.createElement("span");
              cityNameSpan.className = "cb-city-name";
              cityNameSpan.textContent = cityData[CITY_NAME];
              cityBtn.appendChild(cityNameSpan);

              const cityCoordsSpan = document.createElement("span");
              cityCoordsSpan.className = "cb-city-coords";
              cityCoordsSpan.textContent = `${Number(cityData[CITY_LAT]).toFixed(2)}, ${Number(cityData[CITY_LON]).toFixed(2)}`;
              cityBtn.appendChild(cityCoordsSpan);

              cityList.appendChild(cityBtn);
            }

            // Show More Button
            if (rView.remaining > 0) {
              const moreBtn = document.createElement("button");
              moreBtn.type = "button";
              moreBtn.className = "cb-show-more-btn";
              moreBtn.setAttribute("data-action", "more");
              moreBtn.setAttribute("data-k", cView.k);
              moreBtn.setAttribute("data-j", rView.j);
              const showNum = Math.min(100, rView.remaining);
              moreBtn.textContent = `Show ${showNum} more of ${rView.remaining}`;
              cityList.appendChild(moreBtn);
            }

            countryBody.appendChild(cityList);
          }
        }

        countryCard.appendChild(countryBody);
      }

      frag.appendChild(countryCard);
    }

    elList.appendChild(frag);
  }

  function onListClick(e) {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const action = btn.getAttribute("data-action");
    const k = parseInt(btn.getAttribute("data-k"), 10);
    const j = parseInt(btn.getAttribute("data-j"), 10);
    const c = parseInt(btn.getAttribute("data-c"), 10);

    if (action === "country") {
      if (state.openCountry === k) {
        state.openCountry = -1;
        state.openRegion = "";
      } else {
        state.openCountry = k;
        state.openRegion = "";
      }
      render();
    } else if (action === "region") {
      const regionId = `${k}|${j}`;
      if (state.openRegion === regionId) {
        state.openRegion = "";
      } else {
        state.openRegion = regionId;
      }
      render();
    } else if (action === "city") {
      selectCity({ k, j, c }, true);
    } else if (action === "more") {
      const regionId = `${k}|${j}`;
      state.shown[regionId] = (state.shown[regionId] || 100) + 100;
      render();
    }
  }

  function onSearchInput(e) {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.q = e.target.value;
      render();
    }, 150);
  }

  // Bind Event Listeners when DOM is ready
  window.addEventListener("DOMContentLoaded", () => {
    const elList = document.getElementById("cb-list");
    const elSearch = document.getElementById("cb-search");

    if (elList) {
      elList.addEventListener("click", onListClick);
    }

    if (elSearch) {
      elSearch.addEventListener("input", onSearchInput);
    }

    init();
  });
})();
