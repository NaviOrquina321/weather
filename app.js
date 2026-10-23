// WMO Weather Codes map to descriptions, icons, and background types
const wmoWeatherCodes = {
  0: { label: "Clear sky", icon: "fa-sun", color: "text-amber-400" },
  1: { label: "Mainly clear", icon: "fa-cloud-sun", color: "text-amber-200" },
  2: { label: "Partly cloudy", icon: "fa-cloud-sun", color: "text-slate-300" },
  3: { label: "Overcast", icon: "fa-cloud", color: "text-slate-400" },
  45: { label: "Foggy", icon: "fa-smog", color: "text-slate-400" },
  48: { label: "Depositing rime fog", icon: "fa-smog", color: "text-slate-400" },
  51: { label: "Light drizzle", icon: "fa-cloud-rain", color: "text-blue-300" },
  53: { label: "Moderate drizzle", icon: "fa-cloud-rain", color: "text-blue-400" },
  55: { label: "Dense drizzle", icon: "fa-cloud-rain", color: "text-blue-500" },
  56: { label: "Light freezing drizzle", icon: "fa-cloud-meatball", color: "text-sky-300" },
  57: { label: "Dense freezing drizzle", icon: "fa-cloud-meatball", color: "text-sky-400" },
  61: { label: "Slight rain", icon: "fa-cloud-showers-water", color: "text-blue-300" },
  63: { label: "Moderate rain", icon: "fa-cloud-showers-heavy", color: "text-blue-500" },
  65: { label: "Heavy rain", icon: "fa-cloud-showers-heavy", color: "text-blue-600" },
  66: { label: "Light freezing rain", icon: "fa-cloud-meatball", color: "text-sky-300" },
  67: { label: "Heavy freezing rain", icon: "fa-cloud-meatball", color: "text-sky-500" },
  71: { label: "Slight snow fall", icon: "fa-snowflake", color: "text-sky-200" },
  73: { label: "Moderate snow fall", icon: "fa-snowflake", color: "text-sky-300" },
  75: { label: "Heavy snow fall", icon: "fa-snowflake", color: "text-sky-400" },
  77: { label: "Snow grains", icon: "fa-snowflake", color: "text-sky-100" },
  80: { label: "Slight rain showers", icon: "fa-cloud-sun-rain", color: "text-blue-400" },
  81: { label: "Moderate rain showers", icon: "fa-cloud-showers-heavy", color: "text-blue-500" },
  82: { label: "Violent rain showers", icon: "fa-cloud-showers-heavy", color: "text-blue-700 animate-pulse" },
  85: { label: "Slight snow showers", icon: "fa-snowflake", color: "text-sky-200" },
  86: { label: "Heavy snow showers", icon: "fa-snowflake", color: "text-sky-400 animate-pulse" },
  95: { label: "Thunderstorm", icon: "fa-cloud-bolt", color: "text-yellow-400" },
  96: { label: "Thunderstorm with slight hail", icon: "fa-cloud-bolt", color: "text-yellow-500" },
  99: { label: "Thunderstorm with heavy hail", icon: "fa-cloud-bolt", color: "text-red-400 animate-bounce" }
};

function getWMOInfo(code) {
  return wmoWeatherCodes[code] || { label: `Unknown code (${code})`, icon: "fa-circle-question", color: "text-slate-400" };
}

// Global Application State
let currentUnit = 'C'; // 'C' or 'F'
let weatherData = null;
let hourlyChartInstance = null;
let selectedDayIndex = 0; // 0 to 6 representing forecast days

// Multi-dimensional 2D array grid storage for forecast hourly metrics (7 days x 24 hours)
let hourlyByDay = [];
let timesByDay = [];

// Hierarchical Multi-Dimensional Array Dataset for World Locations:
// worldLocations = [ countryRow, ... ]
// countryRow = [ code, countryName, regionsArray ]
// regionsArray = [ regionRow, ... ]
// regionRow = [ regionName, citiesArray ]
// citiesArray = [ cityRow, ... ]
// cityRow = [ cityName, latNumber, lonNumber ]
let worldLocations = [];
let activeLocationLabel = "Berlin, Germany";
let expandedCountries = new Set();
let expandedRegions = new Set();
let selectedLocationKey = ""; // "c-cIdx" or "r-cIdx-rIdx" or "city-cIdx-rIdx-cityIdx"

// Converts a flat array of 168 elements into a 7x24 2D grid array
function buildDayGrid(flatList) {
  const grid = [];
  if (!flatList || flatList.length === 0) return grid;
  for (let d = 0; d < 7; d++) {
    const dayRow = [];
    for (let h = 0; h < 24; h++) {
      const index = d * 24 + h;
      dayRow.push(flatList[index]);
    }
    grid.push(dayRow);
  }
  return grid;
}

// Convert Celsius to Fahrenheit
function cToF(c) {
  return (c * 9/5) + 32;
}

// Format temperature value based on current selected unit
function formatTemp(value) {
  if (value === null || value === undefined || isNaN(value)) return '--';
  const displayVal = currentUnit === 'C' ? value : cToF(value);
  return `${displayVal.toFixed(1)}°${currentUnit}`;
}

// Elements
const elLatInput = document.getElementById('lat-input');
const elLonInput = document.getElementById('lon-input');
const elFetchBtn = document.getElementById('fetch-btn');

// Search / Filter Elements
const elSearchInput = document.getElementById('search-input');
const elSearchBtn = document.getElementById('search-btn');
const elLocationAccordion = document.getElementById('location-accordion');

// Active selection card elements
const elActiveSelectionTitle = document.getElementById('active-selection-title');
const elActiveSelectionLat = document.getElementById('active-selection-lat');
const elActiveSelectionLon = document.getElementById('active-selection-lon');

// Hero Elements
const elHeroCity = document.getElementById('hero-city');
const elHeroCoords = document.getElementById('hero-coords');
const elHourlyChartTitle = document.getElementById('hourly-chart-title');

const elToggleC = document.getElementById('toggle-c');
const elToggleF = document.getElementById('toggle-f');

const elErrorBanner = document.getElementById('error-banner');
const elErrorMessage = document.getElementById('error-message');
const elLoadingSpinner = document.getElementById('loading-spinner');
const elWeatherDashboard = document.getElementById('weather-dashboard');

// Dashboard metrics elements
const elCityLabel = document.getElementById('weather-city-label');
const elCurrentTime = document.getElementById('weather-current-time');
const elCurrentWeatherIcon = document.getElementById('current-weather-icon');
const elBgWeatherIcon = document.getElementById('bg-weather-icon');
const elCurrentTemp = document.getElementById('current-temp');
const elCurrentUnit = document.getElementById('current-unit');
const elCurrentWeatherDesc = document.getElementById('current-weather-desc');
const elCurrentLat = document.getElementById('current-lat');
const elCurrentLon = document.getElementById('current-lon');

// Highlight stats elements
const elStatTempRange = document.getElementById('stat-temp-range');
const elStatWmoCode = document.getElementById('stat-wmo-code');
const elStatWmoLabel = document.getElementById('stat-wmo-label');
const elStatHourlyPeak = document.getElementById('stat-hourly-peak');
const elStatHourlyLow = document.getElementById('stat-hourly-low');

// Daily Forecast grid
const elDailyForecastContainer = document.getElementById('daily-forecast-container');

// Change Unit Event Handlers
elToggleC.addEventListener('click', () => {
  if (currentUnit === 'C') return;
  currentUnit = 'C';
  updateUnitToggleUI();
  if (weatherData) renderWeatherDashboard();
});

elToggleF.addEventListener('click', () => {
  if (currentUnit === 'F') return;
  currentUnit = 'F';
  updateUnitToggleUI();
  if (weatherData) renderWeatherDashboard();
});

function updateUnitToggleUI() {
  if (currentUnit === 'C') {
    elToggleC.className = "px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 bg-indigo-600 text-white shadow-md shadow-indigo-500/20";
    elToggleF.className = "px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 text-slate-400 hover:text-slate-200";
  } else {
    elToggleF.className = "px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 bg-indigo-600 text-white shadow-md shadow-indigo-500/20";
    elToggleC.className = "px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 text-slate-400 hover:text-slate-200";
  }
}

// Fetch Forecast Core Logic
async function fetchForecast(lat, lon, label = null) {
  showLoading(true);
  showError(null);

  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code&hourly=temperature_2m&current=temperature_2m,weather_code&timezone=auto`);
    if (!response.ok) {
      throw new Error(`Open-Meteo returned status ${response.status}`);
    }
    weatherData = await response.json();

    if (label) {
      activeLocationLabel = label;
    }

    // Convert 168-item flat hourly arrays into 7x24 2D grid multi-dimensional arrays
    if (weatherData.hourly && weatherData.hourly.temperature_2m) {
      hourlyByDay = buildDayGrid(weatherData.hourly.temperature_2m);
    }
    if (weatherData.hourly && weatherData.hourly.time) {
      timesByDay = buildDayGrid(weatherData.hourly.time);
    }
    selectedDayIndex = 0; // Reset to Today for the new location
    renderWeatherDashboard();
  } catch (error) {
    console.error(error);
    showError(error.message || "Failed to load weather forecast data. Please check your internet connection.");
  } finally {
    showLoading(false);
  }
}

// Expose loadWeather globally for modular triggers
window.loadWeather = function(lat, lon, label) {
  fetchForecast(lat, lon, label);
};

function showLoading(isLoading) {
  if (isLoading) {
    elLoadingSpinner.classList.remove('hidden');
    elWeatherDashboard.classList.add('hidden');
  } else {
    elLoadingSpinner.classList.add('hidden');
    elWeatherDashboard.classList.remove('hidden');
  }
}

function showError(msg) {
  if (msg) {
    elErrorMessage.textContent = msg;
    elErrorBanner.classList.remove('hidden');
  } else {
    elErrorBanner.classList.add('hidden');
  }
}

// Populate / Render Dashboard UI with data
function renderWeatherDashboard() {
  if (!weatherData) return;

  const current = weatherData.current;
  const hourly = weatherData.hourly;
  const daily = weatherData.daily;

  const latVal = weatherData.latitude.toFixed(4);
  const lonVal = weatherData.longitude.toFixed(4);

  const cityName = activeLocationLabel || "Custom Location";

  // Update Main Dashboard & Hero Text
  elCityLabel.textContent = cityName;
  if (elHeroCity) elHeroCity.textContent = cityName;
  if (elHeroCoords) elHeroCoords.textContent = `${latVal}°N, ${lonVal}°E`;

  if (elActiveSelectionTitle) elActiveSelectionTitle.textContent = cityName;
  if (elActiveSelectionLat) elActiveSelectionLat.textContent = `Lat ${latVal}`;
  if (elActiveSelectionLon) elActiveSelectionLon.textContent = `Lon ${lonVal}`;

  // Parse/Format Time directly from local ISO string
  if (current.time) {
    const [datePart, timePart] = current.time.split("T");
    if (datePart && timePart) {
      const [year, month, day] = datePart.split("-").map(Number);
      const [hour, minute] = timePart.split(":").map(Number);
      const dateObj = new Date(Date.UTC(year, month - 1, day, hour, minute));
      const timeStr = dateObj.toLocaleTimeString('en-US', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' });
      const dateStr = dateObj.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' });
      elCurrentTime.textContent = `${timeStr} ${dateStr}`;
    } else {
      const timeDate = new Date(current.time);
      elCurrentTime.textContent = timeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " " + timeDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }

  // Lat and Lon details
  elCurrentLat.textContent = latVal;
  elCurrentLon.textContent = lonVal;

  // Weather code synced with current.weather_code
  const currentWmoCode = current.weather_code !== undefined ? current.weather_code : 0;
  const wmoInfo = getWMOInfo(currentWmoCode);

  elCurrentWeatherIcon.className = `fa-solid ${wmoInfo.icon} ${wmoInfo.color} animate-pulse`;
  elBgWeatherIcon.className = `fa-solid ${wmoInfo.icon}`;

  if (currentUnit === 'C') {
    elCurrentTemp.textContent = current.temperature_2m.toFixed(1);
    elCurrentUnit.textContent = "°C";
  } else {
    elCurrentTemp.textContent = cToF(current.temperature_2m).toFixed(1);
    elCurrentUnit.textContent = "°F";
  }
  elCurrentWeatherDesc.textContent = wmoInfo.label;

  const targetDayStr = daily.time[selectedDayIndex];
  const targetDayDate = new Date(targetDayStr);
  const targetDayLabel = targetDayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const isToday = selectedDayIndex === 0;

  if (elHourlyChartTitle) {
    elHourlyChartTitle.textContent = `${isToday ? "Today's" : targetDayLabel} 24-Hour Temperature Curve`;
  }

  const targetWmoCode = daily.weather_code && daily.weather_code[selectedDayIndex] !== undefined ? daily.weather_code[selectedDayIndex] : 0;
  const targetWmoInfo = getWMOInfo(targetWmoCode);

  const hourlyTemps = hourlyByDay[selectedDayIndex] || [];
  const minHourTemp = Math.min(...hourlyTemps);
  const maxHourTemp = Math.max(...hourlyTemps);

  elStatTempRange.textContent = `${formatTemp(minHourTemp)} / ${formatTemp(maxHourTemp)}`;
  elStatWmoCode.textContent = targetWmoCode;
  elStatWmoLabel.textContent = targetWmoInfo.label;
  elStatHourlyPeak.textContent = formatTemp(maxHourTemp);
  elStatHourlyLow.textContent = formatTemp(minHourTemp);

  renderDailyForecast(daily);
  renderHourlyChart(hourly);
}

function renderDailyForecast(daily) {
  elDailyForecastContainer.innerHTML = '';

  const days = daily.time;
  const wmoCodes = daily.weather_code;

  days.forEach((dayStr, index) => {
    const dayDate = new Date(dayStr);
    const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'short' });
    const formattedDate = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const wmoCode = wmoCodes[index] !== undefined ? wmoCodes[index] : 0;
    const info = getWMOInfo(wmoCode);

    let dailyMin = null;
    let dailyMax = null;

    if (hourlyByDay && hourlyByDay[index]) {
      const dayTemps = hourlyByDay[index];
      if (dayTemps.length > 0) {
        dailyMin = Math.min(...dayTemps);
        dailyMax = Math.max(...dayTemps);
      }
    }

    const card = document.createElement('div');
    const isActive = index === selectedDayIndex;

    if (isActive) {
      card.className = "bg-indigo-650/30 border-2 border-indigo-500 rounded-xl p-4 flex flex-col items-center justify-between text-center gap-2 shadow-lg shadow-indigo-500/20 scale-[1.03] transition-all duration-300 ring-4 ring-indigo-500/10 cursor-default";
    } else {
      card.className = "bg-slate-900/40 border border-slate-800/60 rounded-xl p-4 flex flex-col items-center justify-between text-center gap-2 hover:bg-slate-800/40 hover:-translate-y-1 hover:border-slate-700/80 transition-all duration-300 cursor-pointer";
    }

    card.innerHTML = `
      <div>
        <p class="text-xs font-bold ${isActive ? 'text-indigo-300' : 'text-white'} uppercase">${dayName}</p>
        <p class="text-[10px] text-slate-400 mt-0.5">${formattedDate}</p>
      </div>
      <div class="text-2xl my-2">
        <i class="fa-solid ${info.icon} ${info.color}"></i>
      </div>
      <div class="flex flex-col gap-0.5">
        <span class="text-xs font-semibold text-slate-200">${info.label}</span>
        <span class="text-xs text-indigo-300 font-bold mt-1">${dailyMin !== null ? `${formatTemp(dailyMin)} - ${formatTemp(dailyMax)}` : '--'}</span>
      </div>
    `;

    if (!isActive) {
      card.addEventListener('click', () => {
        selectedDayIndex = index;
        renderWeatherDashboard();
      });
    }

    elDailyForecastContainer.appendChild(card);
  });
}

function renderHourlyChart(hourly) {
  const ctx = document.getElementById('hourlyChart').getContext('2d');

  if (hourlyChartInstance) {
    hourlyChartInstance.destroy();
  }

  const dayTimes = timesByDay[selectedDayIndex] || [];
  const hourlyTimes = dayTimes.map(t => {
    const d = new Date(t);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });

  const rawTemps = hourlyByDay[selectedDayIndex] || [];
  const displayTemps = currentUnit === 'C' ? rawTemps : rawTemps.map(cToF);

  const gradient = ctx.createLinearGradient(0, 0, 0, 250);
  gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
  gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

  hourlyChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: hourlyTimes,
      datasets: [{
        label: `Temperature (°${currentUnit})`,
        data: displayTemps,
        borderColor: '#6366f1',
        borderWidth: 3,
        pointBackgroundColor: '#818cf8',
        pointBorderColor: '#ffffff',
        pointRadius: 5,
        pointHoverRadius: 8,
        pointHitRadius: 15,
        fill: true,
        backgroundColor: gradient,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      onHover: (event, chartElement) => {
        if (event.native && event.native.target) {
          event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleColor: '#ffffff',
          bodyColor: '#e2e8f0',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          padding: 10,
          displayColors: false,
          callbacks: {
            label: function(context) {
              return `Temp: ${context.parsed.y.toFixed(1)}°${currentUnit}`;
            }
          }
        }
      },
      scales: {
        x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8', font: { size: 10 } } },
        y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8', font: { size: 10 }, callback: v => v + `°${currentUnit}` } }
      }
    }
  });

  const canvasEl = document.getElementById('hourlyChart');
  canvasEl.onclick = (evt) => {
    if (!hourlyChartInstance) return;
    const rect = canvasEl.getBoundingClientRect();
    const clickX = evt.clientX - rect.left;
    const points = hourlyChartInstance.getDatasetMeta(0).data;
    if (!points || points.length === 0) return;

    let closestIdx = 0;
    let minDiff = Infinity;
    points.forEach((p, idx) => {
      const diff = Math.abs(p.x - clickX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    if (hourlyByDay[selectedDayIndex] && timesByDay[selectedDayIndex]) {
      const rawTemp = hourlyByDay[selectedDayIndex][closestIdx];
      const rawTime = timesByDay[selectedDayIndex][closestIdx];

      if (rawTemp !== undefined && rawTime) {
        if (currentUnit === 'C') {
          elCurrentTemp.textContent = rawTemp.toFixed(1);
        } else {
          elCurrentTemp.textContent = cToF(rawTemp).toFixed(1);
        }
        const timeDate = new Date(rawTime);
        elCurrentTime.textContent = timeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " " + timeDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    }
  };
}

// ----------------------------------------------------
// Load and Render 3-Level Multi-Dimensional Accordion
// ----------------------------------------------------

async function loadWorldData() {
  try {
    let data = null;

    if (window.WORLD_DATA && Array.isArray(window.WORLD_DATA) && window.WORLD_DATA.length > 0) {
      data = window.WORLD_DATA;
    } else {
      try {
        const res = await fetch('data/world.json');
        if (res.ok) {
          data = await res.json();
        }
      } catch (fetchErr) {
        console.warn("fetch('data/world.json') failed, checking fallback dataset:", fetchErr);
      }
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
      // Emergency Default Fallback Dataset in case both external file imports fail
      data = [
        ["PH", "Philippines", [
          ["National Capital Region", [
            ["Manila", 14.60, 120.98],
            ["Quezon City", 14.65, 121.05],
            ["Makati", 14.55, 121.02],
            ["Taguig", 14.52, 121.05]
          ]],
          ["Cebu", [
            ["Cebu City", 10.31, 123.89],
            ["Mandaue", 10.33, 123.94],
            ["Lapu-Lapu City", 10.31, 123.95]
          ]],
          ["South Cotabato", [
            ["City of Koronadal", 6.49, 124.89],
            ["Banga", 6.45, 124.76],
            ["General Santos", 6.12, 125.17]
          ]]
        ]],
        ["DE", "Germany", [
          ["Berlin", [["Berlin", 52.52, 13.41]]],
          ["Bavaria", [["Munich", 48.14, 11.58], ["Nuremberg", 49.45, 11.08]]],
          ["Hamburg", [["Hamburg", 53.55, 9.99]]]
        ]],
        ["US", "United States", [
          ["California", [["Los Angeles", 34.05, -118.24], ["San Francisco", 37.77, -122.42]]],
          ["New York", [["New York City", 40.71, -74.01]]],
          ["Florida", [["Miami", 25.76, -80.19]]]
        ]],
        ["JP", "Japan", [
          ["Tokyo", [["Tokyo", 35.68, 139.69]]],
          ["Osaka", [["Osaka", 34.69, 135.50]]],
          ["Kyoto", [["Kyoto", 35.01, 135.77]]]
        ]]
      ];
    }

    // Append lowercased search index string to each city row [cityName, lat, lon, searchIndex]
    worldLocations = data.map(c => [
      c[0], // code
      c[1], // countryName
      c[2].map(r => [
        r[0], // regionName
        r[1].map(ct => [ct[0], ct[1], ct[2], `${ct[0]} ${r[0]} ${c[1]}`.toLowerCase()])
      ])
    ]);

    // Auto expand Philippines or first country by default
    const phIdx = worldLocations.findIndex(c => c[0] === 'PH' || c[1] === 'Philippines');
    if (phIdx !== -1) {
      expandedCountries.add(phIdx);
      expandedRegions.add(`${phIdx}-0`);
    } else if (worldLocations.length > 0) {
      expandedCountries.add(0);
      expandedRegions.add('0-0');
    }

    renderLocationAccordion();
  } catch (err) {
    console.error("Failed to load world data:", err);
    if (elLocationAccordion) {
      elLocationAccordion.innerHTML = `<div class="p-4 text-xs text-rose-400">Error loading world dataset.</div>`;
    }
  }
}

function renderLocationAccordion(filterQuery = "") {
  if (!elLocationAccordion) return;
  const q = (filterQuery || "").trim().toLowerCase();

  elLocationAccordion.innerHTML = '';

  if (worldLocations.length === 0) {
    elLocationAccordion.innerHTML = `<div class="text-center py-6 text-xs text-slate-400">No locations loaded.</div>`;
    return;
  }

  let totalMatchCount = 0;

  // Traverse 3D Multi-Dimensional Array
  // Level 1: worldLocations[cIdx] -> [code, countryName, regions]
  worldLocations.forEach((countryRow, cIdx) => {
    const code = countryRow[0];
    const countryName = countryRow[1];
    const regions = countryRow[2];

    // Calculate total region count and total city count
    const totalRegions = regions.length;

    // Check if country matches or any child region/city matches filter query
    let countryMatches = false;
    if (q) {
      countryMatches = countryName.toLowerCase().includes(q) || code.toLowerCase().includes(q);
    }

    // Filter regions
    const matchingRegions = [];
    regions.forEach((regionRow, rIdx) => {
      const regionName = regionRow[0];
      const cities = regionRow[1];

      let regionMatches = false;
      if (q) {
        regionMatches = countryMatches || regionName.toLowerCase().includes(q);
      }

      const matchingCities = [];
      cities.forEach((cityRow, cityIdx) => {
        const cityName = cityRow[0];
        const searchIdx = cityRow[3];
        if (!q || regionMatches || searchIdx.includes(q)) {
          matchingCities.push({ cityIdx, cityRow });
        }
      });

      if (matchingCities.length > 0) {
        matchingRegions.push({ rIdx, regionName, matchingCities });
      }
    });

    if (q && matchingRegions.length === 0) return; // Skip non-matching country

    totalMatchCount++;

    const isCountryExpanded = q ? true : expandedCountries.has(cIdx);

    // Find representative coordinates for Country (first city in first region)
    let countryLat = null;
    let countryLon = null;
    if (regions.length > 0 && regions[0][1].length > 0) {
      countryLat = regions[0][1][0][1];
      countryLon = regions[0][1][0][2];
    }

    const cKey = `c-${cIdx}`;
    const isCountrySelected = selectedLocationKey === cKey;

    // Create Level 1: Country Card Element
    const countryCard = document.createElement('div');
    countryCard.className = `rounded-xl border ${isCountrySelected ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-indigo-950/40 shadow-lg' : isCountryExpanded ? 'border-indigo-500/40 bg-slate-900/80 shadow-md' : 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700/80'} overflow-hidden transition-all duration-200`;

    const countryHeader = document.createElement('div');
    countryHeader.className = 'px-3.5 py-3 flex items-center justify-between cursor-pointer select-none';
    countryHeader.innerHTML = `
      <div class="flex items-center gap-2.5">
        <span class="px-2 py-0.5 text-[10px] font-bold bg-indigo-900/60 text-indigo-300 rounded border border-indigo-700/50 uppercase tracking-wider">${code}</span>
        <span class="font-bold text-slate-100 text-xs hover:text-indigo-300 transition-colors">${countryName}</span>
      </div>
      <div class="flex items-center gap-2 text-slate-400 text-[11px]">
        ${countryLat !== null ? `<button class="select-country-btn px-2 py-0.5 text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium transition-all shadow-sm">Select Country</button>` : ''}
        <span class="text-[10px]">${totalRegions} ${totalRegions === 1 ? 'region' : 'regions'}</span>
        <i class="toggle-country-chevron fa-solid ${isCountryExpanded ? 'fa-chevron-down text-indigo-400' : 'fa-chevron-right'} text-[10px] p-1"></i>
      </div>
    `;

    // Click on Select Country button to fetch country forecast
    const selectCountryBtn = countryHeader.querySelector('.select-country-btn');
    if (selectCountryBtn) {
      selectCountryBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (countryLat !== null && countryLon !== null) {
          selectedLocationKey = cKey;
          elLatInput.value = countryLat;
          elLonInput.value = countryLon;
          fetchForecast(countryLat, countryLon, countryName);
          renderLocationAccordion(elSearchInput ? elSearchInput.value : "");
        }
      });
    }

    // Click header to toggle expansion
    countryHeader.addEventListener('click', () => {
      if (expandedCountries.has(cIdx)) {
        expandedCountries.delete(cIdx);
      } else {
        expandedCountries.add(cIdx);
      }
      renderLocationAccordion(elSearchInput ? elSearchInput.value : "");
    });

    countryCard.appendChild(countryHeader);

    // If Expanded, Render Level 2: Regions
    if (isCountryExpanded && matchingRegions.length > 0) {
      const regionsContainer = document.createElement('div');
      regionsContainer.className = 'border-t border-slate-800/80 px-2 py-2 flex flex-col gap-1.5 bg-slate-950/50';

      matchingRegions.forEach(({ rIdx, regionName, matchingCities }) => {
        const regionKey = `${cIdx}-${rIdx}`;
        const isRegionExpanded = q ? true : expandedRegions.has(regionKey);
        const totalCitiesInRegion = matchingCities.length;

        // Representative coordinates for Region (first matching city in region)
        let regionLat = null;
        let regionLon = null;
        if (matchingCities.length > 0) {
          regionLat = matchingCities[0].cityRow[1];
          regionLon = matchingCities[0].cityRow[2];
        }

        const rKey = `r-${cIdx}-${rIdx}`;
        const isRegionSelected = selectedLocationKey === rKey;

        const regionBox = document.createElement('div');
        regionBox.className = `rounded-lg overflow-hidden border ${isRegionSelected ? 'border-indigo-500 ring-1 ring-indigo-500/40 bg-indigo-950/30' : 'border-slate-800/60 bg-slate-900/30'}`;

        const regionHeader = document.createElement('div');
        regionHeader.className = 'px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 text-xs select-none';
        regionHeader.innerHTML = `
          <span class="font-medium text-slate-200 hover:text-indigo-300 transition-colors">${regionName}</span>
          <div class="flex items-center gap-2 text-slate-400 text-[10px]">
            ${regionLat !== null ? `<button class="select-region-btn px-2 py-0.5 text-[9px] bg-indigo-600/90 hover:bg-indigo-500 text-white rounded font-medium transition-all shadow-sm">Select Region</button>` : ''}
            <span>${totalCitiesInRegion} ${totalCitiesInRegion === 1 ? 'city' : 'cities'}</span>
            <i class="fa-solid ${isRegionExpanded ? 'fa-chevron-down text-indigo-400' : 'fa-chevron-right'} p-1"></i>
          </div>
        `;

        const selectRegionBtn = regionHeader.querySelector('.select-region-btn');
        if (selectRegionBtn) {
          selectRegionBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (regionLat !== null && regionLon !== null) {
              selectedLocationKey = rKey;
              elLatInput.value = regionLat;
              elLonInput.value = regionLon;
              fetchForecast(regionLat, regionLon, `${regionName}, ${countryName}`);
              renderLocationAccordion(elSearchInput ? elSearchInput.value : "");
            }
          });
        }

        regionHeader.addEventListener('click', (e) => {
          e.stopPropagation();
          if (expandedRegions.has(regionKey)) {
            expandedRegions.delete(regionKey);
          } else {
            expandedRegions.add(regionKey);
          }
          renderLocationAccordion(elSearchInput ? elSearchInput.value : "");
        });

        regionBox.appendChild(regionHeader);

        // If Region Expanded, Render Level 3: Cities
        if (isRegionExpanded && matchingCities.length > 0) {
          const citiesContainer = document.createElement('div');
          citiesContainer.className = 'px-2 py-1.5 flex flex-col gap-1 bg-slate-950/60 border-t border-slate-800/40';

          matchingCities.forEach(({ cityIdx, cityRow }) => {
            const cityName = cityRow[0];
            const lat = cityRow[1];
            const lon = cityRow[2];
            const cityKey = `city-${cIdx}-${rIdx}-${cityIdx}`;
            const isSelected = selectedLocationKey === cityKey;

            const cityItem = document.createElement('div');
            if (isSelected) {
              cityItem.className = 'px-3 py-2 rounded-lg bg-indigo-600 text-white font-semibold flex items-center justify-between text-xs cursor-pointer shadow-md shadow-indigo-600/30';
            } else {
              cityItem.className = 'px-3 py-2 rounded-lg hover:bg-slate-800/70 text-slate-300 flex items-center justify-between text-xs cursor-pointer transition-colors duration-150';
            }

            cityItem.innerHTML = `
              <div class="flex items-center gap-1.5">
                <i class="fa-solid fa-city text-[10px] ${isSelected ? 'text-indigo-200' : 'text-slate-500'}"></i>
                <span>${cityName}</span>
              </div>
              <span class="${isSelected ? 'text-indigo-100' : 'text-slate-400'} text-[10px] font-mono">${lat}, ${lon}</span>
            `;

            cityItem.addEventListener('click', (e) => {
              e.stopPropagation();
              selectedLocationKey = cityKey;
              elLatInput.value = lat;
              elLonInput.value = lon;

              const fullLabel = `${cityName}, ${regionName}, ${countryName}`;
              fetchForecast(lat, lon, fullLabel);
              renderLocationAccordion(elSearchInput ? elSearchInput.value : "");
            });

            citiesContainer.appendChild(cityItem);
          });

          regionBox.appendChild(citiesContainer);
        }

        regionsContainer.appendChild(regionBox);
      });

      countryCard.appendChild(regionsContainer);
    }

    elLocationAccordion.appendChild(countryCard);
  });

  if (totalMatchCount === 0) {
    elLocationAccordion.innerHTML = `<div class="text-center py-6 text-xs text-slate-400">No matching locations found.</div>`;
  }
}

if (elSearchBtn) {
  elSearchBtn.addEventListener('click', () => {
    renderLocationAccordion(elSearchInput ? elSearchInput.value : "");
  });
}

if (elSearchInput) {
  elSearchInput.addEventListener('input', () => {
    renderLocationAccordion(elSearchInput.value);
  });
}

elFetchBtn.addEventListener('click', () => {
  const latVal = parseFloat(elLatInput.value);
  const lonVal = parseFloat(elLonInput.value);

  if (isNaN(latVal) || latVal < -90 || latVal > 90) {
    showError("Please enter a valid Latitude between -90 and 90.");
    return;
  }
  if (isNaN(lonVal) || lonVal < -180 || lonVal > 180) {
    showError("Please enter a valid Longitude between -180 and 180.");
    return;
  }

  fetchForecast(latVal, lonVal, `Custom (${latVal.toFixed(2)}, ${lonVal.toFixed(2)})`);
});

// Initial Load: Load Dataset and Fetch Default Forecast
window.addEventListener('DOMContentLoaded', () => {
  loadWorldData();
  const defaultLat = 52.52;
  const defaultLon = 13.41;
  fetchForecast(defaultLat, defaultLon, "Berlin, Germany");
});
