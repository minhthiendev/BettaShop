var mongoose = require('mongoose');
var schema = mongoose.Schema;
var ad_Schema = new schema({
    username: String,
    password: String
});

var Admin = mongoose.model('Admin', ad_Schema, 'admin');
module.exports = Admin;