import {getWeatherDataByLocation as getWeatherDataAPI, addressAutofill} from "./weatherAPIhandler";

// getWeatherDataByLocation('manchester');


class App {
    #searchResult
    #locationWeather
    #geocoder

    start(){
        this.#geocoder = addressAutofill();
        this.#geocoder.on("result", (e) => {
            this.getWeatherData(e.result.center); // center is an array with the coordinates of selected location in search
            console.log(e.result);
        });
    }

    async getWeatherData(location){
        try {
        this.#locationWeather = await getWeatherDataAPI(location);
        this.print();
        } catch(err){
            console.log(err)
        }
    }

    print(){
        const current = this.#locationWeather[0];
        const fiveDay = this.#locationWeather[1];
        const hourly = this.#locationWeather[2];
        
        console.log(current[0].Temperature.Imperial.Value, current[0].WeatherText, current[0].RelativeHumidity);
        console.log(fiveDay.DailyForecasts[0].AirAndPollen[0].Value, fiveDay.DailyForecasts[0].Temperature.Minimum.Value, fiveDay.DailyForecasts[0].Temperature.Maximum.Value);
        console.log(hourly[0].DateTime, hourly[0].Temperature.Value, hourly[0].PrecipitationProbability);
        
       // console.log("all", current, fiveDay, hourly);
    }
}

// const app = new  App();
// app.start();