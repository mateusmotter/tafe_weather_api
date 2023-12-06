const mongoose = require('mongoose');

// Define the schema for your "sensorData" collection
const sensorDataSchema = new mongoose.Schema({
  'Device Name': String,
  'Precipitation mm/h': Number,
  Time: Date,
  Latitude: Number,
  Longitude: Number,
  'Temperature (°C)': Number,
  'Atmospheric Pressure (kPa)': Number,
  'Max Wind Speed (m/s)': Number,
  'Solar Radiation (W/m2)': Number,
  'Vapor Pressure (kPa)': Number,
  'Humidity (%)': Number,
  'Wind Direction (°)': Number,
});

// Create a model for your "sensorData" collection
const SensorData = mongoose.model('SensorData', sensorDataSchema, 'sensorData');

module.exports = SensorData;