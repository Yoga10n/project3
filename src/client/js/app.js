import { backend_callback_url_switch } from "./helpers";
import { postData } from "./helpers";
import { date_diff_indays } from "./helpers";

let all_data = {}
let c_data = {}

function magic() {
    const city = document.getElementById('city').value
    geoname(city).then(() => {
        weatherbit(city).then(() => {
            pixabay(city).then(() => {
                consolidate(all_data, c_data, city).then(() => {
                    postData(backend_callback_url_switch('/add'), all_data).then(() => {
                        c_data = {}
                        all_data = {}
                        updateUI()
                    })
                })
            })

        })

    })
};

const consolidate = async(data1, data2, city) => {
    data1[city] = data2;
}
const updateUI = async() => {
    const travelday = document.getElementById('travelday');
    const request = await fetch(backend_callback_url_switch('/all'));

    try {
        const data = await request.json();
        const trips_section = document.getElementById('trips')
        for (let acity of Object.keys(data)) {

            let trip = `<div class='trip_card' id='card'>
                        <div id="city_img">
                        <img src="${data[acity].pixabay_image}" alt="${acity}">
                        </div>
                        <div id='basic_info'>
                            <div id='city'><span>City: </span>${acity}</div>
                            <div id='Country'><span>Country: </span>${data[acity].geoname.countryName}</div>
                            <div id='long'><span>Longitude: </span>${data[acity].geoname.lng}</div>
                            <div id='lat'><span>Latitude: </span>${data[acity].geoname.lat}</div>
                        </div>
                        <div id='weather_info'>
                        <h2>Weather</h2>
                            <div id='day1'>
                                <div id='description'><span>Description: </span>${data[acity].weather_bit_data.weather.description}</div>
                                <div id='temp'><span>Temprature: </span>${data[acity].weather_bit_data.temp}</div>
                            </div>
                        </div>
                    </div>`
            trips_section.insertAdjacentHTML('beforeend', trip);
        }
    } catch (e) {
        document.getElementById('error').innerHTML = 'Sorry some error occured'
    }
};
const getdata = async(baseurl) => {
    const res = await fetch(baseurl)
    try {
        const data = await res.json();
        return data;
    } catch (e) {
        console.log("error", e);
    }
};

const geoname = async(query) => {
    const baseurl = `http://api.geonames.org/searchJSON?q=${query}&maxRows=1&username=sandeep2194`;
    try {
        await getdata(baseurl).then((data) => {
            c_data['geoname'] = data.geonames[0]
        })
    } catch (e) {
        all_data[query] = {
            type: 'geoname',
            error: "yes",
            error_name: e.name,
            error_message: e.message
        }

    }
};

const weatherbit = async(city) => {
    const weather_bit_api_key = "c71b0c35541642f496f87d3b9841d49f"
    const baseurl = `http://api.weatherbit.io/v2.0/forecast/daily/?days=1&city=${city}&key=${weather_bit_api_key}`;
    try {
        await getdata(baseurl).then((data) => {
            c_data['weather_bit_data'] = data.data[0]

        })
    } catch (e) {
        all_data[city] = {
            type: 'weather_bit_data',
            error: "yes",
            error_name: e.name,
            error_message: e.message
        }

    }
};

const pixabay = async(city) => {
    const pixabay_api_key = "10508829-a311f765d5edbcbe236b9574b"
    const baseurl = `https://pixabay.com/api/?key=${pixabay_api_key}&q=${city}`;
    try {
        await getdata(baseurl).then((data) => {
            c_data['pixabay_image'] = data.hits[0].webformatURL
        })
    } catch (e) {
        all_data[city] = {
            type: 'pixabay_image',
            error: "yes",
            error_name: e.name,
            error_message: e.message
        }

    }
};


export { magic };