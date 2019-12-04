var Products = require('../models/products');
var Products_details = require('../models/products_details');
var Orders = require('../models/orders');
var Customer = require('../models/customer');
var Contact = require('../models/contact');
var url = require('url');
var ids = require('short-id');
var md5 = require('md5');
var message = '';
var ch = '';
var arr;
/*------------home-------------*/
function home(req, res, next) {
    if (req.session.cus) {
        ch = req.session.cus.email.slice(0, 1).toUpperCase();
    }
    Products.find({}, function(err, docs) {
        if (err) throw err;
        if (docs) {
            res.status(200).render('index', {
                products: docs,
                char: ch,
                sess: req.session.cart,
                cus: req.session.cus
            });
        }
    })
};
/*------------End home-------------*/

/*------------Products-------------*/
function products(req, res, next) {
    Products.find({}, function(err, docs) {
        if (err) throw err;
        if (!docs) {
            res.status(200).render('pages/products/products', { message: " This shop is empty !!!" });
            return;
        } else {
            var page = parseInt(req.query.page) || 1;
            var array;
            if (arr) {
                array = arr.slice((page - 1) * 12, page * 12);
                var total_page = 0;
                if (arr.length % 12 == 0) {
                    total_page = Math.floor(arr.length / 12);
                } else {
                    total_page = Math.floor((arr.length / 12) + 1);
                }
            } else {
                array = docs.slice((page - 1) * 12, page * 12);
                var total_page = 0;
                if (docs.length % 12 == 0) {
                    total_page = Math.floor(docs.length / 12);
                } else {
                    total_page = Math.floor((docs.length / 12) + 1);
                }
            }
            res.status(200).render('pages/products/products', {
                products: array,
                total_page: total_page,
                step: page,
                sess: req.session.cart,
                cus: req.session.cus,
                char: ch
            });
            arr = null;
        };
    });
};

function Pro_details(req, res, next) {
    Products.findOne({ productId: req.params.id }, function(err, docs) {
        if (err) throw err;
        if (docs) {
            res.status(200).render('pages/products/products-details', {
                products: docs,
                char: ch,
                sess: req.session.cart,
                cus: req.session.cus
            });
        }
    });

};

function search(req, res) {
    var str = req.query.title.toLowerCase();
    Products.find({}, function(err, docs) {
        if (err) throw err;
        if (docs) {
            arr = docs.filter(function(x) {
                return (x.title.toLowerCase().includes(str) === true);
            })
            res.redirect('/products')
        }
    })
}
/*------------End products-------------*/
/*------------Cart-------------*/
function Cart(oldCart) {
    this.items = oldCart.items || {};
    this.totalQty = oldCart.totalQty || 0;
    this.totalPrice = oldCart.totalPrice || 0;

    this.add = function(item, id) {
        var storedItem = this.items[id];
        if (!storedItem) {
            storedItem = this.items[id] = { item: item, qty: 0, price: 0 };
        }
        if (storedItem.qty < storedItem.item.quantity) {
            storedItem.qty++;
            storedItem.price = storedItem.item.price * storedItem.qty;
            this.totalQty++;
            this.totalPrice += storedItem.item.price;
        }
    };
    this.generateArray = function() {
        var arr = [];
        for (var id in this.items) {
            arr.push(this.items[id]);
        }
        return arr;
    };
};

function add_to_cart(req, res, next) {
    let productId = req.params.id;
    let cart = new Cart(req.session.cart ? req.session.cart : {});
    Products.findOne({ productId: productId }, function(err, product) {
        if (err) throw err;
        if (product) {
            cart.add(product, product.id);
            req.session.cart = cart;
            res.redirect(`/products_details/${product.productId}`);
        }
    });
};

function cart(req, res, next) {
    if (!req.session.cart) {
        res.render('pages/cart/cart', {
            products: null,
            sess: req.session.cart,
            cus: req.session.cus
        });
    } else {
        var cart = new Cart(req.session.cart);

        res.render('pages/cart/cart', {
            products: cart.generateArray(),
            totalPrice: cart.totalPrice,
            sess: req.session.cart,
            char: ch,
            cus: req.session.cus
        });
    }
};

function plush(req, res) {
    var new_cart = new Cart(req.session.cart);
    for (let x of new_cart.generateArray()) {
        if (req.params.id === x.item._id) {
            if (x.qty < x.item.quantity) {
                x.qty++;
                x.price = x.item.price * x.qty;
                new_cart.totalQty++;
                new_cart.totalPrice += x.item.price;
            }
        }
    }
    req.session.cart = new_cart;
    res.redirect('/cart');
}

function subtract(req, res) {
    var new_cart = new Cart(req.session.cart);
    for (let x of new_cart.generateArray()) {
        if (req.params.id === x.item._id) {
            if (x.qty > 1) {
                x.qty--;
                x.price = x.item.price * x.qty;
                new_cart.totalQty--;
                new_cart.totalPrice -= x.item.price;
            }
        }
    }
    req.session.cart = new_cart;
    res.redirect('/cart');
}

function delete_order(req, res, next) {
    var new_cart = new Cart(req.session.cart);
    for (let x of new_cart.generateArray()) {
        if (req.params.id === x.item._id) {
            x.price = x.item.price * x.qty;
            new_cart.totalQty -= x.qty;
            new_cart.totalPrice -= x.price;
            delete new_cart.items[req.params.id];
        }
    }
    if (new_cart.totalPrice <= 0) {
        req.session.cart = null;
        res.redirect('/cart');
    } else {
        req.session.cart = new_cart;
        res.redirect('/cart');
    }
}
/*------------End cart-------------*/
/*------------Contact-------------*/
function contact(req, res, next) {
    res.status(200).render('pages/contact/contact', {
        sess: req.session.cart,
        char: ch,
        cus: req.session.cus
    });
};

function conform_contact(req, res, next) {
    Contact.insertMany([{
        name: req.body.name,
        tel: req.body.tel,
        email: req.body.email,
        comments: req.body.comments
    }], function(err, docs) {
        if (err) throw err;
        if (docs) {
            res.status(200).redirect('/contact');
        }
    });
};
/*------------End contact-------------*/
/*------------Sign in, sign up-------------*/
function signIn(req, res, next) {
    res.status(200).render('pages/customersManage/signIn', {
        message: message
    });
    message = '';
};

function login(req, res, next) {
    Customer.findOne({ email: req.body.email }, function(err, doc) {
        if (doc) {
            if (doc.password === md5(req.body.pass)) {
                req.session.cus = doc;
                console.log(req.session.cus)
                res.cookie('cookieId', doc._id, { signed: true, });
                res.redirect('/');
            } else {
                message = 'password is not correct!!!';
                res.redirect('/signin');
            }
        } else {
            message = 'Email is not exist !!!';
            res.redirect('/signin');
        }
    })
};

function register(req, res, next) {
    Customer.findOne({ email: req.body.email }, function(err, doc) {
        if (!doc) {
            if (req.body.repeat_pass !== req.body.pass) {
                message = "two pass is not merged";
                res.redirect('/signup')
                return;
            }
            Customer.insertMany([{
                name: req.body.name,
                email: req.body.email,
                tel: req.body.tel,
                password: md5(req.body.pass)
            }], function(err, docs) {
                if (docs) {
                    message = 'successfully'
                    res.redirect('/signin')
                }
            });
        } else {
            message = "email is existed !!!";
            res.redirect('/signup')
        }
    })
};

function signUp(req, res, next) {
    res.status(200).render('pages/customersManage/signUp', { message: message });
    message = '';
};

function info(req, res, next) {
    Customer.findOne({ _id: req.params.id }, function(err, doc) {
        if (err) throw err;
        if (doc) {
            res.status(200).render('pages/customersManage/info', {
                message: message,
                sess: req.session.cart,
                cus: req.session.cus,
                doc: doc,
                char: ch
            });
        }
    });
};

function update_info(req, res, next) {
    Customer.updateOne({ _id: req.params.id }, {
        email: req.body.email,
        name: req.body.name,
        tel: req.body.tel,
        password: md5(req.body.pass)
    })

};

/*------------End Sign in, Sign up-------------*/
/*------------Check out-------------*/
function checkout(req, res, next) {
    res.status(200).render('pages/cart/checkout', {
        sess: req.session.cart,
        char: ch,
        cus: req.session.cus
    });
};


function conform_checkout(req, res, next) {

    var y = new Cart(req.session.cart);
    y.generateArray().forEach(function(x) {
        Products.update({ _id: x.item._id }, { quantity: x.item.quantity - x.qty }, function(err, raw) {
            console.log(raw);
        });
    })
    Orders.insertMany([{
        _id: ids.generate(),
        customerId: req.session.cus._id,
        products: y.generateArray(),
        receiver: req.body.name,
        receiverTel: req.body.tel,
        Address: req.body.address,
        note: req.body.note
    }], function(err, docs) {
        if (docs) {
            req.session.cart = null;
            res.redirect('/cart')
        }
    })
};
/*------------End check out-------------*/

module.exports = {
    home: home,
    contact: contact,
    signIn: signIn,
    login: login,
    register: register,
    signUp: signUp,
    checkout: checkout,
    conform_checkout: conform_checkout,
    cart: cart,
    products: products,
    add_to_cart: add_to_cart,
    Pro_details: Pro_details,
    plush: plush,
    subtract: subtract,
    delete_order: delete_order,
    conform_contact: conform_contact,
    search: search,
    info: info,
    update_info: update_info
};