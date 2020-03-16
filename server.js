var express = require('express');
var app = express();
var crypto = require('crypto');
var bodyParser = require('body-parser');

var User = require('./app/models/user');

var mongoose = require('mongoose');

const connectOption = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

//mongoose.connect('mongodb://localhost/ReadingNotepad_Server', connectOption);
mongoose.connect('mongodb://heroku_mmzl4bdb:6bsq28gaf3arclvmpc7dl5qioj@ds139920.mlab.com:39920/heroku_mmzl4bdb', connectOption);

//PASSWORD ULTILS
//CREATE FUNCTION TO RANDOM SALT
var genRandomString = function(length) {
    return crypto.randomBytes(Math.ceil(length/2))
        .toString('hex') /* convert to hexa format */
        .slice(0, length);
};

var sha512 = function(password, salt) {
    var hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt: salt,
        passwordHash: value
    };
};

function saltHashPassword(userPassword) {
    var salt = genRandomString(16); //Create 16 random character
    var passwordData = sha512(userPassword, salt);
    return passwordData;
}

function checkHashPassword(userPassword, salt) {
    var passwordData = sha512(userPassword, salt);
    return passwordData;
}


// postデータをjsonで取得できる
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var port = process.env.PORT || 3000;

var rooter = express.Router();

rooter.use(function(req, res, next) {
    console.log('Something is happening');
    next();
});

//文字列を返す(GET: http:localhost:3000/api)
rooter.get('/', function(req, res) {
    res.json({ message: 'Successfully Posted a test message.' });
});

rooter.route('/register')
    .post(function(req, res) {
        var post_data = req.body;
        
        var plain_password = post_data.password;
        var hash_data = saltHashPassword(plain_password);

        var password = hash_data.passwordHash; //Save password hash
        var salt = hash_data.salt; //Save salt

        var name = post_data.name;
        var email = post_data.email;

        var user = new User();
        user.email = email;
        user.password = password;
        user.salt = salt;
        user.name = name;

        User.find({'email': email}).count(function(err, number) {
            if (number != 0)
            {
                res.json('Email already exists');
                console.log('Email already exists');
            }
            else 
            {
                user.save(function(err) {
                    if (err) 
                        res.send(err);
                    else
                        res.json({message: 'User created!'}); 
                });
            }
        });
    });

rooter.route('/login')
    .post(function(req, res) {
        var post_data = req.body;

        var email = post_data.email;
        var userPassword = post_data.password;

        User.find({'email': email}).count(function(err, number) {
            if (number == 0)
            {
                res.json('Email not exists');
                console.log('Email not exists');
            }
            else 
            {
                User.findOne({'email': email}, function(err, user) {
                    var salt = user.salt; //Get salt from user
                    var hashed_password = checkHashPassword(userPassword, salt).passwordHash; // Hash password with salt
                    var encrypted_password = user.password; // Get password from user
                    if (hashed_password == encrypted_password)
                    {
                        res.json('Login success');
                        console.log('Login success');
                    }
                    else {
                        res.json('Wrong password');
                        console.log('Wrong password');
                    }
                });
            }
        });
    });

app.use('/api', rooter);

app.listen(port);
console.log('listen on port ' + port);