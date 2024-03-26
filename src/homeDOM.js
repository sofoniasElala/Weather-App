import { format, isBefore, subHours, addHours } from "date-fns";
import * as icons from './iconsToImport';
import full from './full.png';

function findIcon(id){
    const iconPairs = [[1, 2], [3, 4], [6, 7], [13, 14], [15, 26], [16, 17], [20, 21, 43, 44], [23, 25, 29, 19], [33, 34], [38, 35, 36], [39, 40], [41, 42]];
    let iconId = id;
    iconPairs.forEach(pairs => {
        // eslint-disable-next-line prefer-destructuring
        if(pairs.includes(id)) iconId = pairs[0];
    })

    return iconId;

}

function getCorrectForecastDate(date){
    const hourDiff = Number(format(Date.now(), "H")) > 7 ? Number(format(Date.now(), "h")) - 7 : 0;
    const timeToConvert = addHours(date, hourDiff);

    console.log('hourDiff', hourDiff);
    console.log('timeToConvert', timeToConvert);

    return timeToConvert;
}

function populateHourly(hourlyData, TodaysForecast, TomorrowsForecast, isDay, locationTimeZone){
    const hourly = document.querySelector('.hourly-12');
    hourly.innerHTML = '';
    let sunStatAdded = false;
    const timeZoneFormatter = Intl.DateTimeFormat("en-US", { dateStyle: 'medium', timeStyle: 'medium', timeZone: locationTimeZone });
    // eslint-disable-next-line no-nested-ternary
    const sunTime = isDay ? TodaysForecast.Sun.Set : (isBefore(new Date (timeZoneFormatter.format(new Date(hourlyData[0].DateTime))).toISOString(), new Date (timeZoneFormatter.format(new Date(TodaysForecast.Sun.Rise))).toISOString()) ? TodaysForecast.Sun.Rise :TomorrowsForecast.Sun.Rise);
    const sunTimeAdjusted = new Date (timeZoneFormatter.format(new Date(sunTime))).toISOString();
    console.log('hourly', sunTimeAdjusted);

    hourlyData.forEach((hour, index) => {
        const hourTime = new Date (timeZoneFormatter.format(new Date(hour.DateTime))).toISOString();
        if(!sunStatAdded && isBefore(sunTimeAdjusted, hourTime)) {
        sunStatAdded = true;
        const hourData = document.createElement('div');
        hourData.classList.add('hr');
        if(index !== 11) hourData.style.borderRightStyle = 'solid';
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
        currentTemp.textContent = `${hour.Temperature.Value}°`;

        hourData.appendChild(currentTime);
        hourData.appendChild(icon);
        hourData.appendChild(currentTemp);
        hourly.appendChild(hourData);
    } )
}

function populateDays(dailyForecasts, locationTimeZone){
    const days = document.querySelector('.days-5');
    days.innerHTML = '';
    const timeZoneFormatter = Intl.DateTimeFormat("en-US", { dateStyle: 'medium', timeStyle: 'medium', timeZone: locationTimeZone });
    dailyForecasts.forEach((forecast, index) => {
console.log('time zone', new Date (timeZoneFormatter.format(new Date(forecast.Date))).toISOString())
        const dayData = document.createElement('div');
        dayData.classList.add('day');
        const dayName = document.createElement('p');
        dayName.textContent = index === 0 ? `Today` : format(new Date (timeZoneFormatter.format(new Date(getCorrectForecastDate(forecast.Date)))).toISOString(), "ccc");
        dayName.classList.add('days-name');
        const icon = document.createElement('img');
        icon.classList.add('days-icon');
        icon.src = icons[`icon${findIcon(forecast.Day.Icon)}`];
        const low = document.createElement('p');
        low.textContent = `${forecast.Temperature.Minimum.Value}° F`;
        low.classList.add('days-temp');
        const shortPhrase = document.createElement('p');
        shortPhrase.textContent = forecast.Day.ShortPhrase;
        shortPhrase.classList.add('short-phrase');
        const high = document.createElement('p');
        high.textContent = `${forecast.Temperature.Maximum.Value}° F`;
        high.classList.add('days-temp');

        dayData.appendChild(dayName);
        dayData.appendChild(icon);
        dayData.appendChild(low);
        dayData.appendChild(shortPhrase);
        dayData.appendChild(high);
        days.appendChild(dayData);
    })

}
function changeColorOnIndex(type, element, category){
    const qualityColor = [['Good', '#68BA17'], ['Moderate', '#ffea00'], ['Unhealthy sensitive', '#ff7b00'], ['Unhealthy', '#ff0000'], ['Very unhealthy', '#d80032'], ['Hazardous', '#450920']];
    const uvColor = [['Low', '#68BA17'], ['Moderate', '#ffea00'], ['High', '#ff7b00'], ['Very High', '#ff0000']]

    if(type === 'air'){
        qualityColor.forEach(pair => {
            // eslint-disable-next-line prefer-destructuring, no-param-reassign
            if(pair[0] === category) element.style.backgroundColor = pair[1];
        })
    }
    if(type === 'uv'){
        uvColor.forEach(pair => {
            // eslint-disable-next-line prefer-destructuring, no-param-reassign
            if(pair[0] === category) element.style.backgroundColor = pair[1];
        })
    }

    
}

function uvIndex(current){
    const uv = document.querySelector('.uv-index');
    uv.innerHTML = '<p class="title">UV INDEX</p>';
    const value = document.createElement('p');
    value.classList.add('value');
    value.textContent = current.UVIndex;
    const category = document.createElement('p');
    category.classList.add('category');
    category.textContent = current.UVIndexText;

    uv.appendChild(value);
    uv.appendChild(category);
    changeColorOnIndex('uv', uv, category.textContent);
}

function airQuality(TodaysForecast){
    const quality = document.querySelector('.air-quality');
    quality.innerHTML = '<p class="title">AIR QUALITY INDEX</p>';
    const value = document.createElement('p');
    value.classList.add('value');
    value.textContent = TodaysForecast.AirAndPollen[0].Value;
    const category = document.createElement('p');
    category.classList.add('category');
    category.textContent = TodaysForecast.AirAndPollen[0].Category;

    quality.appendChild(value);
    quality.appendChild(category);
    changeColorOnIndex('air', quality, category.textContent);
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
    const windElement = document.querySelector('.wind');
    windElement.innerHTML = '<p class="title">WIND</p>';
    const value = document.createElement('p');
    value.classList.add('value');
    value.textContent = `${Math.round(TodaysForecast.Wind.Speed.Imperial.Value)} MPH`;
    const direction = document.createElement('p');
    direction.classList.add('category');
    direction.textContent = TodaysForecast.Wind.Direction.English;

    windElement.appendChild(value);
    windElement.appendChild(direction);
}

function visibility(TodaysForecast){
    const visible = document.querySelector('.visibility');
    visible.innerHTML = '<p class="title">VISIBILITY</p>';
    const valueElement = document.createElement('p');
    valueElement.classList.add('value');
    const value = TodaysForecast.Visibility.Imperial.Value;
    valueElement.textContent = `${value} MI`;
    const shortDesc = document.createElement('p');
    shortDesc.classList.add('shortDesc');
   if(value >= 3 && value <= 6) shortDesc.textContent = 'Fairly clear';
   if(value > 6) shortDesc.textContent = 'Perfectly clear';
   if(value <= 3 && value >= 2) shortDesc.textContent = 'Haze';
   if(value < 2) shortDesc.textContent = 'Fog';

    visible.appendChild(valueElement);
    visible.appendChild(shortDesc);
}

function pressure(TodaysForecast){
    const pressureElement = document.querySelector('.pressure');
    pressureElement.innerHTML = '<p class="title">PRESSURE</p>';
    const value = document.createElement('p');
    value.classList.add('value');
    value.textContent = `${Math.round(TodaysForecast.Pressure.Imperial.Value)} inHg`;
    const category = document.createElement('p');
    category.classList.add('category');
    category.textContent = TodaysForecast.PressureTendency.LocalizedText;

    pressureElement.appendChild(value);
    pressureElement.appendChild(category);
}

function feelsLike(TodaysForecast){
    const feels = document.querySelector('.feels-like');
    feels.innerHTML = '<p class="title">FEELS LIKE</p>';
    const value = document.createElement('p');
    value.classList.add('value');
    value.textContent = `${TodaysForecast.RealFeelTemperature.Imperial.Value}° F`;
    const category = document.createElement('p');
    category.classList.add('category');
    category.textContent = TodaysForecast.RealFeelTemperature.Imperial.Phrase;

    feels.appendChild(value);
    feels.appendChild(category);
}

function precipitation(TodaysForecast){
    const precipitationElement = document.querySelector('.precipitation');
    precipitationElement.innerHTML = '<p class="title">PRECIPITATION</p>';
    const value = document.createElement('p');
    value.classList.add('value');
    value.textContent = `${TodaysForecast.PrecipitationSummary.Past6Hours.Imperial.Value}in`;
    const shortDesc = document.createElement('p');
    shortDesc.classList.add('shortDesc');
    shortDesc.textContent = 'in the last 6hrs';

    precipitationElement.appendChild(value);
    precipitationElement.appendChild(shortDesc);
}

function moonPhase(isDayTime){
    const moon = document.querySelector('.moon');
    moon.innerHTML = '';
    const icon = document.createElement('img');
    icon.classList.add('moon-icon');
    icon.src = full;
    const container = document.createElement('div');
    container.classList.add('moon-container');
    const detailsContainer = document.createElement('div');
    const phase = document.createElement('p');
    phase.textContent = `${'WAXING GIBBOUS'}`;
    const lineBreak = document.createElement('hr');
    lineBreak.style.width = '195px';
    const setOrRise = document.createElement('p');
    setOrRise.textContent = isDayTime ? `Moonrise: ${'7 PM'}` : `Moonset: ${'6 AM'}`;
    
    detailsContainer.appendChild(phase);
    detailsContainer.appendChild(lineBreak);
    detailsContainer.appendChild(setOrRise);
    container.appendChild(detailsContainer);
    container.appendChild(icon)

    moon.appendChild(container);
}

function populateCurrent(city, current){
    const locationName = document.querySelector('#location-name');
    // locationName.innerHTML = '';
    locationName.textContent = city;
    const locationTemp = document.querySelector('#location-temp');
    locationTemp.style.display = 'flex';
    locationTemp.innerHTML = '';
    const locationTempValue = document.createElement('div');
    locationTempValue.textContent = `${current.Temperature.Imperial.Value}° | `;
    const icon = document.createElement('img');
    icon.src = icons[`icon${findIcon(current.WeatherIcon)}`];
    icon.classList.add('hours-icon');
    locationTemp.appendChild(locationTempValue);
    locationTemp.appendChild(icon);
    const locationDesc = document.querySelector('#location-temp-description');
    // locationDesc.innerHTML = '';
    locationDesc.textContent = current.WeatherText;
}

export default function populateWithData(current, hourly, fiveDays, city, timeZone){
    populateCurrent(city, current[0]);
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
    moonPhase(current[0].IsDayTime);
}