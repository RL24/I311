const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');

router.get('/register', controller.register);
router.get('/login', controller.login);
router.get('/forgot_password', controller.forgot_password);
router.get('/logout', controller.logout);

router.post('/register', controller.register_post);
router.post('/login', controller.login_post);
router.post('/forgot_password', controller.forgot_password_post);

module.exports = router;
