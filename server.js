require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose');
const verifyToken = require('./src/middleware/verifyToken');
const isTeacher = require('./src/middleware/isTeacher');
const cors = require('cors');

mongoose.set('debug', true);

// connect to mongodb database
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true,
});

// Check for connection errors
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
  console.log('Connection state is', mongoose.connection.readyState);
});



app.use(express.json())

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
)


// set up routes
const authRouter = require ('./src/routes/auth')
app.use('/', authRouter);

const usersRouter = require ('./src/routes/users')
app.use('/users', verifyToken, isTeacher, usersRouter);

const sensorDataRouter = require ('./src/routes/sensorData')
app.use('/', verifyToken,  sensorDataRouter);

app.listen(3000, () => console.log('Server Started on port 3000'))