var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    email: {type: String, required: true, unique: true},
    password: String,
    salt: String,
    name: {type: String, required: true}
});

module.exports = mongoose.model('User', UserSchema);