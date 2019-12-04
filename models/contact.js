var mongoose = require('mongoose');
var schema = mongoose.Schema;
var contact_schema = new schema({
    name: String,
    tel: String,
    email: String,
    comments: String
});

var Contact = mongoose.model('Contact', contact_schema);
module.exports = Contact;