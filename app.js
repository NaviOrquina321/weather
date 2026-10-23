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

let activeLocationLabel = "Berlin, Germany";

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

if (elFetchBtn) {
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
}

/* Browse by Country (Feature 4) - SkyCast
 * Country -> Province/Region -> City accordion backed by data/world.json.
 * Data is a multi-dimensional array: world[country][region][city].
 * Requires window.loadWeather(lat, lon, label) to be defined in app.js.
 */
(function () {
  'use strict';

  // ---- Array layout (named indexes instead of raw numbers) ----
  // world   = [ [code, name, regions], ... ]
  // regions = [ [regionName, cities], ... ]
  // cities  = [ [cityName, lat, lon, searchText], ... ]  (searchText added on load)
  var COUNTRY_CODE = 0, COUNTRY_NAME = 1, COUNTRY_REGIONS = 2;
  var REGION_NAME = 0, REGION_CITIES = 1;
  var CITY_NAME = 0, CITY_LAT = 1, CITY_LON = 2, CITY_SEARCH = 3;

  var DATA_URL = 'data/world.json';
  var PAGE_SIZE = 100;          // cities shown per region before "Show more"
  var MIN_QUERY = 2;            // search starts at 2 characters
  var MAX_COUNTRIES = 12;       // search result caps
  var MAX_REGIONS = 15;
  var MAX_CITIES = 8;
  var DEBOUNCE_MS = 150;
  var DEFAULT_COUNTRY = 'PH';
  var DEFAULT_REGION = 'South Cotabato';
  var DEFAULT_CITY = 'City of Koronadal';

  var world = [];
  var state = {
    ready: false,
    failed: false,
    openCountry: -1,   // country index, -1 = none
    openRegion: '',    // "countryIndex|regionIndex"
    sel: null,         // { k: country, j: region, c: city } indexes
    q: '',
    shown: {}          // regionId -> how many cities are visible
  };

  var listEl, searchEl, labelEl, coordsEl, searchTimer = null, warned = false;

  // ---------- small DOM helpers (textContent only, never innerHTML) ----------
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function chevron(size) {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    var path = document.createElementNS(ns, 'path');
    path.setAttribute('d', 'M6 3l5 5-5 5');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(path);
    var wrap = el('span', 'cb-chevron');
    wrap.appendChild(svg);
    return wrap;
  }

  function plural(n, one, many) {
    return n === 1 ? '1 ' + one : n + ' ' + many;
  }

  function message(text, extraClass) {
    return el('div', 'cb-message' + (extraClass ? ' ' + extraClass : ''), text);
  }

  function rowButton(className, action, key, attrs) {
    var b = el('button', className);
    b.type = 'button';
    b.setAttribute('data-action', action);
    b.setAttribute('data-key', key);
    for (var name in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, name)) b.setAttribute('data-' + name, attrs[name]);
    }
    return b;
  }

  // ---------- view model (what to show for the current state) ----------
  function range(from, to) {
    var out = [];
    for (var i = from; i < to; i++) out.push(i);
    return out;
  }

  function buildBrowseView() {
    var countries = [];
    for (var k = 0; k < world.length; k++) {
      var regionList = world[k][COUNTRY_REGIONS];
      var open = state.openCountry === k;
      var regions = [];
      if (open) {
        for (var j = 0; j < regionList.length; j++) {
          var rid = k + '|' + j;
          var total = regionList[j][REGION_CITIES].length;
          var rOpen = state.openRegion === rid;
          var cities = [];
          var hidden = 0;
          if (rOpen) {
            var limit = state.shown[rid] || PAGE_SIZE;
            cities = range(0, Math.min(limit, total));
            hidden = Math.max(0, total - limit);
          }
          regions.push({ j: j, open: rOpen, total: total, cities: cities, hidden: hidden });
        }
      }
      countries.push({ k: k, open: open, regionCount: regionList.length, regions: regions });
    }
    return { searching: false, capped: false, countries: countries };
  }

  function buildSearchView(q) {
    var countries = [];
    var capped = false;
    for (var k = 0; k < world.length; k++) {
      var country = world[k];
      var countryHit = country[COUNTRY_NAME].toLowerCase().indexOf(q) !== -1;
      var regionList = country[COUNTRY_REGIONS];
      var regions = [];
      for (var j = 0; j < regionList.length; j++) {
        var region = regionList[j];
        var cityList = region[REGION_CITIES];
        var regionHit = countryHit || region[REGION_NAME].toLowerCase().indexOf(q) !== -1;
        var matches = [];
        if (regionHit) {
          matches = range(0, cityList.length);
        } else {
          for (var c = 0; c < cityList.length; c++) {
            if (cityList[c][CITY_SEARCH].indexOf(q) !== -1) matches.push(c);
          }
        }
        if (!matches.length) continue;
        if (regions.length >= MAX_REGIONS) { capped = true; break; }
        var total = matches.length;
        if (matches.length > MAX_CITIES) { matches = matches.slice(0, MAX_CITIES); capped = true; }
        regions.push({ j: j, open: true, total: total, cities: matches, hidden: 0 });
      }
      if (!regions.length) continue;
      if (countries.length >= MAX_COUNTRIES) { capped = true; break; }
      countries.push({ k: k, open: true, regionCount: regions.length, regions: regions });
    }
    return { searching: true, capped: capped, countries: countries };
  }

  function buildView() {
    var q = state.q.trim().toLowerCase();
    return q.length >= MIN_QUERY ? buildSearchView(q) : buildBrowseView();
  }

  // ---------- rendering ----------
  function renderCity(k, j, c) {
    var city = world[k][COUNTRY_REGIONS][j][REGION_CITIES][c];
    var selected = !!state.sel && state.sel.k === k && state.sel.j === j && state.sel.c === c;
    var row = rowButton('cb-city-row' + (selected ? ' is-selected' : ''), 'city', 't:' + k + '|' + j + '|' + c, { k: k, j: j, c: c });
    row.setAttribute('aria-pressed', selected ? 'true' : 'false');
    row.appendChild(el('span', 'cb-city-name', city[CITY_NAME]));
    row.appendChild(el('span', 'cb-city-coords', city[CITY_LAT].toFixed(2) + ', ' + city[CITY_LON].toFixed(2)));
    return row;
  }

  function renderRegion(k, rv) {
    var region = world[k][COUNTRY_REGIONS][rv.j];
    var rid = k + '|' + rv.j;
    var wrap = el('div', 'cb-region');
    var row = rowButton('cb-region-row' + (rv.open ? ' is-open' : ''), 'region', 'r:' + rid, { k: k, j: rv.j });
    row.setAttribute('aria-expanded', rv.open ? 'true' : 'false');
    row.appendChild(el('span', 'cb-grow', region[REGION_NAME]));
    row.appendChild(el('span', 'cb-count', plural(rv.total, 'city', 'cities')));
    row.appendChild(chevron(14));
    wrap.appendChild(row);

    if (rv.open) {
      var list = el('div', 'cb-cities');
      for (var i = 0; i < rv.cities.length; i++) list.appendChild(renderCity(k, rv.j, rv.cities[i]));
      if (rv.hidden > 0) {
        var more = rowButton('cb-more', 'more', 'm:' + rid, { k: k, j: rv.j });
        more.textContent = 'Show ' + Math.min(PAGE_SIZE, rv.hidden) + ' more of ' + rv.hidden;
        list.appendChild(more);
      }
      wrap.appendChild(list);
    }
    return wrap;
  }

  function renderCountry(cv) {
    var country = world[cv.k];
    var card = el('div', 'cb-country');
    var row = rowButton('cb-country-row', 'country', 'c:' + cv.k, { k: cv.k });
    row.setAttribute('aria-expanded', cv.open ? 'true' : 'false');
    row.appendChild(el('span', 'cb-code', country[COUNTRY_CODE]));
    row.appendChild(el('span', 'cb-grow', country[COUNTRY_NAME]));
    row.appendChild(el('span', 'cb-count', plural(cv.regionCount, 'region', 'regions')));
    row.appendChild(chevron(16));
    card.appendChild(row);

    if (cv.open) {
      var body = el('div', 'cb-country-body');
      for (var i = 0; i < cv.regions.length; i++) body.appendChild(renderRegion(cv.k, cv.regions[i]));
      card.appendChild(body);
    }
    return card;
  }

  function render(animate) {
    var focusKey = null;
    var active = document.activeElement;
    if (active && listEl.contains(active)) focusKey = active.getAttribute('data-key');
    var scrollTop = listEl.scrollTop;

    var frag = document.createDocumentFragment();
    if (state.failed) {
      frag.appendChild(message('Could not load the location data. Please reopen this page.', 'cb-message--error'));
    } else if (!state.ready) {
      frag.appendChild(message('Loading the world map data...'));
    } else {
      var view = buildView();
      if (!view.countries.length) frag.appendChild(message('No matching country, province or city.'));
      for (var i = 0; i < view.countries.length; i++) frag.appendChild(renderCountry(view.countries[i]));
      if (view.capped) frag.appendChild(el('div', 'cb-note', 'Showing the top matches. Keep typing to narrow it down.'));
    }
    listEl.replaceChildren(frag);
    listEl.scrollTop = scrollTop;

    // Play the 200ms chevron rotation for the row that was just toggled.
    if (animate) {
      var toggled = listEl.querySelector('[data-key="' + animate.key + '"]');
      if (toggled) {
        var now = toggled.getAttribute('aria-expanded');
        toggled.setAttribute('aria-expanded', animate.wasOpen ? 'true' : 'false');
        void toggled.offsetWidth; // force reflow so the transition runs
        toggled.setAttribute('aria-expanded', now);
      }
    }
    // Keep keyboard focus on the same row after the list is rebuilt.
    if (focusKey) {
      var again = listEl.querySelector('[data-key="' + focusKey + '"]');
      if (again) again.focus({ preventScroll: true });
    }
  }

  function updateSummary() {
    if (!state.sel) {
      labelEl.textContent = 'No city selected';
      coordsEl.textContent = '';
      return;
    }
    var country = world[state.sel.k];
    var region = country[COUNTRY_REGIONS][state.sel.j];
    var city = region[REGION_CITIES][state.sel.c];
    labelEl.textContent = city[CITY_NAME] + ', ' + region[REGION_NAME] + ', ' + country[COUNTRY_NAME];
    coordsEl.textContent = 'Lat ' + city[CITY_LAT].toFixed(2) + '  Lon ' + city[CITY_LON].toFixed(2);
  }

  // ---------- weather integration ----------
  function callLoadWeather(lat, lon, label) {
    if (typeof window.loadWeather !== 'function') {
      if (!warned) { warned = true; console.warn('Browse by Country: window.loadWeather(lat, lon, label) is not defined in app.js'); }
      return;
    }
    try {
      window.loadWeather(lat, lon, label);
    } catch (err) {
      console.error('Browse by Country: loadWeather failed', err);
    }
  }

  function selectCity(sel, load) {
    state.sel = sel;
    var country = world[sel.k];
    var city = country[COUNTRY_REGIONS][sel.j][REGION_CITIES][sel.c];
    updateSummary();
    render();
    if (load) callLoadWeather(city[CITY_LAT], city[CITY_LON], city[CITY_NAME] + ', ' + country[COUNTRY_NAME]);
  }

  // ---------- events ----------
  function onListClick(event) {
    var btn = event.target.closest('button[data-action]');
    if (!btn || !listEl.contains(btn)) return;
    var action = btn.getAttribute('data-action');
    var k = Number(btn.getAttribute('data-k'));
    var j = Number(btn.getAttribute('data-j'));
    var c = Number(btn.getAttribute('data-c'));
    var key = btn.getAttribute('data-key');
    var wasOpen = btn.getAttribute('aria-expanded') === 'true';

    if (action === 'country') {
      if (state.openCountry === k) {
        state.openCountry = -1;
      } else {
        state.openCountry = k;
        state.openRegion = '';
      }
      render({ key: key, wasOpen: wasOpen });
    } else if (action === 'region') {
      var rid = k + '|' + j;
      state.openRegion = state.openRegion === rid ? '' : rid;
      render({ key: key, wasOpen: wasOpen });
    } else if (action === 'city') {
      selectCity({ k: k, j: j, c: c }, true);
    } else if (action === 'more') {
      var id = k + '|' + j;
      state.shown[id] = (state.shown[id] || PAGE_SIZE) + PAGE_SIZE;
      render();
    }
  }

  function onSearchInput() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      state.q = searchEl.value;
      render();
    }, DEBOUNCE_MS);
  }

  // ---------- data loading ----------
  function prepareData() {
    for (var k = 0; k < world.length; k++) {
      var regions = world[k][COUNTRY_REGIONS];
      for (var j = 0; j < regions.length; j++) {
        var cities = regions[j][REGION_CITIES];
        for (var c = 0; c < cities.length; c++) {
          cities[c][CITY_SEARCH] = cities[c][CITY_NAME].toLowerCase();
        }
      }
    }
  }

  function selectDefault() {
    for (var k = 0; k < world.length; k++) {
      if (world[k][COUNTRY_CODE] !== DEFAULT_COUNTRY) continue;
      var regions = world[k][COUNTRY_REGIONS];
      for (var j = 0; j < regions.length; j++) {
        if (regions[j][REGION_NAME] !== DEFAULT_REGION) continue;
        var cities = regions[j][REGION_CITIES];
        var c = 0;
        for (var i = 0; i < cities.length; i++) {
          if (cities[i][CITY_NAME] === DEFAULT_CITY) { c = i; break; }
        }
        state.openCountry = k;
        state.openRegion = k + '|' + j;
        if (c >= PAGE_SIZE) state.shown[state.openRegion] = Math.ceil((c + 1) / PAGE_SIZE) * PAGE_SIZE;
        selectCity({ k: k, j: j, c: c }, true);
        var selectedRow = listEl.querySelector('.cb-city-row.is-selected');
        if (selectedRow && selectedRow.scrollIntoView) selectedRow.scrollIntoView({ block: 'nearest' });
        return;
      }
    }
    render(); // default not found: just show the list
  }

  function loadDataset() {
    if (window.WORLD_DATA && Array.isArray(window.WORLD_DATA) && window.WORLD_DATA.length > 0) {
      world = window.WORLD_DATA;
      prepareData();
      state.ready = true;
      selectDefault();
      return;
    }
    fetch(DATA_URL)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        world = data;
        prepareData();
        state.ready = true;
        selectDefault();
      })
      .catch(function (err) {
        console.error('Browse by Country: could not load ' + DATA_URL, err);
        if (window.WORLD_DATA && Array.isArray(window.WORLD_DATA)) {
          world = window.WORLD_DATA;
          prepareData();
          state.ready = true;
          selectDefault();
        } else {
          state.failed = true;
          render();
        }
      });
  }

  function init() {
    listEl = document.getElementById('cb-list');
    searchEl = document.getElementById('cb-search');
    labelEl = document.getElementById('cb-summary-label');
    coordsEl = document.getElementById('cb-summary-coords');
    if (!listEl || !searchEl || !labelEl || !coordsEl) return;

    listEl.addEventListener('click', onListClick); // one listener for every row
    searchEl.addEventListener('input', onSearchInput);
    render(); // shows "Loading..."

    loadDataset();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
