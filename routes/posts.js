const express = require('express');
const router = express.Router();
const controller = require('../controllers/postsController');

router.get('/hide/:id', controller.hide);
router.get('/display/:id/:display', controller.display);
router.get('/delete/:id', controller.delete);

module.exports = router;
