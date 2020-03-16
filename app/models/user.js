var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    email: {type: String, required: true, unique: true},
    password: String,
    salt: String,
    name: String
});

module.exports = mongoose.model('User', UserSchema);