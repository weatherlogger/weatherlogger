const container = document.querySelector('.container');
const search = document.querySelector('.search-box button');
const weatherbox = document.querySelector('.weather-box');
const weatherdetail = document.querySelector('.weather-detail');
const error404 = document.querySelector('.not-found');


search.addEventListener('click', () => { 
    const APIKey = '7d402635234b6496bdfeae4fd9a60f36';
    const city = document.querySelector('.search-box input').value;
    if (city === '') return;

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${APIKey}`)
        .then(response => response.json())
        .then(json => {
            
            if(json.cod == '404') {
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

            weatherbox.style.display = '';
            weatherdetail.style.display = '';
        });
});
