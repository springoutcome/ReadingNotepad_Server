var express = require('express');
var router = express.Router();
var Date = require('date-utils');

var Book = require('../models/book');

var dateFormat = {
    _fmt : {
        "yyyy": function(date) { return date.getFullYear() + ''; },
        "MM": function(date) { return ('0' + (date.getMonth() + 1)).slice(-2); },
        "dd": function(date) { return ('0' + date.getDate()).slice(-2); },
        "hh": function(date) { return ('0' + date.getHours()).slice(-2); },
        "mm": function(date) { return ('0' + date.getMinutes()).slice(-2); },
        "ss": function(date) { return ('0' + date.getSeconds()).slice(-2); }
    },
    _priority : ["yyyy", "MM", "dd", "hh", "mm", "ss"],
    format: function(date, format) {
        return this._priority.reduce(function(res, fmt) {
            res.replace(fmt, this._fmt[fmt](date), format);
        });
    }
}

/* すべての書籍の取得 */
router.get('/', function(req, res) {
    Book.find(function(err, books) {
        if (err)
            res.json({
                error: true,
                message: err
            });
        else
            res.json({
                error: false,
                message: 'You got all book info!',
                books: books
            });
    });
});

/* 書籍の登録 */
router.post('/register', function(req, res) {
    var post_data = req.body;

    var user_email = post_data.user_email;

    var date = dateFormat.format(new Date(), 'yyyy/MM/dd hh:mm:ss');

    var title = post_data.title;
    var auther = post_data.auther;
    var category = post_data.category;
    var photo = post_data.photo;
    var impression = post_data.impression;

    var book = new Book();
    book.user_email = user_email;
    book.date = date;
    book.title = title;
    book.auther = auther;
    book.category = category;
    book.photo = photo;
    book.impression = impression;

    book.save(function(err) {
        if (err)
            res.json({
                error: true,
                message: err
            });
        else
            res.json({
                error: false,
                message: 'Book created!'
            });
    });
});

/* 特定の書籍情報の取得 */
router.get('/id/:book_id', function(req, res) {
    Book.findById(req.params.book_id, function(err, book) {
        if (err)
            res.json({
                error: true,
                message: err
            });
        res.json({
            error: false,
            message: 'You got spacific book info!',
            book: book
        })
    });
});

/* 特定の書籍情報の取得 */
router.get('/email/:user_email', function(req, res) {
    Book.find(req.params.user_email).count(function(err, number) {
        if (number == 0) {
            res.json({
                error: true,
                message: 'Not found'
            });
        }
        else {
            Book.find({user_email: user_email}, function(err, books) {
                res.json({
                   error: false,
                   message: 'You got spacific books info!',
                   books: books
                });
            });
        }    
    });
});

/* 特定の書籍情報の更新 */
router.put('/:book_id', function(req, res) {
    Book.findById(req.params.book_id, function(err, book) {
        if (err)
            res.json({
                error: true,
                message: err
            });
        var put_data = req.body;

        var user_email = put_data.user_email;
        var title = put_data.title;
        var auther = put_data.auther;
        var category = put_data.category;
        var photo = put_data.photo;
        var impression = put_data.impression;
    
        book.user_email = user_email;
        book.title = title;
        book.auther = auther;
        book.category = category;
        book.photo = photo;
        book.impression = impression;
    
        book.save(function(err) {
            if (err)
                res.json({
                    error: true,
                    message: err
                });
            else
                res.json({
                    error: false,
                    message: 'Book updated!'
                });
        });
    });
});

/* 特定の書籍情報の削除 */
router.delete('/:book_id', function(req, res) {
    Book.remove({ _id: req.params.book_id }, function(err, book) {
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