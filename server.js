var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var port = process.env.PORT || 3000;

var users = require('./app/routes/users');

var mongoose = require('mongoose');

const connectOption = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

//mongoose.connect('mongodb://localhost/ReadingNotepad_Server', connectOption);
mongoose.connect('mongodb://heroku_mmzl4bdb:6bsq28gaf3arclvmpc7dl5qioj@ds139920.mlab.com:39920/heroku_mmzl4bdb', connectOption);

// postデータをjsonで取得できる
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(function(req, res, next) {
    console.log('Something is happening');
    next();
});

/* 文字列を返す */
app.get('/', function(req, res) {
    res.json({ message: 'Successfully Posted a test message.' });
});

app.use('/users', users);


app.listen(port);
console.log('listen on port ' + port);