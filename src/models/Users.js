const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


// Define the schema for your "users" collection
const usersSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: {
      type: String,
      enum: ['Teacher', 'User', 'Sensor'],
    },
    dateCreated: Date,
    lastLogin: Date
});

// Hash the password before saving
usersSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
      user.password = await bcrypt.hash(user.password, 10);
    }
    next();
  });

// Create a model for "users" collection
const Users = mongoose.model('Users', usersSchema, 'users');

module.exports = Users;