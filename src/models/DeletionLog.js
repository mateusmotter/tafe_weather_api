const mongoose = require('mongoose');

// Define the schema for your "deletionLog" collection
const deletionLogSchema = new mongoose.Schema({
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
  '_id': String,
  'Deleted Date': Date,
  'Deleted By': String
});

// Create a model for your "deletionLog" collection
const DeletionLog = mongoose.model('DeletionLog', deletionLogSchema, 'deletionLog');

module.exports = DeletionLog;