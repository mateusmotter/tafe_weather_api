const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Users = require('../models/Users');


exports.view = async (req, res) => {
    try {
        const result = await Users.find();
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Inserts a new value into the users collection
exports.insert = async (req, res) => {
    try {
        const newData = new Users({
            'username': req.body.username,
            'password': req.body.password,
            'role': req.body.role,
            'dateCreated': new Date(),
            'lastLogin': new Date()
            })
        const savedData = await newData.save();

        // Send a success response
        res.status(201).json(savedData);
      } catch (err) {
        // Handle errors and send an error response
        res.status(500).json({ message: err.message });
      }
}

// delete user by username
exports.delete = async (req, res) => {
    const deleteUser = req.params.username;
    try {
        const isUserInDatabase = await Users.findOne({username: deleteUser});
        if (!isUserInDatabase) {
            return res.status(404).json({message: 'User not found'})
        }
        await Users.deleteOne({username: deleteUser});
        res.status(200).json({message: 'User deleted successfully'});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// delete all users that logged in last between the given dates
exports.deleteMany = async (req, res) => {

    try {
        const startDate = req.params.start_date;
        const endDate = req.params.end_date;

        console.log(`start date : ${startDate} end date : ${endDate}`)
        // Ensure both parameters are provided
        if (!startDate || !endDate) {
          return res.status(400).json({ message: 'Both dates are required.' });
        }
    
        // Parse dates into a Date objects
        const queryStartDate = new Date(startDate);
        const queryEndDate = new Date(endDate);

        // delete all 'User' users that have not logged in with the provided date range
        await Users.deleteMany({
            role: "User",
            lastLogin: { $gte: queryStartDate, $lte: queryEndDate }
        });
        res.status(200).json({message: 'Users deleted successfully'});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

exports.updateAccessLevel = async (req, res) => {
    try {
        const startDate = req.params.start_date;
        const endDate = req.params.end_date;
        const newAccessLevel = req.body.role;

        // Ensure both parameters are provided
        if (!startDate || !endDate || !newAccessLevel) {
          return res.status(400).json({ message: 'Both dates and role are required.' });
        }
    
        // Parse dates into a Date objects
        const queryStartDate = new Date(startDate);
        const queryEndDate = new Date(endDate);

        await Users
        .updateMany({ dateCreated: { $gte: queryStartDate, $lte: queryEndDate }},
            {'role': newAccessLevel});

        res.status(201).json({message: 'Users access level successfully updated'});


    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}