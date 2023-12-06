require('dotenv').config()
const mongoose = require('mongoose');
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const SensorData = require('../models/SensorData');
const DeletionLog = require('../models/DeletionLog');



// test query
exports.view = async (req, res) => {
  const sensorName = req.params.id.trim();
  console.log('Sensor Name:', sensorName);
    try {
        const result = await SensorData.findOne({ 'Device Name': sensorName });
        console.log('Result:', result);
        if (result === null) {
          return res.status(404).json({message: 'Device not found'});
        }
        res.status(200).json(result);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Inserts a new value into the database
exports.insert = async (req, res) => {
    try {
        const newData = new SensorData({
            'Device Name': req.body.Name,
            'Precipitation mm/h': req.body.Precipitation,
            Time: req.body.Time,
            Latitude: req.body.Latitude,
            Longitude: req.body.Longitude,
            'Temperature (°C)': req.body.Temp,
            'Atmospheric Pressure (kPa)': req.body.Pressure,
            'Max Wind Speed (m/s)': req.body.Wind_max_speed,
            'Solar Radiation (W/m2)': req.body.Radiation,
            'Vapor Pressure (kPa)': req.body.Vapor,
            'Humidity (%)': req.body.Humidity,
            'Wind Direction (°)': req.body.Wind_direction
            })
        const savedData = await newData.save();

        // Send a success response
        res.status(201).json(savedData);
      } catch (err) {
        // Handle errors and send an error response
        res.status(400).json({ message: err.message });
      }
}

// Inserts a new value into the database
exports.insertMultiple = async (req, res) => {
  try {
    // here the map method is used to crate an array of objects, which is suitable for 'insertMany'
    const newSensorData = req.body.map(data => ({
      'Device Name': data.Name,
      'Precipitation mm/h': data.Precipitation,
      Time: data.Time,
      Latitude: data.Latitude,
      Longitude: data.Longitude,
      'Temperature (°C)': data.Temp,
      'Atmospheric Pressure (kPa)': data.Pressure,
      'Max Wind Speed (m/s)': data.Wind_max_speed,
      'Solar Radiation (W/m2)': data.Radiation,
      'Vapor Pressure (kPa)': data.Vapor,
      'Humidity (%)': data.Humidity,
      'Wind Direction (°)': data.Wind_direction
    }));
      const savedData = await SensorData.insertMany(newSensorData);

      // Send a success response
      res.status(201).json(savedData);
    } catch (err) {
      // Handle errors and send an error response
      res.status(400).json({ message: err.message });
    }
}

// handles the request for the maximum precipitation in the last 5 months for a specific sensor
exports.precipitation = async (req, res) => {
  try {

    const { sensorName } = req.params;

    //calculate the date 5 months ago
    const fiveMonthsAgo = new Date();
    fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);
    console.log(fiveMonthsAgo);

    const result = await SensorData
    .find({
      'Device Name': sensorName,
      Time: { $gte: fiveMonthsAgo },
      'Precipitation mm/h': { $exists: true, $ne: null }
    })
    .sort({ 'Precipitation mm/h': -1 })
    .limit(1)
    //selects only the values indicated below. Comment the below line if you want to send all values from the returned reading
    .select({'Device Name': 1, 'Time': 1, 'Precipitation mm/h': 1});

    if (result.length === 0) {
      return res.status(404).json({ message: 'No data found for the specified sensor in the last 5 months.' });
    }

    return res.status(200).json(result[0]);
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
};

// handles the request for data from a specific sensor at a given date and time
exports.dataByDate = async (req, res) => {
  try {

    const { sensorName, date } = req.params;

    // Ensure both parameters are provided
    if (!sensorName || !date) {
      return res.status(400).json({ message: 'Both sensorName and date are required.' });
    }

    // Parse dateTime into a Date object
    const queryDateTime = new Date(date);

    // Find data for the specified station, date, and time
    const result = await SensorData.findOne({
      'Device Name': sensorName,
      Time: queryDateTime,
    }).select({
      'Temperature (°C)': 1,
      'Atmospheric Pressure (kPa)': 1,
      'Solar Radiation (W/m2)': 1,
      'Precipitation mm/h': 1,
    });

    if (!result) {
      return res.status(404).json({ message: 'No data found for the specified station, date, and time.' });
    }

    res.status(200).json(result);
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
};

// handles de request for the maximum temperature for each sensor over a provided date range
exports.maxTemp = async (req, res) => {
  try {

    const { startDate, endDate } = req.params;

    // Ensure both parameters are provided
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Both dates are required.' });
    }

    // Parse dates into a Date objects
    const queryStartDate = new Date(startDate);
    const queryEndDate = new Date(endDate);

    // Perform the aggregation to find the maximum temperature for each sensor
    const result = await SensorData.aggregate([
      {
        $match: {
          Time: { $gte: queryStartDate, $lte: queryEndDate },
          'Temperature (°C)': { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$Device Name',
          maxTemperature: { $max: '$Temperature (°C)' },
          maxTemperatureTime: { $first: '$Time' }
        }
      },
      {
        $project: {
          _id: 0,
          'Device Name': '$_id',
          Time: '$maxTemperatureTime',
          'Temperature (°C)': '$maxTemperature'
        }
      },
      {
        $sort: { 'Temperature (°C)': -1 }
      }
    ]);

    if (result.length === 0) {
      return res.status(404).json({ message: 'No data found for the specified date range.' });
    }

    res.status(200).json(result);
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
};

// update the precipitation value of en entry by its id
exports.updatePrecipitation = async (req, res) => {
  try {
    const { id } = req.params;
    const { "Precipitation mm/h": newPrecipitationValue } = req.body;

    // Validate input
    if (!id || !newPrecipitationValue) {
      return res.status(400).json({ message: 'Both entryId and newPrecipitationValue are required.' });
    }

    const updatedItem = await SensorData.findByIdAndUpdate(
      id,
      { $set: { 'Precipitation mm/h': newPrecipitationValue } },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Entry not found.' });
    }

    // Send a success response
    res.status(200).json(updatedItem);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.delete = async (req, res) => {
  const deleteReadingId = req.params.id;
  //grabs JWT values to identify user deleting the entry
  const authHeader = req.headers['authorization'];
  const token = authHeader.split(' ')[1];

  try {
      // sets 'username' variable with value in the token
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      const username = decoded.username;
      
      const sensorDataDocument = await SensorData.findById(deleteReadingId);

      if (!sensorDataDocument) {
        return res.status(404).json({message: 'Reading not found'});
      }

      // adds reading to be deleted to DeletionLog
      const deletionLogDocument = new DeletionLog(sensorDataDocument.toObject());

      deletionLogDocument['Deleted Date'] = new Date();
      deletionLogDocument['Deleted By'] = username;

      // saves value to deletionLog collection
      await deletionLogDocument.save();

      await SensorData.findByIdAndDelete(deleteReadingId);

      res.status(200).json(deletionLogDocument);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}