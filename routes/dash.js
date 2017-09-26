const express = require('express');
const router = express.Router();
const controller = require('../controllers/dashController');

router.get('/', controller.index);
router.post('/', controller.create_post);

module.exports = router;
