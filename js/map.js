const mapSearchInput = document.querySelector(".map-header-search-input");
const mapRefreshButton = document.querySelector(".map-header-action-button");
const mapContainer = document.getElementById("map-leaflet-container");
const mapLoadingOverlay = document.getElementById("map-loading-overlay");
const defaultCity = "Lagos";

const cityCoordinates = [
  { name: "Algiers", coords: [36.7538, 3.0588] },
  { name: "Luanda", coords: [-8.839, 13.2894] },
  { name: "Porto-Novo", coords: [6.4969, 2.6289] },
  { name: "Gaborone", coords: [-24.6282, 25.9231] },
  { name: "Ouagadougou", coords: [12.3714, -1.5197] },
  { name: "Bujumbura", coords: [-3.3614, 29.3599] },
  { name: "Praia", coords: [14.933, -23.513] },
  { name: "Yaounde", coords: [3.848, 11.5021] },
  { name: "Bangui", coords: [4.3947, 18.5582] },
  { name: "N'Djamena", coords: [12.1348, 15.0557] },
  { name: "Moroni", coords: [-11.7172, 43.2473] },
  { name: "Kinshasa", coords: [-4.4419, 15.2663] },
  { name: "Brazzaville", coords: [-4.2634, 15.2429] },
  { name: "Yamoussoukro", coords: [6.8276, -5.2893] },
  { name: "Djibouti", coords: [11.5721, 43.1456] },
  { name: "Cairo", coords: [30.0444, 31.2357] },
  { name: "Malabo", coords: [3.75, 8.7833] },
  { name: "Asmara", coords: [15.3229, 38.9251] },
  { name: "Mbabane", coords: [-26.3054, 31.1367] },
  { name: "Addis Ababa", coords: [8.9806, 38.7578] },
  { name: "Libreville", coords: [0.4162, 9.4673] },
  { name: "Banjul", coords: [13.4549, -16.579] },
  { name: "Accra", coords: [5.6037, -0.187] },
  { name: "Conakry", coords: [9.6412, -13.5784] },
  { name: "Bissau", coords: [11.8817, -15.617] },
  { name: "Nairobi", coords: [-1.2921, 36.8219] },
  { name: "Maseru", coords: [-29.3151, 27.4869] },
  { name: "Monrovia", coords: [6.3156, -10.8074] },
  { name: "Tripoli", coords: [32.8872, 13.1913] },
  { name: "Antananarivo", coords: [-18.8792, 47.5079] },
  { name: "Lilongwe", coords: [-13.9626, 33.7741] },
  { name: "Bamako", coords: [12.6392, -8.0029] },
  { name: "Nouakchott", coords: [18.0735, -15.9582] },
  { name: "Port Louis", coords: [-20.1609, 57.5012] },
  { name: "Rabat", coords: [34.0209, -6.8416] },
  { name: "Maputo", coords: [-25.9692, 32.5732] },
  { name: "Windhoek", coords: [-22.5609, 17.0658] },
  { name: "Niamey", coords: [13.5116, 2.1254] },
  { name: "Abuja", coords: [9.0765, 7.3986] },
  { name: "Kigali", coords: [-1.9441, 30.0619] },
  { name: "Sao Tome", coords: [0.3365, 6.7273] },
  { name: "Dakar", coords: [14.7167, -17.4677] },
  { name: "Victoria", coords: [-4.6191, 55.4513] },
  { name: "Freetown", coords: [8.4657, -13.2317] },
  { name: "Mogadishu", coords: [2.0469, 45.3182] },
  { name: "Pretoria", coords: [-25.7479, 28.2293] },
  { name: "Juba", coords: [4.8594, 31.5713] },
  { name: "Khartoum", coords: [15.5007, 32.5599] },
  { name: "Dodoma", coords: [-6.163, 35.7516] },
  { name: "Tunis", coords: [36.8065, 10.1815] },
];

function updateMapUI(weatherData) {
  const locationName = weatherData.location?.name || "Ville";
  const current = weatherData.current || {};
  const forecastDay = weatherData.forecast?.forecastday?.[0]?.day || {};

  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  };

  setText("map-info-city", locationName);
  setText("map-info-status", getConditionLabel(current.condition));
  setText("map-info-temp", `${Math.round(current.temp_c ?? 0)}°`);
  setText("map-info-humidity", `${current.humidity ?? "--"}%`);
  setText("map-info-wind", `${Math.round(current.wind_kph ?? 0)} km/h`);
  setText("map-info-uv", current.uv ?? "--");
  setText("map-info-max", `Max ${Math.round(forecastDay.maxtemp_c ?? 0)}°`);
  setText("map-info-min", `Min ${Math.round(forecastDay.mintemp_c ?? 0)}°`);
  setText("map-hero-updated", formatLastUpdated(current.last_updated));

  const errorElement = document.getElementById("map-error-message");
  if (errorElement) {
    errorElement.textContent = "";
  }

  const badge = document.getElementById("map-update-badge");
  if (badge) {
    badge.classList.remove("is-visible");
    void badge.offsetWidth;
    badge.classList.add("is-visible");
  }
}

function setupLeafletMap() {
  if (!mapContainer || !window.L) return null;

  const mapInstance = L.map(mapContainer, {
    zoomControl: true,
    scrollWheelZoom: false,
  }).setView([4.5, 20], 3.4);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 6,
    minZoom: 2,
    attribution: "&copy; OpenStreetMap",
  }).addTo(mapInstance);

  mapInstance.whenReady(() => {
    if (mapLoadingOverlay) {
      mapLoadingOverlay.style.display = "none";
    }
  });

  cityCoordinates.forEach((city) => {
    const marker = L.circleMarker(city.coords, {
      radius: 6,
      color: "#38BDF8",
      fillColor: "#38BDF8",
      fillOpacity: 0.9,
    }).addTo(mapInstance);

    marker.bindTooltip(city.name, { direction: "top" });
    marker.on("click", () => {
      if (mapSearchInput) {
        mapSearchInput.value = city.name;
      }
      getWeatherByCity(city.name)
        .then((data) => {
          updateMapUI(data);
          const iconUrl = getConditionIconUrl(data.current?.condition);
          const temp = Math.round(data.current?.temp_c ?? 0);
          const label = getConditionLabel(data.current?.condition);
          marker.bindPopup(
            `<div><strong>${city.name}</strong><br>${temp}° — ${label}<br><img src=\"${iconUrl}\" alt=\"\" /></div>`
          ).openPopup();
        })
        .catch(() => {
          const errorElement = document.getElementById("map-error-message");
          if (errorElement) {
            errorElement.textContent = "Ville introuvable ou problème réseau.";
          }
        });
    });
  });

  const countElement = document.getElementById("map-hero-cities-count");
  if (countElement) {
    countElement.textContent = cityCoordinates.length;
  }

  return mapInstance;
}

function handleMapSearch() {
  if (!mapSearchInput) return;
  const runSearch = (city) => {
    if (mapRefreshButton) {
      mapRefreshButton.disabled = true;
    }
    return getWeatherByCity(city)
      .then(updateMapUI)
      .catch(() => {
        const errorElement = document.getElementById("map-error-message");
        if (errorElement) {
          errorElement.textContent = "Ville introuvable ou problème réseau.";
        }
      })
      .finally(() => {
        if (mapRefreshButton) {
          mapRefreshButton.disabled = false;
        }
      });
  };

  mapSearchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && mapSearchInput.value.trim()) {
      const city = mapSearchInput.value.trim();
      runSearch(city);
    }
  });

  if (mapRefreshButton) {
    mapRefreshButton.addEventListener("click", () => {
      const city = mapSearchInput.value.trim() || defaultCity;
      runSearch(city);
    });
  }
}

setupLeafletMap();

getWeatherByCity(defaultCity)
  .then(updateMapUI)
  .catch(() => {
    console.warn("Impossible de charger la météo. Vérifie la clé API.");
  });

handleMapSearch();
