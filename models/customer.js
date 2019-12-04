var mongoose = require('mongoose');
var schema = mongoose.Schema;
var cus_Schema = new schema({
    name: String,
    email: String,
    tel: String,
    password: String
});

var customers = mongoose.model('customers', cus_Schema);
module.exports = customers;