var express = require('express');
var router = express.Router();
var ctrl = require('../controllers/Ctrl_customer');
var middleware = require('../middleware/authentication');

router.get('/', ctrl.home);

router.get('/products', ctrl.products);
router.get('/products_details/:id', ctrl.Pro_details);
router.get('/search', ctrl.search)

router.get('/add/:id', ctrl.add_to_cart);
router.get('/cart', ctrl.cart);
router.get('/delete_order/:id', ctrl.delete_order);
router.get('/plush/:id', ctrl.plush);
router.get('/subtract/:id', ctrl.subtract);


router.get('/contact', ctrl.contact);
router.post('/contact', ctrl.conform_contact);

router.get('/signin', ctrl.signIn);
router.post('/login', ctrl.login);
router.get('/signup', ctrl.signUp);
router.post('/signup', ctrl.register);
router.get('/info/:id', ctrl.info);
router.post('/update_info/:id', ctrl.update_info);

router.get('/checkout', middleware.checkLoginForCus, ctrl.checkout);
router.post('/conform-checkout', ctrl.conform_checkout);

module.exports = router;