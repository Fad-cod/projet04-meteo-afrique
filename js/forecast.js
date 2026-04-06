let selectedForecastIndex = 0;
let cachedForecastDays = [];

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function updateForecastUI(weatherData) {
  const locationName = weatherData.location?.name || "Ville";
  const regionName = weatherData.location?.country || "";
  const current = weatherData.current || {};
  const forecastDays = weatherData.forecast?.forecastday || [];
  cachedForecastDays = forecastDays;

  setText("forecast-hero-location", `${locationName}${regionName ? ", " + regionName : ""}`);
  if (weatherData.location?.tz_id) {
    setText("forecast-hero-timezone", `Fuseau ${weatherData.location.tz_id}`);
  }
  setText("forecast-hero-updated", formatLastUpdated(current.last_updated));
  setText("forecast-hero-temp", `${Math.round(current.temp_c ?? 0)}°`);
  setText("forecast-hero-humidity", `${current.humidity ?? "--"}%`);
  setText("forecast-hero-wind", `${Math.round(current.wind_kph ?? 0)} km/h`);

  renderForecast(forecastDays);
  updateForecastDetails(0);

  const errorElement = document.getElementById("forecast-error-message");
  if (errorElement) {
    errorElement.textContent = "";
  }

  const badge = document.getElementById("forecast-update-badge");
  if (badge) {
    badge.classList.remove("is-visible");
    void badge.offsetWidth;
    badge.classList.add("is-visible");
  }
}

function renderForecast(days) {
  const selectorContainer = document.getElementById("forecast-selector-container");
  const daysContainer = document.getElementById("forecast-days-container");
  if (!selectorContainer || !daysContainer) return;

  selectorContainer.innerHTML = "";
  daysContainer.innerHTML = "";

  const labels = ["Aujourd’hui", "Demain", "Après-demain"];
  const temps = days.map(d => d.day || {});
  const maxAll = Math.max(...temps.map(d => d.maxtemp_c ?? 0));
  const minAll = Math.min(...temps.map(d => d.mintemp_c ?? 0));
  const rangeSpan = Math.max(1, maxAll - minAll);

  days.forEach((item, index) => {
    const dayData = item.day || {};
    let label = labels[index];
    if (!label) {
      const date = new Date(item.date);
      label = date.toLocaleDateString('fr-FR', { weekday: 'long' });
      label = label.charAt(0).toUpperCase() + label.slice(1);
    }
    
    const avgTemp = Math.round(dayData.avgtemp_c ?? 0);
    const maxTemp = Math.round(dayData.maxtemp_c ?? 0);
    const minTemp = Math.round(dayData.mintemp_c ?? 0);
    const status = getConditionLabel(dayData.condition);
    const iconUrl = getConditionIconUrl(dayData.condition);
    const badge = getForecastBadge(dayData, status);
    const rangeWidth = ((maxTemp - minTemp) / rangeSpan) * 100;

    const btn = document.createElement("button");
    btn.className = `forecast-selector-button ${index === 0 ? 'is-active' : ''}`;
    btn.textContent = label;
    btn.onclick = () => {
      selectedForecastIndex = index;
      updateForecastDetails(index);
      document.querySelectorAll('.forecast-selector-button').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
    };
    selectorContainer.appendChild(btn);

    const card = document.createElement("article");
    card.className = "forecast-day-card hover-lift";
    card.innerHTML = `
      <div class="forecast-day-card-title">${label}</div>
      <div class="forecast-day-card-temp">${avgTemp}°</div>
      <img class="forecast-day-card-icon" src="${iconUrl}" alt="${status}" />
      <div class="forecast-day-card-status">${status}</div>
      <div class="forecast-day-card-badge-row">
        <span class="forecast-day-card-badge">${badge}</span>
      </div>
      <div class="forecast-day-card-meta">
        <span class="forecast-day-card-meta-item">Max ${maxTemp}°</span>
        <span class="forecast-day-card-meta-item">Min ${minTemp}°</span>
      </div>
      <div class="forecast-day-card-range">
        <div class="forecast-day-card-range-track">
          <div class="forecast-day-card-range-fill" style="width: ${rangeWidth}%"></div>
        </div>
      </div>
    `;
    daysContainer.appendChild(card);
  });
}

function getForecastBadge(dayData, statusText) {
  if ((dayData.maxtemp_c ?? 0) >= 35) return "Chaleur";
  if ((dayData.daily_chance_of_rain ?? 0) >= 60) return "Pluie";
  if ((dayData.maxwind_kph ?? 0) >= 30) return "Vent";
  return statusText || "Stabilité";
}

function updateForecastDetails(index) {
  const dayData = cachedForecastDays[index]?.day || {};
  const astro = cachedForecastDays[index]?.astro || {};
  setText("forecast-detail-sunrise", astro.sunrise || "--");
  setText("forecast-detail-sunset", astro.sunset || "--");
  setText("forecast-detail-rain", `${dayData.daily_chance_of_rain ?? "--"}%`);
  setText("forecast-detail-uv", dayData.uv ?? "--");
  updateHourlyTimeline(index);
}

function updateHourlyTimeline(index) {
  const grid = document.getElementById("forecast-hourly-grid");
  if (!grid) return;

  const hours = cachedForecastDays[index]?.hour || [];
  const selectedHours = hours.filter((_, hrIndex) => hrIndex % 3 === 0).slice(0, 8);
  grid.innerHTML = "";

  selectedHours.forEach((hourItem) => {
    const card = document.createElement("div");
    card.className = "forecast-hourly-card";
    card.innerHTML = `
      <div class="forecast-hourly-time">${hourItem.time?.split(" ")[1] || "--:--"}</div>
      <div class="forecast-hourly-temp">${Math.round(hourItem.temp_c ?? 0)}°</div>
      <div class="forecast-hourly-status">${getConditionLabel(hourItem.condition)}</div>
    `;
    grid.appendChild(card);
  });

  const subtitle = document.getElementById("forecast-hourly-subtitle");
  if (subtitle) {
    const labels = ["Aujourd’hui", "Demain", "Après-demain"];
    let currentLabel = labels[index];
    if (!currentLabel && cachedForecastDays[index]) {
      const date = new Date(cachedForecastDays[index].date);
      currentLabel = date.toLocaleDateString('fr-FR', { weekday: 'long' });
    }
    subtitle.textContent = currentLabel || "Sélection du jour";
  }
}

function handleForecastSearch() {
  const input = document.querySelector(".forecast-header-search-input");
  const button = document.querySelector(".forecast-header-action-button");
  if (!input) return;

  const runSearch = (city) => {
    if (button) button.disabled = true;
    return getWeatherByCity(city)
      .then(updateForecastUI)
      .catch(() => {
        const err = document.getElementById("forecast-error-message");
        if (err) err.textContent = "Ville introuvable ou problème réseau.";
      })
      .finally(() => {
        if (button) button.disabled = false;
      });
  };

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && input.value.trim()) runSearch(input.value.trim());
  });

  if (button) {
    button.addEventListener("click", () => runSearch(input.value.trim() || "Lagos"));
  }
}

getWeatherByCity("Lagos")
  .then(updateForecastUI)
  .catch(() => console.warn("Erreur API."));

handleForecastSearch();
