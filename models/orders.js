var mongoose = require('mongoose');
var schema = mongoose.Schema;
var order_Schema = new schema({
    _id: String,
    customerId: String,
    products: Array,
    receiver: String,
    receiverTel: String,
    Address: String,
    note: String,
    status: String

});

var orders = mongoose.model('orders', order_Schema);
module.exports = orders;