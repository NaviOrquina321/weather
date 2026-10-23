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
// Multi-dimensional 2D array grid storage (7 days x 24 hours) - CHANGED
let hourlyByDay = [];
let timesByDay = [];

// Converts a flat array of 168 elements into a 7x24 2D grid array - CHANGED
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

// Map city names / presets
const presetCities = {
  "52.52,13.41": "Berlin, Germany",
  "40.7128,-74.006": "New York, USA",
  "35.6762,139.6503": "Tokyo, Japan",
  "51.5074,-0.1278": "London, UK",
  "48.8566,2.3522": "Paris, France",
  "-33.8688,151.2093": "Sydney, Australia",
  "30.0444,31.2357": "Cairo, Egypt",
  "34.0522,-118.2437": "Los Angeles, USA",
  "-23.5505,-46.6333": "São Paulo, Brazil",
  "19.076,72.8777": "Mumbai, India",
  "43.6532,-79.3832": "Toronto, Canada",
  "41.9028,12.4964": "Rome, Italy",
  "25.2048,55.2708": "Dubai, UAE",
  "1.3521,103.8198": "Singapore",
  "39.9042,116.4074": "Beijing, China",
  "37.5665,126.978": "Seoul, South Korea",
  "-34.6037,-58.3816": "Buenos Aires, Argentina",
  "6.5244,3.3792": "Lagos, Nigeria",
  "13.7563,100.5018": "Bangkok, Thailand",
  "41.0082,28.9784": "Istanbul, Turkey",
  "19.4326,-99.1332": "Mexico City, Mexico",

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

// Search Elements
const elSearchInput = document.getElementById('search-input');
const elSearchBtn = document.getElementById('search-btn');
const elSearchResults = document.getElementById('search-results');

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
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code&hourly=temperature_2m&current=temperature_2m,weather_code&timezone=auto`);
    if (!response.ok) {
      throw new Error(`Open-Meteo returned status ${response.status}`);
    }
    weatherData = await response.json();
    // Convert 168-item flat hourly arrays into 7x24 2D grid multi-dimensional arrays - CHANGED
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

  // Parse/Format Time directly from local ISO string (current.time e.g., "2026-10-23T11:00")
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

  // Determine current weather code strictly synced with current.weather_code
  const currentWmoCode = current.weather_code !== undefined ? current.weather_code : 0;
  const wmoInfo = getWMOInfo(currentWmoCode);

  // Set weather icons and current temp directly from real-time payload
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
  // Find peak and low in the hourly temps for the selected day - CHANGED: use hourlyByDay grid
  const hourlyTemps = hourlyByDay[selectedDayIndex] || [];
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

    let dailyMin = null;
    let dailyMax = null;

    // CHANGED: use hourlyByDay grid instead of slice
    if (hourlyByDay && hourlyByDay[index]) {
      const dayTemps = hourlyByDay[index];
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

  // CHANGED: use timesByDay and hourlyByDay multi-dimensional arrays instead of slice
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

  // Direct canvas click handler for precise nearest-point calculation
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

// Dynamic Geocoding Search handler
async function performGeocodingSearch(query) {
  if (!query || query.trim().length === 0) return;

  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
    if (!res.ok) throw new Error("Geocoding search failed");
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      elSearchResults.innerHTML = `<div class="p-3 text-xs text-slate-400">No results found for "${query}"</div>`;
      elSearchResults.classList.remove('hidden');
      return;
    }

    elSearchResults.innerHTML = '';
    data.results.forEach(loc => {
      const item = document.createElement('div');
      item.className = 'p-3 hover:bg-slate-800 cursor-pointer text-xs flex flex-col border-b border-slate-800 last:border-0';
      const name = loc.name;
      const admin = loc.admin1 ? `, ${loc.admin1}` : '';
      const country = loc.country ? `, ${loc.country}` : '';
      const fullLabel = `${name}${admin}${country}`;

      item.innerHTML = `
        <span class="font-bold text-slate-200">${name}</span>
        <span class="text-[10px] text-slate-400">${loc.admin1 || ''} ${loc.country || ''} (${loc.latitude.toFixed(2)}, ${loc.longitude.toFixed(2)})</span>
      `;

      item.addEventListener('click', () => {
        elLatInput.value = loc.latitude;
        elLonInput.value = loc.longitude;
        elCitySelect.value = 'custom';
        elSearchResults.classList.add('hidden');
        elSearchInput.value = fullLabel;
        fetchForecast(loc.latitude, loc.longitude);
      });

      elSearchResults.appendChild(item);
    });

    elSearchResults.classList.remove('hidden');
  } catch (err) {
    console.error(err);
    showError("Failed to search location.");
  }
}

if (elSearchBtn) {
  elSearchBtn.addEventListener('click', () => performGeocodingSearch(elSearchInput.value));
}

if (elSearchInput) {
  elSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      performGeocodingSearch(elSearchInput.value);
    }
  });
}

document.addEventListener('click', (e) => {
  if (elSearchResults && !elSearchResults.contains(e.target) && e.target !== elSearchInput && e.target !== elSearchBtn) {
    elSearchResults.classList.add('hidden');
  }
});

// Initial Load: Fetch default (Berlin, Germany)
window.addEventListener('DOMContentLoaded', () => {
  const defaultLat = 52.52;
  const defaultLon = 13.41;
  fetchForecast(defaultLat, defaultLon);
});