require('dotenv').config()
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Users = require('../models/Users');


// user authentication
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        // Check if the user exists
        console.log(username);
        const user = await Users.findOne({ username });
        console.log(user);
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        // Check the password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            console.log('no password');
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        // Generate a JWT
        const token = jwt.sign({ username: user.username, userId: user._id, role: user.role }, process.env.SECRET_KEY, {
            expiresIn: '1h', // Set the token to expire in 1 hour
        });

        // updates 'lastLogin' to current date
        const mostRecentLogin = new Date();
        await Users.updateOne({ 'username': username }, {'lastLogin': mostRecentLogin});

        res.status(200).json({ token });
        } catch (err) {
        res.status(500).json({ message: err.message });
    }
}