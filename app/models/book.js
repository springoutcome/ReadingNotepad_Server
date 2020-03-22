var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BookSchema = new Schema({
    user_id: String,
    date: String,
    title: {type: String, required: true},
    auther: String,
    category: String,
    photo: String,
    impression: String
});

module.exports = mongoose.model('Book', BookSchema);