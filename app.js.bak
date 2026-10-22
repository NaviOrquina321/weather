// ====================================================
// SkyCast Weather Analytics Engine
// Multi-Dimensional Array Data Structures & Named Constants
// ====================================================

// Named Constants for Metric Indices in weatherMatrix[dayIndex][hourIndex][metricIndex]
const METRIC_TEMP = 0;
const METRIC_WMO = 1;
const METRIC_WIND = 2;
const METRIC_HUMIDITY = 3;
const METRIC_PRECIP_PROB = 4;

// Named Constants for Model Indices in modelMatrix[modelIndex][timeIndex][metric]
const MODEL_GFS = 0;
const MODEL_ECMWF = 1;
const MODEL_ICON = 2;

const MODEL_NAMES = {
  [MODEL_GFS]: "gfs_seamless",
  [MODEL_ECMWF]: "ecmwf_ifs025",
  [MODEL_ICON]: "icon_seamless"
};

const MODEL_LABELS = {
  gfs: { name: "GFS Seamless", provider: "NOAA (US)", index: MODEL_GFS },
  ecmwf: { name: "ECMWF IFS", provider: "European Centre (EU)", index: MODEL_ECMWF },
  icon: { name: "ICON Global", provider: "DWD (Germany)", index: MODEL_ICON }
};

// Global Multi-Dimensional Array Structures
// weatherMatrix: 3D Matrix -> [dayIndex (0..6)][hourIndex (0..23)][metricIndex (0..4)]
let weatherMatrix = [];

// modelMatrix: 3D Matrix -> [modelIndex (0..2)][timeIndex (0..167)][metricIndex]
let modelMatrix = [];

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

// Preset Preset Cities for quick reference
const presetCities = {
  "52.52,13.41": "Berlin, Germany",
  "51.5074,-0.1278": "London, UK",
  "40.7128,-74.0060": "New York, USA",
  "35.6762,139.6503": "Tokyo, Japan",
  "48.8566,2.3522": "Paris, France",
  "-33.8688,151.2093": "Sydney, Australia",
  "1.3521,103.8198": "Singapore",
  "14.5995,120.9842": "Manila, Philippines",
  "10.3157,123.8854": "Cebu City, Philippines",
  "7.1907,125.4553": "Davao City, Philippines",
  "8.4542,124.6319": "Cagayan de Oro, Philippines",
  "6.9214,122.079": "Zamboanga City, Philippines",
  "8.9475,125.5406": "Butuan City, Philippines"
};

// Global Application State
let currentUnit = 'C'; // 'C' or 'F'
let selectedModelKey = 'gfs'; // 'gfs', 'ecmwf', 'icon'
let weatherData = null;
let hourlyChartInstance = null;
let selectedDayIndex = 0; // 0 to 6 representing forecast days
let searchDebounceTimer = null;

// Convert Celsius to Fahrenheit
function cToF(c) {
  return (c * 9/5) + 32;
}

// Format temperature value based on current selected unit
function formatTemp(value) {
  if (value === null || value === undefined || isNaN(value)) return '--';
  const val = currentUnit === 'C' ? value : cToF(value);
  return `${val.toFixed(1)}°${currentUnit}`;
}

// DOM Elements
const elCitySelect = document.getElementById('city-select');
const elCitySearchInput = document.getElementById('city-search-input');
const elClearSearchBtn = document.getElementById('clear-search-btn');
const elSearchSuggestions = document.getElementById('search-suggestions');
const elLatInput = document.getElementById('lat-input');
const elLonInput = document.getElementById('lon-input');
const elFetchBtn = document.getElementById('fetch-btn');

const elToggleC = document.getElementById('toggle-c');
const elToggleF = document.getElementById('toggle-f');

const elHeroCity = document.getElementById('hero-city');
const elHeroCoords = document.getElementById('hero-coords');
const elCityLabel = document.getElementById('weather-city-label');
const elCurrentTime = document.getElementById('weather-current-time');
const elCurrentWeatherIcon = document.getElementById('current-weather-icon');
const elBgWeatherIcon = document.getElementById('bg-weather-icon');
const elCurrentTemp = document.getElementById('current-temp');
const elCurrentUnit = document.getElementById('current-unit');
const elCurrentWeatherDesc = document.getElementById('current-weather-desc');
const elCurrentLat = document.getElementById('current-lat');
const elCurrentLon = document.getElementById('current-lon');

const elStatWindSpeed = document.getElementById('stat-wind-speed');
const elStatHumidity = document.getElementById('stat-humidity');

const elStatTempRange = document.getElementById('stat-temp-range');
const elStatWmoCode = document.getElementById('stat-wmo-code');
const elStatWmoLabel = document.getElementById('stat-wmo-label');
const elStatHourlyPeak = document.getElementById('stat-hourly-peak');
const elStatHourlyLow = document.getElementById('stat-hourly-low');

const elHourlyChartTitle = document.getElementById('hourly-chart-title');
const elDailyForecastContainer = document.getElementById('daily-forecast-container');

const elErrorBanner = document.getElementById('error-banner');
const elErrorMessage = document.getElementById('error-message');
const elLoadingSpinner = document.getElementById('loading-spinner');
const elWeatherDashboard = document.getElementById('weather-dashboard');
const elModelDescCard = document.getElementById('model-desc-card');

// Helper to show/hide loader and errors
function showLoading() {
  elLoadingSpinner.classList.remove('hidden');
  elWeatherDashboard.classList.add('hidden');
  elErrorBanner.classList.add('hidden');
}

function hideLoading() {
  elLoadingSpinner.classList.add('hidden');
  elWeatherDashboard.classList.remove('hidden');
}

function showError(message) {
  elErrorMessage.textContent = message;
  elErrorBanner.classList.remove('hidden');
  elLoadingSpinner.classList.add('hidden');
  elWeatherDashboard.classList.add('hidden');
}

// ----------------------------------------------------
// Multi-Dimensional Array Builders
// ----------------------------------------------------
function populateMatrices(data) {
  const hourly = data.hourly;
  if (!hourly || !hourly.time) return;

  // 1. Populate modelMatrix[modelIndex][timeIndex][metric]
  modelMatrix = [[], [], []];

  const modelKeys = ['gfs_seamless', 'ecmwf_ifs025', 'icon_seamless'];
  const totalHours = hourly.time.length; // usually 168 hours (7 days * 24h)

  modelKeys.forEach((key, modelIdx) => {
    const tempArr = hourly[`temperature_2m_${key}`] || hourly.temperature_2m || [];
    const humidityArr = hourly[`relative_humidity_2m_${key}`] || hourly.relative_humidity_2m || [];
    const wmoArr = hourly[`weather_code_${key}`] || hourly.weather_code || [];
    const windArr = hourly[`wind_speed_10m_${key}`] || hourly.wind_speed_10m || [];
    const precipArr = hourly[`precipitation_probability_${key}`] || hourly.precipitation_probability || [];

    for (let t = 0; t < totalHours; t++) {
      modelMatrix[modelIdx][t] = [];
      modelMatrix[modelIdx][t][METRIC_TEMP] = tempArr[t] !== undefined ? tempArr[t] : null;
      modelMatrix[modelIdx][t][METRIC_WMO] = wmoArr[t] !== undefined ? wmoArr[t] : 0;
      modelMatrix[modelIdx][t][METRIC_WIND] = windArr[t] !== undefined ? windArr[t] : null;
      modelMatrix[modelIdx][t][METRIC_HUMIDITY] = humidityArr[t] !== undefined ? humidityArr[t] : null;
      modelMatrix[modelIdx][t][METRIC_PRECIP_PROB] = precipArr[t] !== undefined ? precipArr[t] : null;
    }
  });

  // 2. Populate weatherMatrix[dayIndex][hourIndex][metricIndex] for active model
  rebuildWeatherMatrixForActiveModel();
}

function rebuildWeatherMatrixForActiveModel() {
  const activeModelIdx = MODEL_LABELS[selectedModelKey].index;
  weatherMatrix = [];

  for (let day = 0; day < 7; day++) {
    weatherMatrix[day] = [];
    for (let hour = 0; hour < 24; hour++) {
      const timeIndex = day * 24 + hour;
      if (modelMatrix[activeModelIdx] && modelMatrix[activeModelIdx][timeIndex]) {
        weatherMatrix[day][hour] = [...modelMatrix[activeModelIdx][timeIndex]];
      } else {
        weatherMatrix[day][hour] = [null, 0, null, null, null];
      }
    }
  }
}

// ----------------------------------------------------
// Open-Meteo API Fetch Engine
// ----------------------------------------------------
async function fetchForecast(lat, lon, locationTitle = null) {
  showLoading();

  // Multi-model API query requesting GFS, ECMWF, ICON concurrently
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min&models=gfs_seamless,ecmwf_ifs025,icon_seamless&timezone=auto`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather service returned HTTP ${response.status}`);
    }

    const data = await response.json();
    weatherData = data;
    weatherData._customTitle = locationTitle;

    // Build internal multi-dimensional arrays
    populateMatrices(data);

    // Default to Day 0 (Today)
    selectedDayIndex = 0;

    hideLoading();
    renderWeatherDashboard();
  } catch (err) {
    console.error("Fetch weather error:", err);
    showError(err.message || "Unable to load weather forecast.");
  }
}

// ----------------------------------------------------
// Unit Switcher Handler
// ----------------------------------------------------
elToggleC.addEventListener('click', () => {
  if (currentUnit === 'C') return;
  currentUnit = 'C';
  elToggleC.className = "px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 bg-indigo-600 text-white shadow-md shadow-indigo-500/20";
  elToggleF.className = "px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 text-slate-400 hover:text-slate-200";
  renderWeatherDashboard();
});

elToggleF.addEventListener('click', () => {
  if (currentUnit === 'F') return;
  currentUnit = 'F';
  elToggleF.className = "px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 bg-indigo-600 text-white shadow-md shadow-indigo-500/20";
  elToggleC.className = "px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 text-slate-400 hover:text-slate-200";
  renderWeatherDashboard();
});

// ----------------------------------------------------
// Model Switcher Handler (Feature 5)
// ----------------------------------------------------
const modelBtns = document.querySelectorAll('.model-btn');
modelBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const modelKey = btn.getAttribute('data-model');
    if (!modelKey || modelKey === selectedModelKey) return;

    selectedModelKey = modelKey;

    // Update UI active buttons
    modelBtns.forEach(b => {
      b.className = "model-btn px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center flex flex-col items-center gap-1 bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700/80";
    });
    btn.className = "model-btn active px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center flex flex-col items-center gap-1 bg-indigo-600 border-indigo-500 text-white shadow-md";

    // Update description banner
    const info = MODEL_LABELS[selectedModelKey];
    if (elModelDescCard) {
      elModelDescCard.innerHTML = `<span class="font-bold text-indigo-300">Active Model:</span> ${info.name} (${info.provider}). Multi-dimensional matrix re-indexed.`;
    }

    // Re-index weatherMatrix & render
    if (weatherData) {
      rebuildWeatherMatrixForActiveModel();
      renderWeatherDashboard();
    }
  });
});

// ----------------------------------------------------
// Interactive City Search Auto-complete (Feature 4)
// ----------------------------------------------------
if (elCitySearchInput) {
  elCitySearchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();

    if (query.length > 0) {
      elClearSearchBtn.classList.remove('hidden');
    } else {
      elClearSearchBtn.classList.add('hidden');
      elSearchSuggestions.classList.add('hidden');
      return;
    }

    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      fetchCitySuggestions(query);
    }, 300);
  });

  elClearSearchBtn.addEventListener('click', () => {
    elCitySearchInput.value = '';
    elClearSearchBtn.classList.add('hidden');
    elSearchSuggestions.classList.add('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!elCitySearchInput.contains(e.target) && !elSearchSuggestions.contains(e.target)) {
      elSearchSuggestions.classList.add('hidden');
    }
  });
}

async function fetchCitySuggestions(query) {
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
    if (!res.ok) return;

    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      elSearchSuggestions.innerHTML = `<div class="p-3 text-xs text-slate-400">No matching cities found</div>`;
      elSearchSuggestions.classList.remove('hidden');
      return;
    }

    elSearchSuggestions.innerHTML = '';
    data.results.forEach(city => {
      const item = document.createElement('div');
      item.className = "p-3 text-xs border-b border-slate-800/60 hover:bg-indigo-600/20 cursor-pointer flex justify-between items-center transition-colors";

      const adminStr = city.admin1 ? `, ${city.admin1}` : '';
      const countryStr = city.country ? ` (${city.country})` : '';
      const displayTitle = `${city.name}${adminStr}${countryStr}`;

      item.innerHTML = `
        <div>
          <span class="font-bold text-white">${city.name}</span>
          <span class="text-[10px] text-slate-400 block">${city.country || ''} ${city.admin1 || ''}</span>
        </div>
        <span class="text-[10px] text-indigo-300 font-mono">${city.latitude.toFixed(2)}°, ${city.longitude.toFixed(2)}°</span>
      `;

      item.addEventListener('click', () => {
        elLatInput.value = city.latitude;
        elLonInput.value = city.longitude;
        elCitySearchInput.value = displayTitle;
        elSearchSuggestions.classList.add('hidden');
        elCitySelect.value = 'custom';

        fetchForecast(city.latitude, city.longitude, displayTitle);
      });

      elSearchSuggestions.appendChild(item);
    });

    elSearchSuggestions.classList.remove('hidden');
  } catch (err) {
    console.error("Geocoding search error:", err);
  }
}

// ----------------------------------------------------
// Dashboard Rendering Engine
// ----------------------------------------------------
function renderWeatherDashboard() {
  if (!weatherData) return;

  const current = weatherData.current;
  const latVal = weatherData.latitude;
  const lonVal = weatherData.longitude;

  // Determine Location Title
  let cityName = weatherData._customTitle || "Custom Location";
  if (!weatherData._customTitle) {
    for (let key in presetCities) {
      const [plat, plon] = key.split(',').map(Number);
      if (Math.abs(plat - latVal) < 0.1 && Math.abs(plon - lonVal) < 0.1) {
        cityName = presetCities[key];
        break;
      }
    }
  }

  // Update Main Dashboard & Hero Text
  elCityLabel.textContent = cityName;
  if (elHeroCity) elHeroCity.textContent = cityName;
  if (elHeroCoords) elHeroCoords.textContent = `${latVal.toFixed(4)}°N, ${lonVal.toFixed(4)}°E`;

  // Time formatting
  const timeDate = current && current.time ? new Date(current.time) : new Date();
  elCurrentTime.textContent = timeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " " + timeDate.toLocaleDateString([], { month: 'short', day: 'numeric' });

  elCurrentLat.textContent = latVal.toFixed(2);
  elCurrentLon.textContent = lonVal.toFixed(2);

  // Read current metrics from weatherMatrix[0][currentHour] or current API response
  const currentHour = timeDate.getHours();
  const currentMatrixPoint = (weatherMatrix[0] && weatherMatrix[0][currentHour]) ? weatherMatrix[0][currentHour] : [current?.temperature_2m, current?.weather_code, current?.wind_speed_10m, current?.relative_humidity_2m, null];

  const currentWmoCode = currentMatrixPoint[METRIC_WMO] !== undefined ? currentMatrixPoint[METRIC_WMO] : (current?.weather_code || 0);
  const wmoInfo = getWMOInfo(currentWmoCode);

  // Weather Icon & Temperature Display
  elCurrentWeatherIcon.className = `fa-solid ${wmoInfo.icon} ${wmoInfo.color} animate-pulse`;
  elBgWeatherIcon.className = `fa-solid ${wmoInfo.icon}`;

  const curTemp = currentMatrixPoint[METRIC_TEMP] !== null ? currentMatrixPoint[METRIC_TEMP] : (current?.temperature_2m || 0);
  elCurrentTemp.textContent = currentUnit === 'C' ? curTemp.toFixed(1) : cToF(curTemp).toFixed(1);
  elCurrentUnit.textContent = `°${currentUnit}`;
  elCurrentWeatherDesc.textContent = wmoInfo.label;

  // Secondary Current Metrics (Wind & Humidity)
  const curWind = currentMatrixPoint[METRIC_WIND] !== null ? currentMatrixPoint[METRIC_WIND] : (current?.wind_speed_10m || '--');
  const curHumid = currentMatrixPoint[METRIC_HUMIDITY] !== null ? currentMatrixPoint[METRIC_HUMIDITY] : (current?.relative_humidity_2m || '--');

  if (elStatWindSpeed) elStatWindSpeed.textContent = `${curWind} km/h`;
  if (elStatHumidity) elStatHumidity.textContent = `${curHumid} %`;

  // Selected Day Matrix Analysis
  const selectedDayMatrix = weatherMatrix[selectedDayIndex] || [];
  const hourlyTemps = selectedDayMatrix.map(point => point[METRIC_TEMP]).filter(t => t !== null && !isNaN(t));

  const minHourTemp = hourlyTemps.length > 0 ? Math.min(...hourlyTemps) : 0;
  const maxHourTemp = hourlyTemps.length > 0 ? Math.max(...hourlyTemps) : 0;

  // Selected Day WMO code (taken from midday or predominant point)
  const middayWmoCode = selectedDayMatrix[12] ? selectedDayMatrix[12][METRIC_WMO] : currentWmoCode;
  const targetWmoInfo = getWMOInfo(middayWmoCode);

  elStatTempRange.textContent = `${formatTemp(minHourTemp)} / ${formatTemp(maxHourTemp)}`;
  elStatWmoCode.textContent = middayWmoCode;
  elStatWmoLabel.textContent = targetWmoInfo.label;
  elStatHourlyPeak.textContent = formatTemp(maxHourTemp);
  elStatHourlyLow.textContent = formatTemp(minHourTemp);

  // Chart Title
  const isToday = selectedDayIndex === 0;
  const targetDayDate = new Date();
  targetDayDate.setDate(targetDayDate.getDate() + selectedDayIndex);
  const targetDayLabel = targetDayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  if (elHourlyChartTitle) {
    elHourlyChartTitle.textContent = `${isToday ? "Today's" : targetDayLabel} 24-Hour Temperature Curve`;
  }

  // Render Daily Cards & Chart
  renderDailyForecast();
  renderHourlyChart();
}

// ----------------------------------------------------
// Render 7-Day Forecast Cards from weatherMatrix
// ----------------------------------------------------
function renderDailyForecast() {
  elDailyForecastContainer.innerHTML = '';

  for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
    const dayDate = new Date();
    dayDate.setDate(dayDate.getDate() + dayIdx);

    const dayName = dayIdx === 0 ? "Today" : dayDate.toLocaleDateString('en-US', { weekday: 'short' });
    const formattedDate = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const dayMatrix = weatherMatrix[dayIdx] || [];
    const dayTemps = dayMatrix.map(p => p[METRIC_TEMP]).filter(t => t !== null && !isNaN(t));
    const dailyMin = dayTemps.length > 0 ? Math.min(...dayTemps) : null;
    const dailyMax = dayTemps.length > 0 ? Math.max(...dayTemps) : null;

    const noonWmo = dayMatrix[12] ? dayMatrix[12][METRIC_WMO] : 0;
    const info = getWMOInfo(noonWmo);

    const card = document.createElement('div');
    const isActive = dayIdx === selectedDayIndex;

    if (isActive) {
      card.className = "bg-indigo-650/30 border-2 border-indigo-500 rounded-xl p-3.5 flex flex-col items-center justify-between text-center gap-2 shadow-lg shadow-indigo-500/20 scale-[1.03] transition-all duration-300 ring-4 ring-indigo-500/10 cursor-default";
    } else {
      card.className = "bg-slate-900/40 border border-slate-800/60 rounded-xl p-3.5 flex flex-col items-center justify-between text-center gap-2 hover:bg-slate-800/40 hover:-translate-y-1 hover:border-slate-700/80 transition-all duration-300 cursor-pointer";
    }

    card.innerHTML = `
      <div>
        <p class="text-xs font-bold ${isActive ? 'text-indigo-300' : 'text-white'} uppercase">${dayName}</p>
        <p class="text-[10px] text-slate-400 mt-0.5">${formattedDate}</p>
      </div>
      <div class="text-2xl my-1.5">
        <i class="fa-solid ${info.icon} ${info.color}"></i>
      </div>
      <div class="flex flex-col gap-0.5">
        <span class="text-[11px] font-semibold text-slate-200 line-clamp-1">${info.label}</span>
        <span class="text-xs text-indigo-300 font-bold mt-1">${dailyMin !== null ? `${formatTemp(dailyMin)} - ${formatTemp(dailyMax)}` : '--'}</span>
      </div>
    `;

    if (!isActive) {
      card.addEventListener('click', () => {
        selectedDayIndex = dayIdx;
        renderWeatherDashboard();
      });
    }

    elDailyForecastContainer.appendChild(card);
  }
}

// ----------------------------------------------------
// Render Hourly Chart.js Line Chart from weatherMatrix
// ----------------------------------------------------
function renderHourlyChart() {
  const ctx = document.getElementById('hourlyChart').getContext('2d');

  if (hourlyChartInstance) {
    hourlyChartInstance.destroy();
  }

  const dayMatrix = weatherMatrix[selectedDayIndex] || [];
  const hourlyTimes = [];
  const displayTemps = [];

  for (let hour = 0; hour < 24; hour++) {
    const hourStr = `${hour.toString().padStart(2, '0')}:00`;
    hourlyTimes.push(hourStr);

    const rawTemp = dayMatrix[hour] ? dayMatrix[hour][METRIC_TEMP] : 0;
    const tempVal = currentUnit === 'C' ? rawTemp : cToF(rawTemp);
    displayTemps.push(tempVal);
  }

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
        pointHoverRadius: 6,
        fill: true,
        backgroundColor: gradient,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
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
              const hourIdx = context.dataIndex;
              const point = dayMatrix[hourIdx] || [];
              const wind = point[METRIC_WIND] !== null ? point[METRIC_WIND] : '--';
              const humid = point[METRIC_HUMIDITY] !== null ? point[METRIC_HUMIDITY] : '--';
              return [
                `Temp: ${context.parsed.y.toFixed(1)}°${currentUnit}`,
                `Wind: ${wind} km/h`,
                `Humidity: ${humid}%`
              ];
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          },
          ticks: {
            color: '#94a3b8',
            font: {
              size: 10
            }
          }
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          },
          ticks: {
            color: '#94a3b8',
            font: {
              size: 10
            },
            callback: function(value) {
              return value.toFixed(0) + `°${currentUnit}`;
            }
          }
        }
      }
    }
  });
}

// ----------------------------------------------------
// Event Handlers for Preset Select & Coordinates Fetch Button
// ----------------------------------------------------
elCitySelect.addEventListener('change', () => {
  const value = elCitySelect.value;
  if (value === 'custom') return;

  const [latStr, lonStr] = value.split(',');
  const latVal = parseFloat(latStr);
  const lonVal = parseFloat(lonStr);

  elLatInput.value = latVal;
  elLonInput.value = lonVal;
  if (elCitySearchInput) elCitySearchInput.value = presetCities[value] || '';

  fetchForecast(latVal, lonVal, presetCities[value]);
});

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

  let matchesPreset = false;
  let matchedName = null;

  for (let key in presetCities) {
    const [plat, plon] = key.split(',').map(Number);
    if (Math.abs(plat - latVal) < 0.0001 && Math.abs(plon - lonVal) < 0.0001) {
      elCitySelect.value = key;
      matchesPreset = true;
      matchedName = presetCities[key];
      break;
    }
  }

  if (!matchesPreset) {
    elCitySelect.value = 'custom';
  }

  fetchForecast(latVal, lonVal, matchedName);
});

// Initial Load: Fetch default (Berlin, Germany)
window.addEventListener('DOMContentLoaded', () => {
  const defaultLat = 52.52;
  const defaultLon = 13.41;
  fetchForecast(defaultLat, defaultLon, "Berlin, Germany");
});