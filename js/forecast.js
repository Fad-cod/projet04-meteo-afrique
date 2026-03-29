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

  const labels = ["Aujourd’hui", "Demain", "Après-demain"];
  const temps = forecastDays.slice(0, 3).map((item) => item.day || {});
  const maxAll = Math.max(...temps.map((day) => day.maxtemp_c ?? 0));
  const minAll = Math.min(...temps.map((day) => day.mintemp_c ?? 0));
  const rangeSpan = Math.max(1, maxAll - minAll);

  forecastDays.slice(0, 3).forEach((item, index) => {
    const dayData = item.day || {};
    const label = labels[index] || item.date;
    const avgTemp = Math.round(dayData.avgtemp_c ?? 0);
    const maxTemp = Math.round(dayData.maxtemp_c ?? 0);
    const minTemp = Math.round(dayData.mintemp_c ?? 0);
    const status = getConditionLabel(dayData.condition);
    const iconUrl = getConditionIconUrl(dayData.condition);
    const badge = getForecastBadge(dayData, status);
    const rangeWidth = ((maxTemp - minTemp) / rangeSpan) * 100;

    setText(`forecast-day-${index}-label`, label);
    setText(`forecast-day-${index}-temp`, `${avgTemp}°`);
    setText(`forecast-day-${index}-status`, status);
    const iconElement = document.getElementById(`forecast-day-${index}-icon`);
    if (iconElement) {
      iconElement.src = iconUrl;
      iconElement.alt = status;
    }
    setText(`forecast-day-${index}-badge`, badge);
    setText(`forecast-day-${index}-max`, `Max ${maxTemp}°`);
    setText(`forecast-day-${index}-min`, `Min ${minTemp}°`);
    setRangeWidth(`forecast-day-${index}-range`, rangeWidth);
  });

  updateForecastDetails(selectedForecastIndex);

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

function getForecastBadge(dayData, statusText) {
  if ((dayData.maxtemp_c ?? 0) >= 35) {
    return "Chaleur";
  }
  if ((dayData.daily_chance_of_rain ?? 0) >= 60) {
    return "Pluie";
  }
  if ((dayData.maxwind_kph ?? 0) >= 30) {
    return "Vent";
  }
  if (statusText) {
    return statusText;
  }
  return "Stabilité";
}

function setRangeWidth(id, widthPercent) {
  const element = document.getElementById(id);
  if (element) {
    const clamped = Math.max(10, Math.min(100, widthPercent));
    element.style.width = `${clamped}%`;
  }
}

function updateForecastDetails(index) {
  const dayData = cachedForecastDays[index]?.day || {};
  const astro = cachedForecastDays[index]?.astro || {};
  setText("forecast-detail-sunrise", astro.sunrise || "--");
  setText("forecast-detail-sunset", astro.sunset || "--");
  setText("forecast-detail-rain", `${dayData.daily_chance_of_rain ?? "--"}%`);
  setText("forecast-detail-uv", dayData.uv ?? "--");
  updateHourlyTimeline(index);
  updateSelectorState(index);
}

function updateHourlyTimeline(index) {
  const grid = document.getElementById("forecast-hourly-grid");
  if (!grid) return;

  const hours = cachedForecastDays[index]?.hour || [];
  const selectedHours = hours.filter((_, hourIndex) => hourIndex % 3 === 0).slice(0, 8);
  grid.innerHTML = "";

  selectedHours.forEach((hourItem) => {
    const card = document.createElement("div");
    card.className = "forecast-hourly-card";

    const time = document.createElement("div");
    time.className = "forecast-hourly-time";
    time.textContent = hourItem.time?.split(" ")[1] || "--:--";

    const temp = document.createElement("div");
    temp.className = "forecast-hourly-temp";
    temp.textContent = `${Math.round(hourItem.temp_c ?? 0)}°`;

    const status = document.createElement("div");
    status.className = "forecast-hourly-status";
    status.textContent = getConditionLabel(hourItem.condition);

    card.append(time, temp, status);
    grid.appendChild(card);
  });

  const subtitle = document.getElementById("forecast-hourly-subtitle");
  if (subtitle) {
    const labelElement = document.getElementById(`forecast-day-${index}-label`);
    subtitle.textContent = labelElement ? labelElement.textContent : "Sélection du jour";
  }
}

function updateSelectorState(index) {
  const buttons = [
    document.getElementById("forecast-select-day-0"),
    document.getElementById("forecast-select-day-1"),
    document.getElementById("forecast-select-day-2"),
  ];

  buttons.forEach((button, buttonIndex) => {
    if (!button) return;
    if (buttonIndex === index) {
      button.classList.add("is-active");
    } else {
      button.classList.remove("is-active");
    }
  });
}

function setupDaySelectors() {
  const selectors = [
    document.getElementById("forecast-select-day-0"),
    document.getElementById("forecast-select-day-1"),
    document.getElementById("forecast-select-day-2"),
  ];

  selectors.forEach((button, index) => {
    if (!button) return;
    button.addEventListener("click", () => {
      selectedForecastIndex = index;
      updateForecastDetails(index);
    });
  });
}

function handleForecastSearch() {
  const input = document.querySelector(".forecast-header-search-input");
  if (!input) return;
  const button = document.querySelector(".forecast-header-action-button");

  const runSearch = (city) => {
    if (button) {
      button.disabled = true;
    }
    return getWeatherByCity(city)
      .then(updateForecastUI)
      .catch(() => {
        const errorElement = document.getElementById("forecast-error-message");
        if (errorElement) {
          errorElement.textContent = "Ville introuvable ou problème réseau.";
        }
      })
      .finally(() => {
        if (button) {
          button.disabled = false;
        }
      });
  };

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && input.value.trim()) {
      const city = input.value.trim();
      runSearch(city);
    }
  });

  if (button) {
    button.addEventListener("click", () => {
      const city = input.value.trim() || "Lagos";
      runSearch(city);
    });
  }
}

getWeatherByCity("Lagos")
  .then(updateForecastUI)
  .catch(() => {
    console.warn("Impossible de charger la météo. Vérifie la clé API.");
  });

setupDaySelectors();
handleForecastSearch();
