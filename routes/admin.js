var express = require('express');
var router = express.Router();
var ctrl = require('../controllers/Ctrl_admin');
var upload = require('../middleware/uploads');

router.get('/', ctrl.load);
router.get('/search', ctrl.search);

router.get('/sort', ctrl.sort);

router.get('/login', ctrl.login);
router.post('/login', ctrl.check_login);

router.get('/signup', ctrl.signup);
router.post('/signup', ctrl.check_signup);

router.get('/orders', ctrl.orders);
router.get('/order_resolve/:id', ctrl.resolve);
router.get('/order_reject/:id', ctrl.reject);
router.get('/ordersDetails/:id', ctrl.orderDetails);

router.get('/contact', ctrl.contact);

router.get('/add-product', ctrl.load_add_product);
router.post('/add-product', upload.upload_img, ctrl.post_add_product);
router.get('/edit-product/:id', ctrl.edit_product);
router.post('/edit/:id', upload.upload_img, ctrl.edit);
router.get('/delete-products/:id', ctrl.delete_products);
module.exports = router;