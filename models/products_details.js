var mongoose = require('mongoose');
var schema = mongoose.Schema;
var pro_Schema = new schema({
    productId: String,
    gender: String,
    color: String
});
var products_details = mongoose.model('products_details', pro_Schema);
module.exports = products_details;