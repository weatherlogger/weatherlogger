from flask import Flask, request, jsonify
import requests
from datetime import datetime, timedelta

app = Flask(__name__)

# Replace 'YOUR_API_KEY' with your actual OpenWeatherMap API key
API_KEY = '7d402635234b6496bdfeae4fd9a60f36'
BASE_URL = 'http://api.openweathermap.org/data/2.5/weather'
ONE_CALL_URL = 'http://api.openweathermap.org/data/2.5/onecall/timemachine'

def get_city_coordinates(city):
    params = {
        'q': city,
        'appid': API_KEY
    }
    response = requests.get(BASE_URL, params=params)
    data = response.json()
    if response.status_code != 200:
        return None, data.get('message', 'Error fetching city coordinates')

    return data['coord'], None

@app.route('/weather', methods=['GET'])
def get_weather():
    city = request.args.get('city')
    if not city:
        return jsonify({'error': 'City parameter is required'}), 400

    params = {
        'q': city,
        'appid': API_KEY,
        'units': 'metric'  # Use 'imperial' for Fahrenheit
    }

    response = requests.get(BASE_URL, params=params)
    data = response.json()

    if response.status_code != 200:
        return jsonify({'error': data.get('message', 'Error fetching weather data')}), response.status_code

    weather_info = {
        'city': data['name'],
        'temperature': data['main']['temp'],
        'description': data['weather'][0]['description'],
        'humidity': data['main']['humidity'],
        'wind_speed': data['wind']['speed']
    }

    return jsonify(weather_info)

@app.route('/weather/history', methods=['GET'])
def get_historical_weather():
    city = request.args.get('city')
    if not city:
        return jsonify({'error': 'City parameter is required'}), 400

    coords, error = get_city_coordinates(city)
    if error:
        return jsonify({'error': error}), 400

    lat, lon = coords['lat'], coords['lon']
    historical_data = []

    for days_ago in range(1, 2):
        dt = int((datetime.utcnow() - timedelta(days=days_ago)).timestamp())
        params = {
            'lat': lat,
            'lon': lon,
            'dt': dt,
            'appid': API_KEY,
            'units': 'metric'  # Use 'imperial' for Fahrenheit
        }

        response = requests.get(ONE_CALL_URL, params=params)
        data = response.json()

        if response.status_code != 200:
            return jsonify({'error': data.get('message', 'Error fetching historical weather data')}), response.status_code

        day_weather = {
            'date': datetime.utcfromtimestamp(dt).strftime('%Y-%m-%d'),
            'temperature': data['current']['temp'],
            'description': data['current']['weather'][0]['description'],
            'humidity': data['current']['humidity'],
            'wind_speed': data['current']['wind_speed']
        }

        historical_data.append(day_weather)

    return jsonify({'city': city, 'historical_data': historical_data})

if __name__ == '__main__':
    app.run(debug=True)