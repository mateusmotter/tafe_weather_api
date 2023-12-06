const mongoose = require('mongoose');
const express = require('express')
const router = express.Router()
const usersController = require('../controllers/usersController');


router.get('/', usersController.view);
router.post('/', usersController.insert);
router.delete('/:username', usersController.delete);
router.delete('/delete-by-date/:start_date/:end_date', usersController.deleteMany);
router.put('/update/:start_date/:end_date', usersController.updateAccessLevel);

module.exports = router;