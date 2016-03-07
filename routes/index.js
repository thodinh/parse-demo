var express = require('express');
var router = express.Router();
var Parse = require('parse/node');

/* GET home page. */
router.get('/', function(req, res, next) {
    Parse.initialize('appId', 'javascriptKey', 'masterKey');
    Parse.serverURL = 'http://localhost:3000/parse';
    var Book = Parse.Object.extend('Book');
    var query = new Parse.Query(Book);
    query.find({
        success: function(results) {
            console.log('results of query');
            console.log(results[0]);
            res.render('index', { title: 'Bookshelf', results: results });
        },
        error: function(error) {
            // error is an instance of Parse.Error.
        }
    });
    // res.render('index', { title: 'Express' });
});

router.get('/about', function (req, res, next) {
    res.render('about', {title: 'About'});
})

router.get('/upload', function(req, res, next) {
    res.render('upload', {title : 'Upload book'});
});

router.post('/upload', function(req, res, next) {
    Parse.initialize('appId', 'javascriptKey', 'masterKey');
    Parse.serverURL = 'http://localhost:3000/parse';
    var Book = Parse.Object.extend('Book');
    var book = new Book();
    book.set('title', req.body.bookTitle);
    book.set('author', req.body.author);
    book.set('description', req.body.description);
    book.set('tags', req.body.tags.split(','));
    book.save(null, {
       success: function(bookResult) {
           console.log('Saved: ');
           console.log(bookResult);
       },
       error: function(bookResult, error) {
           console.log(error);
       }
    });
    console.log(book);
    res.redirect('/');
});

router.get('/upload:id', function(req, res, next) {
    res.redirect('/about');
});

module.exports = router;
