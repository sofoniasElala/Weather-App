import {getWeatherDataByLocation as getWeatherDataAPI, addressAutofill} from "./weatherAPIhandler";
import "./main.css";
import "./modifiedMapboxSearchBar.css";
import {populateWithData as populate, changeUnit} from "./homeDOM";


class App {
    #unit = 'f';
    #locationWeather
    #geocoder

    start(){
        this.getWeatherData({center: [-80.843124, 35.227085], text: 'Charlotte', place_name: 'Charlotte, North Carolina, United States'})
        document.getElementById('change-unit').onclick = () => {
            changeUnit(this.#unit);
            this.#unit = this.#unit === 'f' ? 'c' : 'f';
        }
        this.#geocoder = addressAutofill();
        this.#geocoder.on("result", (e) => {
            this.getWeatherData(e.result); // center is an array with the coordinates of selected location in search
            document.querySelector('.mapboxgl-ctrl-geocoder--input').value = '';
        });
    }

    // eslint-disable-next-line camelcase
    async getWeatherData({center, text, place_name}){
        try {
        this.#locationWeather = await getWeatherDataAPI(center);
       populate(this.#locationWeather.Data[0], this.#locationWeather.Data[2], this.#locationWeather.Data[1], text, this.#locationWeather.TimeZone, place_name);
        } catch(err){
            alert("Unable to get Weather data. Please, try again later. Thank you.");
        }
    }
}

const app = new  App();
app.start();