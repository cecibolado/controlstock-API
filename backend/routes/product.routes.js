const router = require('express').Router();
const controller = require('../controllers/product.controller');
router.route('/').post(controller.create).get(controller.list);
router.route('/:id').get(controller.getById).put(controller.update).delete(controller.remove);
router.patch('/:id/stock', controller.adjustStock);
module.exports = router;