const WEATHER_API_KEY = "c8c40ed355f14baba29144139262703";
const WEATHER_API_BASE = "https://api.weatherapi.com/v1";
const WEATHER_CACHE_TTL_MS = 10 * 60 * 1000;

const conditionTextMap = {
  "sunny": "Ensoleillé",
  "clear": "Ciel dégagé",
  "partly cloudy": "Partiellement nuageux",
  "cloudy": "Nuageux",
  "overcast": "Couvert",
  "mist": "Brume",
  "fog": "Brouillard",
  "freezing fog": "Brouillard givrant",
  "patchy rain possible": "Averses possibles",
  "patchy snow possible": "Neige possible",
  "patchy sleet possible": "Neige fondue possible",
  "patchy freezing drizzle possible": "Bruine verglaçante possible",
  "thundery outbreaks possible": "Orages possibles",
  "blowing snow": "Neige soufflée",
  "blizzard": "Blizzard",
  "patchy light drizzle": "Bruine faible par endroits",
  "light drizzle": "Bruine faible",
  "freezing drizzle": "Bruine verglaçante",
  "heavy freezing drizzle": "Bruine verglaçante forte",
  "patchy light rain": "Pluie faible par endroits",
  "light rain": "Pluie faible",
  "moderate rain at times": "Pluie modérée par moments",
  "moderate rain": "Pluie modérée",
  "heavy rain at times": "Forte pluie par moments",
  "heavy rain": "Forte pluie",
  "light freezing rain": "Pluie verglaçante faible",
  "moderate or heavy freezing rain": "Pluie verglaçante modérée ou forte",
  "light sleet": "Neige fondue faible",
  "moderate or heavy sleet": "Neige fondue modérée ou forte",
  "patchy light snow": "Neige faible par endroits",
  "light snow": "Neige faible",
  "patchy moderate snow": "Neige modérée par endroits",
  "moderate snow": "Neige modérée",
  "patchy heavy snow": "Forte neige par endroits",
  "heavy snow": "Forte neige",
  "ice pellets": "Grésil",
  "light rain shower": "Averse faible",
  "moderate or heavy rain shower": "Averse modérée ou forte",
  "torrential rain shower": "Averse torrentielle",
  "light sleet showers": "Averses de neige fondue faibles",
  "moderate or heavy sleet showers": "Averses de neige fondue modérées ou fortes",
  "light snow showers": "Averses de neige faibles",
  "moderate or heavy snow showers": "Averses de neige modérées ou fortes",
  "light showers of ice pellets": "Averses de grésil faibles",
  "moderate or heavy showers of ice pellets": "Averses de grésil modérées ou fortes",
  "patchy light rain with thunder": "Pluie faible avec orages",
  "moderate or heavy rain with thunder": "Pluie modérée ou forte avec orages",
  "patchy light snow with thunder": "Neige faible avec orages",
  "moderate or heavy snow with thunder": "Neige modérée ou forte avec orages",
};

function getWeatherByCity(cityName) {
  const cached = getCachedWeather(cityName);
  if (cached) {
    return Promise.resolve(cached);
  }

  const endpoint = `${WEATHER_API_BASE}/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(cityName)}&days=3&aqi=no&alerts=no`;
  return fetch(endpoint).then((response) => {
    if (!response.ok) {
      throw new Error("Impossible de charger la météo.");
    }
    return response.json().then((data) => {
      setCachedWeather(cityName, data);
      return data;
    });
  });
}

function getConditionLabel(condition) {
  if (!condition) return "--";
  const text = (condition.text || "").toLowerCase();
  if (conditionTextMap[text]) {
    return conditionTextMap[text];
  }
  return condition.text || "--";
}

function getConditionIconUrl(condition) {
  if (!condition || !condition.icon) return "";
  if (condition.icon.startsWith("//")) {
    return `https:${condition.icon}`;
  }
  return condition.icon;
}

function formatLastUpdated(lastUpdated) {
  if (!lastUpdated) return "--";
  const timePart = lastUpdated.split(" ")[1];
  return timePart ? `Mis à jour à ${timePart}` : "Mis à jour récemment";
}

function getCacheKey(cityName) {
  return `weather_cache_${cityName.trim().toLowerCase()}`;
}

function getCachedWeather(cityName) {
  try {
    const raw = localStorage.getItem(getCacheKey(cityName));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.timestamp || !parsed.data) return null;
    if (Date.now() - parsed.timestamp > WEATHER_CACHE_TTL_MS) {
      return null;
    }
    return parsed.data;
  } catch (error) {
    return null;
  }
}

function setCachedWeather(cityName, data) {
  try {
    localStorage.setItem(
      getCacheKey(cityName),
      JSON.stringify({ timestamp: Date.now(), data })
    );
  } catch (error) {
    // ignore cache errors
  }
}
