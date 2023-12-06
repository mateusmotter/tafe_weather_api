const mongoose = require('mongoose');
const express = require('express')
const router = express.Router()
const sensorDataController = require('../controllers/sensorDataController');
const isTeacher = require('../middleware/isTeacher');
const isUser = require('../middleware/isUser');
const isSensor = require('../middleware/isSensor');


router.get('/sensor-data/:id', isUser, sensorDataController.view);
router.post('/sensor-data', isSensor, sensorDataController.insert);
router.post('/sensor-data/multiple', isSensor, sensorDataController.insertMultiple);
router.get('/precipitation/:sensorName', isUser, sensorDataController.precipitation);
router.get('/data-by-date/:sensorName/:date', isUser, sensorDataController.dataByDate);
router.get('/max-temp/:startDate/:endDate', isUser, sensorDataController.maxTemp);
router.put('/sensor-data/update-precipitation/:id', isTeacher, sensorDataController.updatePrecipitation);
router.delete('/sensor-data/:id', isTeacher, sensorDataController.delete);


module.exports = router;
