const express = require('express');
const router = express.Router();
const controller = require('../controllers/apiController');

router.post('/user/:id', controller.getUserByUid);

module.exports = router;
