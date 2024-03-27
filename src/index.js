import {getWeatherDataByLocation as getWeatherDataAPI, addressAutofill} from "./weatherAPIhandler";
import "./main.css";
import "./modifiedMapboxSearchBar.css";
import {populateWithData as populate, changeUnit} from "./homeDOM";
// getWeatherDataByLocation('manchester');


class App {
    #unit = 'f';
    #locationWeather
    #geocoder

    start(){
        // this.getWeatherData({center: [-80.843124, 35.227085], text: 'Charlotte', place_name: 'Charlotte, North Carolina, United States'})
        document.getElementById('change-unit').onclick = () => {
            changeUnit(this.#unit);
            this.#unit = this.#unit === 'f' ? 'c' : 'f';
        }
        this.#geocoder = addressAutofill();
        this.#geocoder.on("result", (e) => {
            this.getWeatherData(e.result); // center is an array with the coordinates of selected location in search
            document.querySelector('.mapboxgl-ctrl-geocoder--input').value = '';
            console.log(e.result);
        });
    }

    // eslint-disable-next-line camelcase
    async getWeatherData({center, text, place_name}){
        try {
        this.#locationWeather = await getWeatherDataAPI(center);
       // this.print();
       populate(this.#locationWeather.Data[0], this.#locationWeather.Data[2], this.#locationWeather.Data[1], text, this.#locationWeather.TimeZone, place_name);
        } catch(err){
            console.log(err)
        }
    }

    print(){
        const current = this.#locationWeather.Data[0];
        const fiveDay = this.#locationWeather.Data[1];
        const hourly = this.#locationWeather.Data[2];
        
        console.log(current[0].Temperature.Imperial.Value, current[0].WeatherText, current[0].RelativeHumidity);
        console.log(fiveDay.DailyForecasts[0].AirAndPollen[0].Value, fiveDay.DailyForecasts[0].Temperature.Minimum.Value, fiveDay.DailyForecasts[0].Temperature.Maximum.Value);
        console.log(hourly[0].DateTime, hourly[0].Temperature.Value, hourly[0].PrecipitationProbability);
        
       // console.log("all", current, fiveDay, hourly);
    }
}

const app = new  App();
app.start();
// populate();