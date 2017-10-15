const express = require('express');
const router = express.Router();
const controller = require('../controllers/postsController');

router.get('/hide/:id', controller.hide);
router.get('/hidden/clear', controller.clearHidden);
router.get('/display/:id/:display', controller.display);
router.get('/delete/:id', controller.delete);
router.post('/:id/comments/get', controller.getComments);
router.post('/:id/comments/add', controller.addComment);

module.exports = router;
