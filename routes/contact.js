const express = require('express');
const router = express.Router();
const controller = require('../controllers/contactController');

router.get('/add', controller.add);
router.get('/remove/:id', controller.remove);

router.post('/add', controller.add_post);

module.exports = router;
