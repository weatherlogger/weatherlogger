const container = document.querySelector('.container');
const search = document.querySelector('.search-box button');
const weatherbox = document.querySelector('.weather-box');
const weatherdetail = document.querySelector('.weather-detail');
const error404 = document.querySelector('.not-found');
const cityInput = document.querySelector('.search-box input');
const saveCsvButton = document.getElementById('save-csv');

const APIKey = '7d402635234b6496bdfeae4fd9a60f36';
const lon = 67.0822;
const lat = 24.9056;

let weatherDataEntries = [];

let csvContent = [];

function fetchWeather(city) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${APIKey}`)
        .then(response => response.json())
        .then(json => {
            if (json.cod === '404') {
                container.style.height = '400px';
                weatherbox.classList.remove('active');
                weatherdetail.classList.remove('active');
                error404.classList.add('active');
                return;
            }

            container.style.height = '555px';
            weatherbox.classList.add('active');
            weatherdetail.classList.add('active');
            error404.classList.remove('active');

            const image = document.querySelector('.weather-box img');
            const temperature = document.querySelector('.weather-box .temperature');
            const description = document.querySelector('.weather-box .description');
            const humidity = document.querySelector('.weather-detail .humidity span');
            const wind = document.querySelector('.weather-detail .wind span');
            const dateElement = document.getElementById('date');
            const timeElement = document.getElementById('time');

            switch (json.weather[0].main) {
                case 'Clear':
                    image.src = 'clear.png';
                    break;
                case 'Rain':
                    image.src = 'rain.png';
                    break;
                case 'Snow':
                    image.src = 'snow.png';
                    break;
                case 'Clouds':
                    image.src = 'cloud.png';
                    break;
                case 'Mist':
                case 'Haze':
                    image.src = 'mist.png';
                    break;
                default:
                    image.src = 'cloud.png';
            }

            temperature.innerHTML = `${json.main.temp}°C`;
            description.innerHTML = `${json.weather[0].description}`;
            humidity.innerHTML = `${json.main.humidity}%`;
            wind.innerHTML = `${json.wind.speed} km/h`;
            const timestamp = json.dt * 1000; // Convert to milliseconds
            const date = new Date(timestamp);
            const dateString = date.toLocaleDateString();
            const timeString = date.toLocaleTimeString();

            dateElement.innerText = `Date: ${dateString}`;
            timeElement.innerText = `Time: ${timeString}`;

            weatherbox.style.display = '';
            weatherdetail.style.display = '';

            const weatherData = {
                city: city,
                temperature: json.main.temp,
                description: json.weather[0].description,
                humidity: json.main.humidity,
                wind: json.wind.speed,
                date: dateString,
                time: timeString
            };

            weatherDataEntries.push(weatherData);
        });
}

search.addEventListener('click', () => {
    const city = cityInput.value;
    if (city === '') return;
    fetchWeather(city);
});


// Fetch weather for default city on page load
document.addEventListener('DOMContentLoaded', () => {
    cityInput.value = 'Karachi'; // Set default value to "Karachi"
    fetchWeather('Karachi');
    setInterval(() => {
        if(cityInput.value !== ''){
            fetchWeather(cityInput.value);
        }
    }, 15 * 60 * 1000);
});


saveCsvButton.addEventListener('click', () => {
    if (weatherDataEntries.length === 0) {
        alert('No weather data available to save.');
        return;
    }

    const csvData = [
        ['City', 'Temperature (°C)', 'Description', 'Humidity (%)', 'Wind Speed (km/h)', 'Date', 'Time'],
        ...weatherDataEntries.map(entry => [
            entry.city,
            entry.temperature,
            entry.description,
            entry.humidity,
            entry.wind,
            entry.date,
            entry.time
        ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvData.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'weather_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});



document.getElementById('saveButton').addEventListener('click', function() {
    saveData();
  });
  
  document.getElementById('downloadButton').addEventListener('click', function() {
    downloadCSV();
  });
  
  function saveData() {
    // Get form values
    const date = document.getElementById('datearea').value;
    const time = document.getElementById('timearea').value;
    const speed = document.getElementById('speed').value;
    const direction = document.getElementById('direction').value;

    const weatherData = {
        date: date,
        time: time,
        speed: speed,
        direction: direction
    };

    csvContent.push(weatherData);
    // Simulate saving (you can implement actual saving logic here)
    console.log('Data saved:', csvContent);
    // Clear form fields after saving
    document.getElementById('dataForm').reset();
  }
  
  function downloadCSV() {

    const csvData = [
        ['Date', 'Time', 'Speed', 'Direction'],
        ...csvContent.map(entry => [
            entry.date,
            entry.time,
            entry.speed,
            entry.direction
        ])
    ];

    const save = 'data:text/csv;charset=utf-8,' + csvData.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(save);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  