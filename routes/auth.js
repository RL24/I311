const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');

router.get('/register', controller.register);
router.get('/login', controller.login);
router.get('/logout', controller.logout);
router.get('/terminate', controller.terminate);

router.post('/register', controller.register_post);
router.post('/login', controller.login_post);

module.exports = router;
