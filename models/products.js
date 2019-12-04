var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var pro_Schema = new Schema({
    productId: String,
    title: String,
    images: String,
    price: Number,
    quantity: Number
});
var products = mongoose.model('products', pro_Schema, 'products');
module.exports = products;