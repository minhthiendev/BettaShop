var Orders = require('../models/orders');
var customer = require('../models/customer');
var Products = require('../models/products');
var Admin = require('../models/model_admin');
var Contacts = require('../models/contact');
var md5 = require('md5');
var fs = require('fs');
var message = '';
var arr = null;
var check = null;
var status = 'waiting';


/* ------home -------*/
function load(req, res, next) {
    Products.find({}, function(err, docs) {
        if (!docs) {
            res.status(200).render('admin/home', { message: ' shop is really empty' });
        } else {
            if (!arr) {
                arr = docs;
            }
            res.status(200).render('admin/home', { products: arr });
            arr = null;
        }
    });
}

function search(req, res) {
    var str = req.query.title.toLowerCase();
    Products.find({}, function(err, docs) {
        if (err) throw err;
        if (docs) {
            arr = docs.filter(function(x) {
                return (x.title.toLowerCase().includes(str) === true);
            })
            res.redirect('/admin')
        }
    })
}

function sort(req, res) {
    Products.find({}, function(err, docs) {
        if (!docs) {
            res.status(200).render('admin/home', { message: ' shop is really empty' });
        } else {
            arr = docs.sort((a, b) => {
                if (req.body.option1 === '1') {
                    return a.price - b.price;
                }
                if (req.body.option1 === '2') {
                    return a.name - b.name;
                }
                if (req.body.option1 === '3') {
                    return a.quantity - b.quantity;
                }
            });
            res.status(200).redirect('/admin');
        }
    });
}
/* ------End home -------*/
/* ------ Sign in, Sign up -------*/
function login(req, res, next) {
    res.status(200).render('admin/login/login', { message: message });
    message = '';
}

function signup(req, res, next) {
    res.status(200).render('admin/login/signup', { message: message });
    message = '';
}

function check_login(req, res, next) {
    Admin.find({ username: req.body.user_signin, password: md5(req.body.pass_signin) }, function(err, docs) {
        if (docs) {
            res.redirect('/admin');
        } else {
            message = 'Wrong info !';
            res.redirect('/admin/login');
        }
    })
};

function check_signup(req, res, next) {
    Admin.find({ username: req.body.user_signin }, function(err, docs) {
        if (docs) {
            message = 'User is existed !!!';
            res.redirect('/admin/signup');
        } else {
            Admin.insertMany([{
                username: req.body.user_signup,
                password: md5(req.body.pass_signup),

            }]).then(function(err, docs) {
                if (docs) {
                    alert('Successfully !!');
                    res.redirect('/admin');
                }
            })
        }
    })
};
/* ------ End Sign in, Sign up -------*/

/* ------ Orders -------*/
function orders(req, res, next) {
    Orders.find({}, function(err, docs) {
        if (err) throw err;
        if (!docs) {
            res.status(200).render('admin/orders/order', { message: "you have no orders" });
            return;
        } else {
            let count = 0;
            let sum = [];
            for (let x of docs) {
                let z = 0;
                for (let y of x.products) {

                    z += y.price;
                }
                sum.push(z);
                count++;
            }
            let totalprice = sum.reduce(function(a, b) {
                return a + b;
            }, 0);
            let step = 0;
            res.status(200).render('admin/orders/order', {
                orders: docs,
                sum: sum,
                totalprice: totalprice,
                count: count,
                i: step,
                check: check,
                status: status
            });
        }
    })
};

function orderDetails(req, res, next) {
    Orders.findOne({ _id: req.params.id }, function(err, doc) {
        if (err) throw err;
        if (doc) {
            let sum = 0;
            for (let x of doc.products) {
                sum += x.price;
            }
            res.status(200).render('admin/orders/order_details', { order: doc, sum: sum, products: doc.products });
        }
    })
};

function resolve(req, res) {
    check = req.params.id;
    status = 'resolved';
    res.redirect('/admin/orders');
}

function reject(req, res) {
    check = req.params.id;
    status = 'rejected';
    res.redirect('/admin/orders');
}
/* ------ End Orders -------*/
/* ------ Contact -------*/
function contact(req, res, next) {
    Contacts.find({}, function(err, docs) {
        if (err) throw err;
        if (docs) {
            res.status(200).render('admin/contact/contact', { contacts: docs });
        }
    })
};
/* ------ End Contact -------*/

/* ------ Products -------*/
function load_add_product(req, res, next) {
    res.status(200).render('admin/products/addpro', { message: message });
    message = '';
};

function post_add_product(req, res, next) {
    if (req.file === undefined) {
        message = "you must choose image file !!";
        res.redirect('/admin/add-product');
    } else {
        var old_path = req.file.path;
        var new_path = req.file.destination + req.file.originalname;
        fs.rename(old_path, new_path, err => {
            if (err) throw err;
        });
    }
    let data = [{
        productId: req.body.id,
        title: req.body.title,
        images: req.file.originalname,
        price: req.body.price,
        quantity: req.body.quantity
    }];
    if (req.body.option === '1') {
        Products.findOne({ productId: req.body.id }, function(err, doc) {
            if (doc) {
                message = 'product is exist!!!';
                res.redirect('/admin/add-product');
            } else {
                Products.insertMany(data, (err, docs) => {
                    if (err) throw err;
                    else
                        res.status(200).render('admin/success');
                })
            }
        })
    }
};

function edit_product(req, res, next) {
    Products.findOne({ productId: req.params.id }, function(err, doc) {
        if (err) throw err;
        if (doc) {
            res.status(200).render('admin/products/edit', { product: doc });
        } else
            res.redirect('/admin')
    })
};

function edit(req, res, next) {

    if (req.file === undefined) {
        Products.update({ productId: req.params.id }, {
            title: req.body.title,
            price: req.body.price,
            quantity: req.body.quantity
        }, function(err, raw) {
            if (raw) {
                res.status(200).render('admin/success');
            }
        });
    } else {
        console.log(req.file);
        var old_path = req.file.path;
        var new_path = req.file.destination + req.file.originalname;
        fs.rename(old_path, new_path, err => {
            if (err) throw err;
        });
        Products.update({ productId: req.params.id }, {
            title: req.body.title,
            images: req.file.originalname,
            price: req.body.price,
            quantity: req.body.quantity
        }, function(err, raw) {
            if (raw) {
                res.status(200).render('admin/success');
            }
        });
    }
};

function delete_products(req, res, next) {
    console.log(req.params.id);
    Products.deleteOne({ productId: req.params.id }, function(err) {
        if (err) throw err;
        res.redirect('/admin');
    });
}
/* ------ End Products -------*/


module.exports = {
    load: load,
    login: login,
    check_login: check_login,
    signup: signup,
    check_signup: check_signup,
    orders: orders,
    contact: contact,
    orderDetails: orderDetails,
    resolve: resolve,
    reject: reject,
    load_add_product: load_add_product,
    post_add_product: post_add_product,
    edit_product: edit_product,
    edit: edit,
    delete_products: delete_products,
    sort: sort,
    search: search
}