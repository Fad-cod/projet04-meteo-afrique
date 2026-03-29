const compareInputs = [
  document.getElementById("compare-city-one"),
  document.getElementById("compare-city-two"),
  document.getElementById("compare-city-three"),
  document.getElementById("compare-city-four"),
  document.getElementById("compare-city-five"),
];
const compareRefreshButton = document.getElementById("compare-refresh-button");

function setCompareText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function updateCompareCard(index, weatherData) {
  const current = weatherData.current || {};
  const cityName = weatherData.location?.name || "--";
  setCompareText(`compare-city-${index}-name`, cityName);
  setCompareText(`compare-city-${index}-status`, getConditionLabel(current.condition));
  const iconElement = document.getElementById(`compare-city-${index}-icon`);
  if (iconElement) {
    iconElement.src = getConditionIconUrl(current.condition);
    iconElement.alt = getConditionLabel(current.condition);
  }
  setCompareText(`compare-city-${index}-temp`, `${Math.round(current.temp_c ?? 0)}°`);
  setCompareText(`compare-city-${index}-humidity`, `${current.humidity ?? "--"}%`);
  setCompareText(`compare-city-${index}-wind`, `${Math.round(current.wind_kph ?? 0)} km/h`);
  setCompareText(`compare-city-${index}-uv`, current.uv ?? "--");
}

function updateCompareSummary(results) {
  if (!results.length) return;

  let hottest = results[0];
  let mostHumid = results[0];

  results.forEach((item) => {
    if ((item.temp ?? 0) > (hottest.temp ?? 0)) {
      hottest = item;
    }
    if ((item.humidity ?? 0) > (mostHumid.humidity ?? 0)) {
      mostHumid = item;
    }
  });

  setCompareText("compare-hero-count", results.length);
  setCompareText("compare-hero-hottest", hottest.name || "--");
  setCompareText("compare-hero-humid", mostHumid.name || "--");
}

function fetchAndCompare() {
  const cityNames = compareInputs
    .map((input) => (input ? input.value.trim() : ""))
    .filter((value) => value);

  const defaultCities = ["Lagos", "Dakar", "Nairobi", "Accra", "Tunis"];
  const finalCities = cityNames.length ? cityNames : defaultCities;

  return Promise.all(
    finalCities.map((city, index) =>
      getWeatherByCity(city)
        .then((data) => ({ index, data }))
        .catch(() => ({ index, data: null }))
    )
  ).then((responses) => {
    const summary = [];
    let lastUpdated = "";
    let hasError = false;
    responses.forEach((response) => {
      if (!response.data) {
        hasError = true;
        return;
      }
      const { index, data } = response;
      updateCompareCard(index, data);
      summary.push({
        name: data.location?.name,
        temp: data.current?.temp_c,
        humidity: data.current?.humidity,
      });
      if (!lastUpdated && data.current?.last_updated) {
        lastUpdated = data.current.last_updated;
      }
    });
    updateCompareSummary(summary);
    if (lastUpdated) {
      setCompareText("compare-hero-updated", formatLastUpdated(lastUpdated));
    }
    const errorElement = document.getElementById("compare-error-message");
    if (errorElement) {
      errorElement.textContent = hasError ? "Une ou plusieurs villes sont introuvables." : "";
    }
  });
}

compareInputs.forEach((input) => {
  if (!input) return;
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      fetchAndCompare();
    }
  });
});

if (compareRefreshButton) {
  compareRefreshButton.addEventListener("click", () => {
    compareRefreshButton.disabled = true;
    fetchAndCompare().finally(() => {
      compareRefreshButton.disabled = false;
    });
  });
}

fetchAndCompare();
