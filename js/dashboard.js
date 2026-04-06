function getWindRotation(dir) {
  const directions = {
    N: 0, NNE: 22.5, NE: 45, ENE: 67.5,
    E: 90, ESE: 112.5, SE: 135, SSE: 157.5,
    S: 180, SSW: 202.5, SW: 225, WSW: 247.5,
    W: 270, WNW: 292.5, NW: 315, NNW: 337.5
  };
  return directions[dir] || 0;
}

function updateDashboardUI(weatherData) {
  const locationName = weatherData.location?.name || "Ville";
  const current = weatherData.current || {};
  const forecastDays = weatherData.forecast?.forecastday || [];
  const forecastDay = forecastDays[0]?.day || {};

  const temperatureC = Math.round(current.temp_c ?? 0);
  const feelsLikeC = Math.round(current.feelslike_c ?? 0);
  const humidity = current.humidity ?? "--";
  const windKph = Math.round(current.wind_kph ?? 0);
  const windDir = current.wind_dir || "--";
  const uvIndex = current.uv ?? "--";
  const maxTemp = Math.round(forecastDay.maxtemp_c ?? temperatureC);
  const minTemp = Math.round(forecastDay.mintemp_c ?? temperatureC);
  const condition = getConditionLabel(current.condition);
  const iconUrl = getConditionIconUrl(current.condition);

  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  };

  setText("dashboard-hero-city-value", locationName);
  setText("dashboard-hero-temp-value", `${temperatureC}°`);
  setText("dashboard-hero-humidity-value", `${humidity}%`);
  setText("dashboard-hero-wind-value", `${windKph} km/h`);

  setText("dashboard-weather-card-city", locationName);
  setText("dashboard-weather-card-status", condition);
  setText("dashboard-weather-card-temp", `${temperatureC}°`);
  setText("dashboard-weather-card-feelslike", `Ressenti ${feelsLikeC}°`);
  setText("dashboard-weather-card-humidity", `Humidité ${humidity}%`);
  setText("dashboard-weather-card-uv", `UV ${uvIndex}`);
  setText("dashboard-weather-card-max", `Max ${maxTemp}°`);
  setText("dashboard-weather-card-min", `Min ${minTemp}°`);

  setText("dashboard-wind-speed-display", `${windKph} km/h`);
  setText("dashboard-wind-direction", windDir);
  setText("dashboard-wind-humidity-value", `${humidity}%`);
  if (current.pressure_mb) {
    setText("dashboard-wind-pressure-value", `${current.pressure_mb} hPa`);
  }

  const windIcon = document.getElementById("dashboard-wind-direction-icon");
  if (windIcon) {
    windIcon.style.transform = `rotate(${getWindRotation(windDir)}deg)`;
  }

  setText("dashboard-last-updated", formatLastUpdated(current.last_updated));

  const iconElement = document.getElementById("dashboard-weather-card-icon");
  if (iconElement) {
    iconElement.src = iconUrl;
    iconElement.alt = condition;
  }

  const badge = document.getElementById("dashboard-update-badge");
  if (badge) {
    badge.classList.remove("is-visible");
    void badge.offsetWidth;
    badge.classList.add("is-visible");
  }

  const errorElement = document.getElementById("dashboard-error-message");
  if (errorElement) {
    errorElement.textContent = "";
  }

  const labels = ["Aujourd’hui", "Demain", "Après-demain"];
  forecastDays.slice(0, 3).forEach((item, index) => {
    const dayData = item.day || {};
    const label = labels[index] || item.date;
    const temp = Math.round(dayData.avgtemp_c ?? temperatureC);
    const status = dayData.condition?.text || "--";

    setText(`dashboard-forecast-day-${index}-label`, label);
    setText(`dashboard-forecast-day-${index}-temp`, `${temp}°`);
    setText(`dashboard-forecast-day-${index}-status`, status);
  });
}

function handleDashboardSearch() {
  const input = document.querySelector(".dashboard-header-search-input");
  const refreshButton = document.getElementById("dashboard-refresh-button");
  if (!input) return;

  const runSearch = (city) => {
    if (refreshButton) {
      refreshButton.disabled = true;
    }
    return getWeatherByCity(city)
      .then(updateDashboardUI)
      .catch(() => {
        const errorElement = document.getElementById("dashboard-error-message");
        if (errorElement) {
          errorElement.textContent = "Ville introuvable ou problème réseau.";
        }
      })
      .finally(() => {
        if (refreshButton) {
          refreshButton.disabled = false;
        }
      });
  };

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && input.value.trim()) {
      const city = input.value.trim();
      runSearch(city);
    }
  });

  if (refreshButton) {
    refreshButton.addEventListener("click", () => {
      const city = input.value.trim() || "Lagos";
      runSearch(city);
    });
  }
}

getWeatherByCity("Lagos")
  .then(updateDashboardUI)
  .catch(() => {
    console.warn("Impossible de charger la météo. Vérifie la clé API.");
  });

handleDashboardSearch();
