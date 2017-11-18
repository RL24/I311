const express = require('express');
const router = express.Router();
const controller = require('../controllers/homeController');

router.get('/', controller.index);
router.get('/help/user', controller.help_user);
router.get('/help/dev', controller.help_dev);

module.exports = router;
