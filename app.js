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

// Map city names / presets
const presetCities = {
  "52.52,13.41": "Berlin, Germany",
  "40.7128,-74.006": "New York, USA",
  "35.6762,139.6503": "Tokyo, Japan",
  "51.5074,-0.1278": "London, UK",
  "48.8566,2.3522": "Paris, France",
  "-33.8688,151.2093": "Sydney, Australia",
  "30.0444,31.2357": "Cairo, Egypt",

  // Philippines - Luzon
  "14.5995,120.9842": "Manila, Philippines",
  "16.4023,120.5960": "Baguio City, Philippines",
  "9.7392,118.7353": "Puerto Princesa, Philippines",
  "13.1392,123.7438": "Legazpi City, Philippines",

  // Philippines - Visayas
  "10.3157,123.8854": "Cebu City, Philippines",
  "10.7202,122.5621": "Iloilo City, Philippines",
  "11.2444,124.9985": "Tacloban City, Philippines",
  "9.65,123.85": "Tagbilaran City, Philippines",

  // Philippines - Mindanao
  "7.0707,125.6087": "Davao City, Philippines",
  "8.4542,124.6319": "Cagayan de Oro, Philippines",
  "6.9214,122.0790": "Zamboanga City, Philippines",
  "8.9475,125.5406": "Butuan City, Philippines"
};

// Elements
const elCitySelect = document.getElementById('city-select');
const elLatInput = document.getElementById('lat-input');
const elLonInput = document.getElementById('lon-input');
const elFetchBtn = document.getElementById('fetch-btn');

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
async function fetchForecast(lat, lon) {
  showLoading(true);
  showError(null);

  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code&hourly=temperature_2m&current=temperature_2m`);
    if (!response.ok) {
      throw new Error(`Open-Meteo returned status ${response.status}`);
    }
    weatherData = await response.json();
    selectedDayIndex = 0; // Reset to Today for the new location
    renderWeatherDashboard();
  } catch (error) {
    console.error(error);
    showError(error.message || "Failed to load weather forecast data. Please check your internet connection.");
  } finally {
    showLoading(false);
  }
}

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
  const current_units = weatherData.current_units;
  const hourly = weatherData.hourly;
  const daily = weatherData.daily;

  // Determine standard City Name Label
  const latVal = weatherData.latitude.toFixed(4);
  const lonVal = weatherData.longitude.toFixed(4);

  // Find preset name that matches approximately or use Custom Coordinates label
  let cityName = "Custom Location";
  for (let key in presetCities) {
    const [plat, plon] = key.split(',').map(Number);
    if (Math.abs(plat - weatherData.latitude) < 0.1 && Math.abs(plon - weatherData.longitude) < 0.1) {
      cityName = presetCities[key];
      break;
    }
  }

  // Update Main Dashboard & Hero Text
  elCityLabel.textContent = cityName;
  if (elHeroCity) elHeroCity.textContent = cityName;
  if (elHeroCoords) elHeroCoords.textContent = `${latVal}°N, ${lonVal}°E`;

  // Parse/Format Time
  const timeDate = new Date(current.time);
  elCurrentTime.textContent = timeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " " + timeDate.toLocaleDateString([], { month: 'short', day: 'numeric' });

  // Lat and Lon details
  elCurrentLat.textContent = latVal;
  elCurrentLon.textContent = lonVal;

  // Determine current weather code
  const todayWmoCode = daily.weather_code && daily.weather_code[0] !== undefined ? daily.weather_code[0] : 0;
  const wmoInfo = getWMOInfo(todayWmoCode);

  // Set weather icons and current temp
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

  // Determine target day details for the chart title and secondary stats
  const targetDayStr = daily.time[selectedDayIndex];
  const targetDayDate = new Date(targetDayStr);
  const targetDayLabel = targetDayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const isToday = selectedDayIndex === 0;

  if (elHourlyChartTitle) {
    elHourlyChartTitle.textContent = `${isToday ? "Today's" : targetDayLabel} 24-Hour Temperature Curve`;
  }

  // Determine selected day weather code
  const targetWmoCode = daily.weather_code && daily.weather_code[selectedDayIndex] !== undefined ? daily.weather_code[selectedDayIndex] : 0;
  const targetWmoInfo = getWMOInfo(targetWmoCode);

  // Stats Highlights Box calculation
  // Find peak and low in the hourly temps for the selected day
  const startIdx = selectedDayIndex * 24;
  const endIdx = startIdx + 24;
  const hourlyTemps = hourly.temperature_2m.slice(startIdx, endIdx);
  const minHourTemp = Math.min(...hourlyTemps);
  const maxHourTemp = Math.max(...hourlyTemps);

  elStatTempRange.textContent = `${formatTemp(minHourTemp)} / ${formatTemp(maxHourTemp)}`;
  elStatWmoCode.textContent = targetWmoCode;
  elStatWmoLabel.textContent = targetWmoInfo.label;
  elStatHourlyPeak.textContent = formatTemp(maxHourTemp);
  elStatHourlyLow.textContent = formatTemp(minHourTemp);

  // Render 7-Day Forecast cards
  renderDailyForecast(daily);

  // Render Chart
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

    const startIdx = index * 24;
    const endIdx = startIdx + 24;
    let dailyMin = null;
    let dailyMax = null;

    if (weatherData.hourly && weatherData.hourly.temperature_2m) {
      const dayTemps = weatherData.hourly.temperature_2m.slice(startIdx, endIdx);
      if (dayTemps.length > 0) {
        dailyMin = Math.min(...dayTemps);
        dailyMax = Math.max(...dayTemps);
      }
    }

    const card = document.createElement('div');

    // Check if this day is currently selected
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

    // Click handler to change the active selected day
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

  const startIdx = selectedDayIndex * 24;
  const endIdx = startIdx + 24;

  const hourlyTimes = hourly.time.slice(startIdx, endIdx).map(t => {
    const d = new Date(t);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });

  const rawTemps = hourly.temperature_2m.slice(startIdx, endIdx);
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
              return `Temp: ${context.parsed.y.toFixed(1)}°${currentUnit}`;
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
              return value + `°${currentUnit}`;
            }
          }
        }
      }
    }
  });
}

// ----------------------------------------------------
// Event handlers for Dropdown preset city and inputs
// ----------------------------------------------------

elCitySelect.addEventListener('change', () => {
  const value = elCitySelect.value;
  if (value === 'custom') {
    // Leave fields open for customization
    return;
  }

  // Extract lat/lon and update input values
  const [latStr, lonStr] = value.split(',');
  elLatInput.value = parseFloat(latStr);
  elLonInput.value = parseFloat(lonStr);

  // Auto fetch immediately on city quick-select
  fetchForecast(parseFloat(latStr), parseFloat(lonStr));
});

elFetchBtn.addEventListener('click', () => {
  const latVal = parseFloat(elLatInput.value);
  const lonVal = parseFloat(elLonInput.value);

  // Validate range
  if (isNaN(latVal) || latVal < -90 || latVal > 90) {
    showError("Please enter a valid Latitude between -90 and 90.");
    return;
  }
  if (isNaN(lonVal) || lonVal < -180 || lonVal > 180) {
    showError("Please enter a valid Longitude between -180 and 180.");
    return;
  }

  // Update Dropdown to 'custom' if the custom fields don't match any preset coordinate exactly
  let matchesPreset = false;
  for (let key in presetCities) {
    const [plat, plon] = key.split(',').map(Number);
    if (Math.abs(plat - latVal) < 0.0001 && Math.abs(plon - lonVal) < 0.0001) {
      elCitySelect.value = key;
      matchesPreset = true;
      break;
    }
  }

  if (!matchesPreset) {
    elCitySelect.value = 'custom';
  }

  fetchForecast(latVal, lonVal);
});

// ----------------------------------------------------
// AGENT / CONTINUOUS EXECUTION & VALIDATION LOOP ENGINE
// ----------------------------------------------------

class AgentValidationLoopEngine {
  constructor() {
    this.isRunning = true;
    this.intervalMs = 10000;
    this.timerId = null;
    this.totalExecutions = 0;
    this.successfulCycles = 0;
    this.lastLatencyMs = 0;

    // DOM Elements
    this.elStatusBadge = document.getElementById('agent-loop-status-badge');
    this.elBtnToggle = document.getElementById('agent-btn-toggle');
    this.elBtnToggleIcon = document.getElementById('agent-btn-toggle-icon');
    this.elBtnToggleText = document.getElementById('agent-btn-toggle-text');
    this.elBtnRunNow = document.getElementById('agent-btn-run-now');
    this.elIntervalSelect = document.getElementById('agent-interval-select');
    this.elStatTotal = document.getElementById('agent-stat-total');
    this.elStatPassRate = document.getElementById('agent-stat-pass-rate');
    this.elStatLatency = document.getElementById('agent-stat-latency');
    this.elStatHealth = document.getElementById('agent-stat-health');
    this.elLogTerminal = document.getElementById('agent-log-terminal');
    this.elClearLog = document.getElementById('agent-clear-log');
    this.elSpinner = document.getElementById('agent-loop-spinner');

    this.initEventListeners();
  }

  initEventListeners() {
    if (this.elBtnToggle) {
      this.elBtnToggle.addEventListener('click', () => this.toggleLoop());
    }
    if (this.elBtnRunNow) {
      this.elBtnRunNow.addEventListener('click', () => this.runValidationCycle(true));
    }
    if (this.elIntervalSelect) {
      this.elIntervalSelect.addEventListener('change', (e) => {
        this.intervalMs = parseInt(e.target.value, 10) || 10000;
        this.log(`Interval updated to ${this.intervalMs / 1000}s`, 'info');
        if (this.isRunning) {
          this.restartTimer();
        }
      });
    }
    if (this.elClearLog) {
      this.elClearLog.addEventListener('click', () => {
        if (this.elLogTerminal) {
          this.elLogTerminal.innerHTML = '<div class="text-slate-500 italic">[Log cleared by user]</div>';
        }
      });
    }
  }

  start() {
    this.isRunning = true;
    this.updateStatusUI();
    this.log("Agent Loop started. Running initial validation cycle...", "info");
    this.runValidationCycle();
    this.restartTimer();
  }

  pause() {
    this.isRunning = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.updateStatusUI();
    this.log("Agent Loop paused by operator.", "warn");
  }

  toggleLoop() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  }

  restartTimer() {
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = setInterval(() => {
      if (this.isRunning) {
        this.runValidationCycle();
      }
    }, this.intervalMs);
  }

  updateStatusUI() {
    if (!this.elStatusBadge) return;
    if (this.isRunning) {
      this.elStatusBadge.className = "text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5";
      this.elStatusBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> ACTIVE`;
      if (this.elBtnToggleText) this.elBtnToggleText.textContent = "Pause Loop";
      if (this.elBtnToggleIcon) this.elBtnToggleIcon.className = "fa-solid fa-pause";
      if (this.elSpinner) this.elSpinner.classList.add("animate-spin");
    } else {
      this.elStatusBadge.className = "text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5";
      this.elStatusBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400"></span> PAUSED`;
      if (this.elBtnToggleText) this.elBtnToggleText.textContent = "Resume Loop";
      if (this.elBtnToggleIcon) this.elBtnToggleIcon.className = "fa-solid fa-play";
      if (this.elSpinner) this.elSpinner.classList.remove("animate-spin");
    }
  }

  log(message, type = 'info') {
    if (!this.elLogTerminal) return;

    const timeStr = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    let colorClass = 'text-slate-300';
    let icon = 'fa-angle-right text-indigo-400';

    if (type === 'success') {
      colorClass = 'text-emerald-400 font-semibold';
      icon = 'fa-check text-emerald-400';
    } else if (type === 'warn') {
      colorClass = 'text-amber-300';
      icon = 'fa-triangle-exclamation text-amber-400';
    } else if (type === 'error') {
      colorClass = 'text-red-400 font-bold';
      icon = 'fa-xmark text-red-500';
    } else if (type === 'info') {
      colorClass = 'text-indigo-300';
      icon = 'fa-info-circle text-indigo-400';
    }

    const logItem = document.createElement('div');
    logItem.className = `flex items-start gap-2 text-xs ${colorClass} font-mono leading-tight`;
    logItem.innerHTML = `<span class="text-slate-500 shrink-0">[${timeStr}]</span> <i class="fa-solid ${icon} mt-0.5 text-[10px]"></i> <span>${message}</span>`;

    this.elLogTerminal.appendChild(logItem);
    this.elLogTerminal.scrollTop = this.elLogTerminal.scrollHeight;
  }

  async runValidationCycle(isManual = false) {
    this.totalExecutions++;
    const cycleId = `#${this.totalExecutions}`;
    this.log(`--- Running Validation Cycle ${cycleId}${isManual ? ' (Manual Trigger)' : ''} ---`, 'info');

    let cyclePassed = true;
    const errors = [];

    // Test Suite 1: Open-Meteo API Health & Latency Check
    const startTime = performance.now();
    try {
      const pingRes = await fetch('https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m', { method: 'GET' });
      const endTime = performance.now();
      this.lastLatencyMs = Math.round(endTime - startTime);

      if (pingRes.ok) {
        this.log(`[Suite 1] API Endpoint: OK (${pingRes.status}) | Latency: ${this.lastLatencyMs}ms`, 'success');
      } else {
        cyclePassed = false;
        errors.push(`API returned HTTP ${pingRes.status}`);
        this.log(`[Suite 1] API Endpoint FAIL: HTTP ${pingRes.status}`, 'error');
      }
    } catch (err) {
      cyclePassed = false;
      errors.push(`API fetch exception: ${err.message}`);
      this.log(`[Suite 1] API Endpoint FAIL: ${err.message}`, 'error');
    }

    // Test Suite 2: Data Schema Integrity & WMO Resolution Check
    if (weatherData) {
      if (weatherData.current && weatherData.daily && weatherData.hourly && Array.isArray(weatherData.daily.weather_code) && Array.isArray(weatherData.hourly.temperature_2m)) {
        const todayWmo = weatherData.daily.weather_code[0];
        const wmoInfo = getWMOInfo(todayWmo);
        if (wmoInfo && wmoInfo.label && !wmoInfo.label.startsWith("Unknown")) {
          this.log(`[Suite 2] Data Schema & WMO Resolution (Code ${todayWmo}: "${wmoInfo.label}"): PASS`, 'success');
        } else {
          this.log(`[Suite 2] Data Schema PASS, WMO Code ${todayWmo} unmapped fallback: WARN`, 'warn');
        }
      } else {
        cyclePassed = false;
        errors.push("Invalid weatherData schema");
        this.log(`[Suite 2] Data Schema FAIL: Missing current/daily/hourly properties`, 'error');
      }
    } else {
      this.log(`[Suite 2] Data Schema: Weather data loading in progress...`, 'warn');
    }

    // Test Suite 3: Mathematical & Unit Conversion Integrity Check
    try {
      const cZeroInF = cToF(0);
      const c100InF = cToF(100);
      const mathOk = Math.abs(cZeroInF - 32) < 0.001 && Math.abs(c100InF - 212) < 0.001;
      const formattedC = formatTemp(25);

      if (mathOk && formattedC.includes('25.0')) {
        this.log(`[Suite 3] Math Engine (cToF(0)=32°F, cToF(100)=212°F, formatTemp): PASS`, 'success');
      } else {
        cyclePassed = false;
        errors.push("Math calculation mismatch");
        this.log(`[Suite 3] Math Engine FAIL: Conversion formulas deviated`, 'error');
      }
    } catch (err) {
      cyclePassed = false;
      errors.push(`Math test failed: ${err.message}`);
      this.log(`[Suite 3] Math Engine FAIL: ${err.message}`, 'error');
    }

    // Test Suite 4: DOM Synchronization & Component Sync Check
    try {
      const cardCount = elDailyForecastContainer ? elDailyForecastContainer.children.length : 0;
      const chartCanvas = document.getElementById('hourlyChart');

      if (cardCount === 7 && chartCanvas) {
        this.log(`[Suite 4] DOM State Sync (7 Daily Forecast Cards & Chart Canvas Active): PASS`, 'success');
      } else {
        this.log(`[Suite 4] DOM State Sync: Cards rendered = ${cardCount}/7`, cardCount > 0 ? 'info' : 'warn');
      }
    } catch (err) {
      cyclePassed = false;
      errors.push(`DOM test exception: ${err.message}`);
      this.log(`[Suite 4] DOM State Sync FAIL: ${err.message}`, 'error');
    }

    // Metrics Update
    if (cyclePassed) {
      this.successfulCycles++;
      this.log(`=== Cycle ${cycleId} Completed Successfully ===`, 'success');
    } else {
      this.log(`=== Cycle ${cycleId} Completed with Errors (${errors.join(', ')}) ===`, 'error');
    }

    this.updateMetricsUI();
  }

  updateMetricsUI() {
    if (this.elStatTotal) this.elStatTotal.textContent = this.totalExecutions;

    const passRate = this.totalExecutions > 0 ? Math.round((this.successfulCycles / this.totalExecutions) * 100) : 100;

    if (this.elStatPassRate) {
      this.elStatPassRate.textContent = `${passRate}%`;
      if (passRate >= 90) {
        this.elStatPassRate.className = "text-xl font-extrabold text-emerald-400 mt-1";
      } else if (passRate >= 70) {
        this.elStatPassRate.className = "text-xl font-extrabold text-amber-400 mt-1";
      } else {
        this.elStatPassRate.className = "text-xl font-extrabold text-red-400 mt-1";
      }
    }

    if (this.elStatLatency) {
      this.elStatLatency.textContent = this.lastLatencyMs ? `${this.lastLatencyMs} ms` : '-- ms';
    }

    if (this.elStatHealth) {
      if (passRate >= 90) {
        this.elStatHealth.className = "text-sm font-bold text-emerald-400 mt-1.5 flex items-center gap-1";
        this.elStatHealth.innerHTML = `<i class="fa-solid fa-circle-check"></i> Healthy`;
      } else if (passRate >= 70) {
        this.elStatHealth.className = "text-sm font-bold text-amber-400 mt-1.5 flex items-center gap-1";
        this.elStatHealth.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Degraded`;
      } else {
        this.elStatHealth.className = "text-sm font-bold text-red-400 mt-1.5 flex items-center gap-1";
        this.elStatHealth.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Critical`;
      }
    }
  }
}

// Global Agent Loop instance reference
let agentLoopInstance = null;

// Initial Load: Fetch default (Berlin, Germany) and start Agent Validation Loop
window.addEventListener('DOMContentLoaded', () => {
  const defaultLat = 52.52;
  const defaultLon = 13.41;
  fetchForecast(defaultLat, defaultLon);

  // Initialize and start the Agent Validation Loop engine
  agentLoopInstance = new AgentValidationLoopEngine();
  agentLoopInstance.start();
});