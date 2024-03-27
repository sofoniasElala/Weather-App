import { format, isBefore, addHours } from "date-fns";
import * as icons from './iconsToImport';


function convertUnit(unit, valueToConvert){
    if(unit === 'f') return  {convertedValue: Math.round((valueToConvert - 32) * (5/9)), convertedUnit: '°C'};
    if(unit === 'c') return  {convertedValue: Math.round((valueToConvert * (9/5)) + 32), convertedUnit: '°F'};

    return undefined;
}

/** convert the units of elements that have temperature values.
 * the given unit is the current unit of temperature.
 */
function changeUnit(unit){
    const hourlyTemps = document.getElementsByClassName('hourly-temp');
    Array.from(hourlyTemps).forEach(temp => {
        temp.textContent = `${convertUnit(unit, Number(temp.textContent.match(/\d+(\.\d+)?/g)[0])).convertedValue}°`;
    })
    const boxTemp = document.querySelector('.temp');
    boxTemp.textContent = `${convertUnit(unit, Number(boxTemp.textContent.match(/\d+(\.\d+)?/g)[0])).convertedValue}°`;

    const daysTemp = document.getElementsByClassName('days-temp');
    Array.from(daysTemp).forEach(temp => {
        const convertedDaysTemp = convertUnit(unit, Number(temp.textContent.match(/\d+(\.\d+)?/g)[0]));
        temp.textContent = `${convertedDaysTemp.convertedValue}${convertedDaysTemp.convertedUnit}`
    })

    const locationTemp = document.querySelector('.location-temp-value');
    const convertedLocationTemp = convertUnit(unit, Number(locationTemp.textContent.match(/\d+(\.\d+)?/g)[0]));
    locationTemp.textContent = `${convertedLocationTemp.convertedValue}${convertedLocationTemp.convertedUnit} | `;
    const shortDesc = document.querySelector('.shortDesc');
    shortDesc.textContent = `The dew point is ${convertUnit(unit, Number(shortDesc.textContent.match(/\d+(\.\d+)?/g)[0])).convertedValue}° right now.`;
}

function findIcon(id){
    const iconPairs = [[1, 2], [3, 4], [6, 7], [13, 14], [15, 26], [16, 17], [20, 21, 43, 44], [23, 25, 29, 19], [33, 34], [38, 35, 36], [39, 40], [41, 42]];
    let iconId = id;
    iconPairs.forEach(pairs => {
        if(pairs.includes(id)) iconId = pairs[0];
    })

    return iconId;

}

// adjust date to take in into account the api's unconventional forecasting
function getCorrectForecastDate(date){
    const hourDiff = Number(format(Date.now(), "H")) > 7 ? Number(format(Date.now(), "h")) - 7 : 0;
    const timeToConvert = addHours(date, hourDiff);

    return timeToConvert;
}

// change uv index and air quality index's background color based on their category
function changeColorOnIndex(type, element, category){
    const qualityColor = [['Good', '#68BA17'], ['Moderate', '#ffea00'], ['Unhealthy sensitive', '#ff7b00'], ['Unhealthy', '#ff0000'], ['Very unhealthy', '#d80032'], ['Hazardous', '#450920']];
    const uvColor = [['Low', '#68BA17'], ['Moderate', '#ffea00'], ['High', '#ff7b00'], ['Very High', '#ff0000']]

    if(type === 'air'){
        qualityColor.forEach(pair => {
            if(pair[0] === category) element.style.backgroundColor = pair[1];
        })
    }
    if(type === 'uv'){
        uvColor.forEach(pair => {
            if(pair[0] === category) element.style.backgroundColor = pair[1];
        })
    }

    
}

// display air quality, uv index, precipitation, humidity...etc.
function createCurrentWeatherDetailWithCategory(elementToRetrieve, innerHTML, valueText, classAttribute, categoryText, extraInfo=['', '']){
    const parentElement = document.querySelector(elementToRetrieve);
    parentElement.innerHTML = innerHTML;
    const value = document.createElement('p');
    value.classList.add('value');
    if(extraInfo[1] !== '') value.classList.add(extraInfo[1]);
    value.textContent = valueText;
    const category = document.createElement('p');
    category.classList.add(classAttribute);
    category.textContent = categoryText;

    parentElement.appendChild(value);
    parentElement.appendChild(category);

    if(extraInfo[0] === 'air') changeColorOnIndex('air', parentElement, category.textContent);
    if(extraInfo[0] === 'uv') changeColorOnIndex('uv', parentElement, category.textContent);
}

// display time and temperature with the appropriate icons for the next 12 hours
function populateHourly(hourlyData, TodaysForecast, TomorrowsForecast, isDay, locationTimeZone){
    const hourly = document.querySelector('.hourly-12');
    hourly.innerHTML = '';
    let sunStatAdded = false;
    const timeZoneFormatter = Intl.DateTimeFormat("en-US", { dateStyle: 'medium', timeStyle: 'medium', timeZone: locationTimeZone });
    const sunTime = isDay ? TodaysForecast.Sun.Set : (isBefore(new Date (timeZoneFormatter.format(new Date(hourlyData[0].DateTime))).toISOString(), new Date (timeZoneFormatter.format(new Date(TodaysForecast.Sun.Rise))).toISOString()) ? TodaysForecast.Sun.Rise :TomorrowsForecast.Sun.Rise);
    const sunTimeAdjusted = new Date (timeZoneFormatter.format(new Date(sunTime))).toISOString();

    hourlyData.forEach((hour, index) => {
        const hourTime = new Date (timeZoneFormatter.format(new Date(hour.DateTime))).toISOString();
        if(!sunStatAdded && isBefore(sunTimeAdjusted, hourTime)) {
        sunStatAdded = true;
        const hourData = document.createElement('div');
        hourData.classList.add('hr');
        hourData.style.borderRightStyle = 'solid';
        const currentTime = document.createElement('p');
        currentTime.textContent = `${format(sunTimeAdjusted, "h:mmaa")}`;
        const icon = document.createElement('img');
        icon.classList.add('hours-icon');
        icon.src = icons[`${isDay ? 'set' : 'rise'}`];
        const sun = document.createElement('p');
        sun.textContent = isDay ? 'SET' : 'RISE';

        hourData.appendChild(currentTime);
        hourData.appendChild(icon);
        hourData.appendChild(sun);
        hourly.appendChild(hourData);
        }
        
        const hourData = document.createElement('div');
        hourData.classList.add('hr');
        if(index !== 11) hourData.style.borderRightStyle = 'solid';
        const currentTime = document.createElement('p');
        currentTime.textContent = `${format(hourTime, "haa")}`;
        const icon = document.createElement('img');
        icon.classList.add('hours-icon');
        icon.src = icons[`icon${findIcon(hour.WeatherIcon)}`];
        const currentTemp = document.createElement('p');
        currentTemp.classList.add('hourly-temp');
        currentTemp.textContent = `${hour.Temperature.Value}°`;

        hourData.appendChild(currentTime);
        hourData.appendChild(icon);
        hourData.appendChild(currentTemp);
        hourly.appendChild(hourData);
    } )
}

// display date, icons, lowest and highest temperature for the next 5 days, today included.
function populateDays(dailyForecasts, locationTimeZone){
    const days = document.querySelector('.days-5');
    days.innerHTML = '';
    const timeZoneFormatter = Intl.DateTimeFormat("en-US", { dateStyle: 'medium', timeStyle: 'medium', timeZone: locationTimeZone });
    dailyForecasts.forEach((forecast, index) => {
        const dayData = document.createElement('div');
        dayData.classList.add('day');
        const dayName = document.createElement('p');
        dayName.textContent = index === 0 ? `Today` : format(new Date (timeZoneFormatter.format(new Date(getCorrectForecastDate(forecast.Date)))).toISOString(), "ccc");
        dayName.classList.add('days-name');
        const icon = document.createElement('img');
        icon.classList.add('days-icon');
        icon.src = icons[`icon${findIcon(forecast.Day.Icon)}`];
        const low = document.createElement('p');
        low.textContent = `${forecast.Temperature.Minimum.Value} °F`;
        low.classList.add('days-temp');
        const shortPhrase = document.createElement('p');
        shortPhrase.textContent = forecast.Day.ShortPhrase;
        shortPhrase.classList.add('short-phrase');
        const high = document.createElement('p');
        high.textContent = `${forecast.Temperature.Maximum.Value} °F`;
        high.classList.add('days-temp');

        dayData.appendChild(dayName);
        dayData.appendChild(icon);
        dayData.appendChild(low);
        dayData.appendChild(shortPhrase);
        dayData.appendChild(high);
        days.appendChild(dayData);
    })

}

function uvIndex(current){
    createCurrentWeatherDetailWithCategory('.uv-index', '<p class="title">UV INDEX</p>', current.UVIndex, 'category', current.UVIndexText, ['uv', '']);
}

function airQuality(TodaysForecast){
    createCurrentWeatherDetailWithCategory('.air-quality', '<p class="title">AIR QUALITY INDEX</p>', TodaysForecast.AirAndPollen[0].Value, 'category', TodaysForecast.AirAndPollen[0].Category, ['air', '']);
}

function humidity(TodaysForecast){
    const humid = document.querySelector('.humidity');
    humid.innerHTML = '<p class="title">HUMIDITY</p>';
    const value = document.createElement('p');
    value.classList.add('value');
    value.textContent = `${TodaysForecast.RelativeHumidity}%`;
    const shortDesc = document.createElement('p');
    shortDesc.classList.add('shortDesc');
    shortDesc.textContent = `The dew point is ${TodaysForecast.DewPoint.Imperial.Value}° right now.`;

    humid.appendChild(value);
    humid.appendChild(shortDesc);
}

function wind(TodaysForecast){
    createCurrentWeatherDetailWithCategory('.wind', '<p class="title">WIND</p>', `${Math.round(TodaysForecast.Wind.Speed.Imperial.Value)} MPH`, 'category', TodaysForecast.Wind.Direction.English);
}

function visibility(TodaysForecast){
    const value = TodaysForecast.Visibility.Imperial.Value;
    let textContent = '';
    
    if(value >= 3 && value <= 6) textContent = 'Fairly clear';
    if(value > 6) textContent = 'Perfectly clear';
    if(value <= 3 && value >= 2) textContent = 'Haze';
    if(value < 2) textContent = 'Fog';

    createCurrentWeatherDetailWithCategory('.visibility', '<p class="title">VISIBILITY</p>', `${value} MI`, 'shortDesc', textContent);
}

function pressure(TodaysForecast){
    createCurrentWeatherDetailWithCategory('.pressure', '<p class="title">PRESSURE</p>', `${Math.round(TodaysForecast.Pressure.Imperial.Value)} inHg`, 'category', TodaysForecast.PressureTendency.LocalizedText);
}

function feelsLike(TodaysForecast){
    createCurrentWeatherDetailWithCategory('.feels-like', '<p class="title">FEELS LIKE</p>', `${TodaysForecast.RealFeelTemperature.Imperial.Value}°`, 'category', TodaysForecast.RealFeelTemperature.Imperial.Phrase, ['', 'temp']);
}

function precipitation(TodaysForecast){
    createCurrentWeatherDetailWithCategory('.precipitation', '<p class="title">PRECIPITATION</p>', `${TodaysForecast.PrecipitationSummary.Past6Hours.Imperial.Value}in`, 'shortDesc', 'in the last 6hrs');
}

// display the moon phase and when the moon sets/rises with the appropriate moon icon
function moonPhase(isDayTime, moonPhaseData, locationTimeZone){
    const moon = document.querySelector('.moon');
    moon.innerHTML = '';
    const timeZoneFormatter = Intl.DateTimeFormat("en-US", { dateStyle: 'medium', timeStyle: 'medium', timeZone: locationTimeZone });
    const icon = document.createElement('img');
    icon.classList.add('moon-icon');
    icon.src = icons[`${moonPhaseData.Phase}`];
    const container = document.createElement('div');
    container.classList.add('moon-container');
    const detailsContainer = document.createElement('div');
    const phase = document.createElement('p');
    phase.textContent = `Phase: ${moonPhaseData.Phase.replace(/([a-z])([A-Z])/g, '$1 $2')}`;
    const lineBreak = document.createElement('hr');
    lineBreak.style.width = '195px';
    const setOrRise = document.createElement('p');
    setOrRise.textContent = isDayTime ? `Moonrise: ${format(new Date (timeZoneFormatter.format(new Date(getCorrectForecastDate(moonPhaseData.Rise)))).toISOString(), "h aa")}` : `Moonset: ${format(new Date (timeZoneFormatter.format(new Date(getCorrectForecastDate(moonPhaseData.Set)))).toISOString(), "h aa")}`;
    
    detailsContainer.appendChild(phase);
    detailsContainer.appendChild(lineBreak);
    detailsContainer.appendChild(setOrRise);
    container.appendChild(detailsContainer);
    container.appendChild(icon)

    moon.appendChild(container);
}

// display current city and temperature with short description and icon
function populateCurrent(city, current, placeName){
    const locationName = document.querySelector('#location-name');
    locationName.textContent = city;
    const locationDetail = document.querySelector('#location-detail');
    locationDetail.textContent = placeName.match(/, (.*)/)[1];
    const locationTemp = document.querySelector('#location-temp');
    locationTemp.style.display = 'flex';
    locationTemp.innerHTML = '';
    const locationTempValue = document.createElement('div');
    locationTempValue.classList.add('location-temp-value')
    locationTempValue.textContent = `${current.Temperature.Imperial.Value}°F | `;
    const icon = document.createElement('img');
    icon.src = icons[`icon${findIcon(current.WeatherIcon)}`];
    icon.classList.add('hours-icon');
    locationTemp.appendChild(locationTempValue);
    locationTemp.appendChild(icon);
    const locationDesc = document.querySelector('#location-temp-description');
    locationDesc.textContent = current.WeatherText;
}

 function populateWithData(current, hourly, fiveDays, city, timeZone, placeName){
    populateCurrent(city, current[0], placeName);
    populateHourly(hourly, fiveDays.DailyForecasts[0], fiveDays.DailyForecasts[1], current[0].IsDayTime, timeZone);
    populateDays(fiveDays.DailyForecasts, timeZone);
    airQuality(fiveDays.DailyForecasts[0]);
    uvIndex(current[0]);
    humidity(current[0]);
    wind(current[0]);
    visibility(current[0]);
    pressure(current[0]);
    feelsLike(current[0]);
    precipitation(current[0]);
    moonPhase(current[0].IsDayTime, fiveDays.DailyForecasts[0].Moon, timeZone);
}

export {populateWithData, changeUnit}