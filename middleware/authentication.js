var Customers = require('../models/customer');
module.exports.checkLoginForCus = function(req, res, next) {

    if (!req.signedCookies) {
        res.redirect('/signin');
        return;
    } else {
        Customers.findOne({ _id: req.signedCookies.cookieId }, (err, u) => {
            if (!u) {
                res.redirect('/signin');
            } else {
                next();
            }
        });
    }
};