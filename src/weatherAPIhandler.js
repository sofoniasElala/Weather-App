import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import mapboxgl from "mapbox-gl";

// geoPosition is array of latitude and longitude, on geoPosition[1], and gePosition[0] respectively
async function getWeatherDataByLocation(geoPosition) {
  const API_KEY = process.env.CRED;
  const API_KEY_2 = process.env.CRED1;

  try {
    const cityLocationResponse = await fetch(
      `http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=${API_KEY_2}&q=${geoPosition[1]},${geoPosition[0]}&toplevel=true`,
      {
        mode: "cors",
      }
    );
    console.log("cityLocationResponse: ", cityLocationResponse);

    const cityLocationResponseData = cityLocationResponse.ok
      ? await cityLocationResponse.json()
      : new Error(cityLocationResponse.status);

    if (cityLocationResponseData instanceof Error)
      throw cityLocationResponseData;
    console.log("cityLocationResponseData: ", cityLocationResponseData);

    const currentConditionResponse = fetch(
      `http://dataservice.accuweather.com/currentconditions/v1/${cityLocationResponseData.Key}?apikey=${API_KEY_2}&details=true`,
      {
        mode: "cors",
      }
    );
    const fiveDayForecastResponse = fetch(
      `http://dataservice.accuweather.com/forecasts/v1/daily/5day/${cityLocationResponseData.Key}?apikey=${API_KEY_2}&details=true`,
      {
        mode: "cors",
      }
    );
    const hourlyForecastResponse = fetch(
        `http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/${cityLocationResponseData.Key}?apikey=${API_KEY_2}&details=true`,
        {
          mode: "cors",
        }
      );

    const allWeatherResponse = await Promise.all([
      currentConditionResponse,
      fiveDayForecastResponse,
      hourlyForecastResponse,
    ]);

    const allWeatherResponseData =
      allWeatherResponse[0].ok && allWeatherResponse[1].ok && allWeatherResponse[2].ok
        ? await Promise.all([
            allWeatherResponse[0].json(),
            allWeatherResponse[1].json(),
            allWeatherResponse[2].json(),
          ])
        : new Error('Unable to get weather data ', allWeatherResponse[0].status, allWeatherResponse[1].status, allWeatherResponse[2].status);


    if (allWeatherResponseData instanceof Error)
      throw allWeatherResponseData;
    console.log("allWeatherResponseData: ", allWeatherResponseData);

    return {Data: allWeatherResponseData, TimeZone: cityLocationResponseData.TimeZone.Name};

  } catch (err) {
    alert(err);

    return err;
  }
}

function addressAutofill() {
  mapboxgl.accessToken =
    process.env.MAPBOX_CRED;
  const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    types: "place",
    mapboxgl,
  });
  geocoder.addTo("#geocoder-container");

  return geocoder;
}

export { getWeatherDataByLocation, addressAutofill };
