var express = require('express');
var crypto = require('crypto');
var router = express.Router();

var User = require('../models/user');

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

/**
 * ユーザーのパスワードをhash化する関数
 * @param {*} userPassword プレーンテキスト
 * @return {Object} キーとhash化されたパスワード
 */
function saltHashPassword(userPassword) {
    var salt = genRandomString(16); //Create 16 random character
    var passwordData = sha512(userPassword, salt);
    return passwordData;
}

/**
 * ユーザーが入力したパスワードを保存済みkeyを使ってhash化する関数
 * @param {*} userPassword プレーンテキスト
 * @param {*} salt 保存済みのkey
 * @return {*} hash化されたパスワード
 */
function checkHashPassword(userPassword, salt) {
    var passwordData = sha512(userPassword, salt);
    return passwordData;
}

/* 全ユーザー情報の取得 */
router.get('/', function(req, res) {
    User.find(function(err, users) {
        if (err)
            res.json({
                error: true,
                message: err
            });
        else
            res.json({
                error: false,
                message: 'You got all user info!',
                users: users
            });
    });
});

/* ユーザーの作成(登録) */
router.post('/register', function(req, res) {
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
            res.json({
                error: true,
                message: 'Email already exists'
            });
            console.log('Email already exists');
        }
        else 
        {
            user.save(function(err) {
                if (err) 
                    res.json({
                        error: true,
                        message: err
                    });
                else
                    res.json({
                        error: false, 
                        message: 'User created!'
                    }); 
            });
        }
    });
});

/* ユーザーのログイン処理 */
router.post('/login', function(req, res) {
    var post_data = req.body;

    var email = post_data.email;
    var userPassword = post_data.password;

    User.find({'email': email}).count(function(err, number) {
        if (number == 0)
        {
            res.json({
                error: true,
                message: 'Email not exists'
            });
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
                    res.json({
                        error: false,
                        message: 'Login success'
                    });
                    console.log('Login success');
                }
                else {
                    res.json({
                        error: true,
                        message: 'Wrong password' 
                    });
                    console.log('Wrong password');
                }
            });
        }
    });
});

/* 特定のユーザー情報の取得 */
router.get('/:user_id', function(req, res) {
    User.findById(req.params.user_id, function(err, user) {
        if (err)
            res.json({
                error: true,
                message: err
            });
        res.json({
            error: false,
            message: 'You got specific user info!',
            user: user
        });
    });
});

/* 特定のユーザー情報の更新 */
router.put('/:user_id', function(req, res) {
    User.findById(req.params.user_id, function(err, user) {
        if (err)
            res.json({
                error: true,
                message: err
            });
        var post_data = req.body;
        
        var plain_password = post_data.password;
        var hash_data = saltHashPassword(plain_password);

        var password = hash_data.passwordHash; //Save password hash
        var salt = hash_data.salt; //Save salt

        var name = post_data.name;
        var email = post_data.email;

        user.email = email;
        user.password = password;
        user.salt = salt;
        user.name = name;

        User.find({'email': email}).count(function(err, number) {
            if (number != 0)
            {
                res.json({
                    error: true,
                    message: 'Email already exists'
                });
                console.log('Email already exists');
            }
            else 
            {
                user.save(function(err) {
                    if (err) 
                        res.json({
                            error: true,
                            message: err
                        });
                    else
                        res.json({
                            error: false, 
                            message: 'User updated!'
                        }); 
                });
            }
        });
    })
});

/* 特定のユーザーの削除 */
router.delete('/:user_id', function(req, res) {
    User.remove({ _id: req.params.user_id }, function(err, user) {
        if (err)
            res.json({
                error: true,
                message: err
            });
        res.json({ 
            error: false,
            message: 'Successfully deleted'}
        );
    });
});

module.exports = router;