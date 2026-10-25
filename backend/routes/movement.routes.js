const router = require('express').Router();
const controller = require('../controllers/movement.controller');

router.get('/', controller.list);

module.exports = router;
