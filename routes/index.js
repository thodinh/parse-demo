var express = require('express');
var router = express.Router();
var multer  = require('multer');
var upload = multer({dest: './uploads/'});
var configUpload = upload.fields([{ name: 'bookFile', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]);
/* GET home page. */
router.get('/', function(req, res, next) {
    var Book = Parse.Object.extend('Book');
    var query = new Parse.Query(Book);
    query.find({
        success: function(results) {
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
    var category = Parse.Object.extend('Category');
    var query = new Parse.Query(category);
    query.find({
        success: function(results) {            
            res.render('upload', {title : 'Upload book', categoryList: results});
        },
        error: function(error) {
            res.render('upload', {message: 'Can\'t load category '});            
        }
    });
});

router.post('/upload', configUpload, function(req, res, next) {
    var Book = Parse.Object.extend('Book');
    var book = new Book(); 
    var bookFile = req.files['bookFile'][0];
    var thumbnail = req.files['thumbnail'][0];
    console.log(bookFile.filename);
    if(req.body.bookTitle && req.body.author && ((bookFile && bookFile.filename) || req.body.bookUrl)){
        book.set('title', req.body.bookTitle);
        book.set('author', req.body.author);
        book.set('description', req.body.description);
        book.set('fileName', bookFile.filename);
        book.set('originalname', bookFile.originalname);
        book.set('mimetype', bookFile.mimetype);
        book.set('bookUrl', req.body.bookUrl);
        book.set('thumbnail', thumbnail.filename);
        
        if(req.body.categoryId)
        {
            var Category = Parse.Object.extend('Category');
            var query = new Parse.Query(Category);
            query.equalTo('_id', req.body.categoryId);
            query.first().then(function(cat){
                book.set('category', cat);
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
        }
    }
});

router.get('/upload/:id', function(req, res, next) {
    res.redirect('/about');
});

router.get('/category', function(req, res, next) {
    var category = Parse.Object.extend('Category');
    var query = new Parse.Query(category);
    query.find({
        success: function(results) {            
            res.render('category', {categoryList: results});
        },
        error: function(error) {
            res.render('category', {message: 'Can\'t load category '});            
        }
    });
});

router.get('/category/add', function(req, res, next) {
    res.render('category-add', {title: 'Add Book Category'});
});

router.post('/category/add', function(req, res, next) {
    var Category = Parse.Object.extend('Category');
    var category = new Category();
    if(req.body.categoryName) {
        category.set('name', req.body.categoryName);
        category.set('description', req.body.categoryDescription);
        console.log(category);
        category.save(null, {
            success: function(rs) {
                console.log('Created category');
            }, error: function(rs, error) {
                console.log('Failed to create category');
            }
        });
    }
    res.redirect('/category');
});

router.get('/file/:id', function(req, res, next) {
    res.sendFile(__dirname + '/../uploads/' + req.params.id);
})


module.exports = router;
