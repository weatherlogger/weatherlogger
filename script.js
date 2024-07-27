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

let weatherChart = {label:[], data:[]};


const ctx = document.getElementById('lineChart').getContext('2d');
const lineChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: weatherChart.label,
        datasets: [{
            label: 'Perivous 15 Day Weather',
            data:  weatherChart.data,
            fill: true,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Weather Logger Data Visualization'
            }
        }
    }
});

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
            chartdata();
        });
}

async function chartdata(){
        const city = cityInput.value;
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed, so add 1
        const day = String(currentDate.getDate()).padStart(2, '0');
        
        const start = `${year}-${month}-${day}`;
        console.log('Current date:', start);
        
        const day_15 = new Date();
        day_15.setDate(day_15.getDate() - 14); // Modifies day_15 to 15 days ago
        
        const year_end = day_15.getFullYear(); // Use day_15 directly, as it is already updated
        const month_end = String(day_15.getMonth() + 1).padStart(2, '0'); // Get month
        const day_end = String(day_15.getDate()).padStart(2, '0'); // Get day
        const end = `${year_end}-${month_end}-${day_end}`; // Correct template string syntax
        
        console.log(end);

        // Fetch data from the API
        const response = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}/${end}/${start}?unitGroup=metric&include=days&key=YNXNFVLXP2DBEH3N5AB8Z69Z4&contentType=json`);
        const data = await response.json();
        if (data.days && Array.isArray(data.days)) {
            data.days.forEach(day => {
                weatherChart.label.push(day.datetime); // Assuming chart.js or similar library, use 'labels' not 'label'
                weatherChart.data.push(day.windspeed);
            });
        } else {
            console.error("Unexpected data structure:", data);
        }
        console.log(weatherChart);
        lineChart.update();
        
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
    }, 5000);
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
    link.setAttribute('download', 'weather_data_Every_5_seconds.csv');
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
  
  document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');

    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });

    // Optional: Close the sidebar when clicking outside of it
    window.addEventListener('click', function(event) {
        if (!sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
            sidebar.classList.remove('active');
        }
    });
});

// --------------------------------------------------------------------




// -----------------------------------------------------------

document.getElementById('downloadCsv').addEventListener('click', async (event) => {
    event.preventDefault();  // Prevent the default anchor behavior

    try {
        const city = cityInput.value;
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed, so add 1
        const day = String(currentDate.getDate()).padStart(2, '0');
        
        const start = `${year}-${month}-${day}`;
        console.log('Current date:', start);
        
        const day_15 = new Date();
        day_15.setDate(day_15.getDate() - 14); // Modifies day_15 to 15 days ago
        
        const year_end = day_15.getFullYear(); // Use day_15 directly, as it is already updated
        const month_end = String(day_15.getMonth() + 1).padStart(2, '0'); // Get month
        const day_end = String(day_15.getDate()).padStart(2, '0'); // Get day
        const end = `${year_end}-${month_end}-${day_end}`; // Correct template string syntax
        
        console.log(end);

        // Fetch data from the API
        const response = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}/${end}/${start}?unitGroup=metric&include=days&key=YNXNFVLXP2DBEH3N5AB8Z69Z4&contentType=json`);
        const data = await response.json();
        console.log(data);
        // Extract relevant data from the API response
        const monthMapping = {
            '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
            '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug',
            '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec'
        };
        const weatherData = data.days.map(day => {
            // Split the 'YYYY-MM-DD' string into an array of [Year, Month, Day]
            const [year, month, dayNum] = day.datetime.split('-');
            const monthName = monthMapping[month];
            // Return the desired object with Month, Day, and Year
            return {
                Month: monthName, // e.g., '07' for July
                Day: dayNum,  // e.g., '13'
                Year: year,    // e.g., '2024'
                'Wind Speed': day.windspeed,
            };
        });

        // Convert data to CSV format
        const csv = convertToCSV(weatherData);

        // Create a Blob from the CSV string
        const blob = new Blob([csv], { type: 'text/csv' });

        // Create a link element
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'weather_data.csv';

        // Append the link to the document body
        document.body.appendChild(a);

        // Programmatically click the link to trigger the download
        a.click();

        // Remove the link from the document
        document.body.removeChild(a);
    } catch (error) {
        console.error('Error fetching data or creating CSV:', error);
    }
    
});



function convertToCSV(data) {
    const array = [Object.keys(data[0])].concat(data);

    return array.map(row => {
        return Object.values(row).map(value => `"${value}"`).join(',');
    }).join('\n');
}
