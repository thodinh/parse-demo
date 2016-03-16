/*global oauth2Client*/
/*global Parse CLIENT_ID, CLIENT_SECRET, REDIRECT_URL*/
var express = require('express');
var router = express.Router();
var google = require('googleapis');
var session = require('express-session');

var plus = google.plus('v1');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/oauth?*', function(req, res, next) {
    var oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
    console.log(req.query.code);
    oauth2Client.getToken(req.query.code, function(err, tokens) {
        console.log('received token');
        // Now tokens contains an access_token and an optional refresh_token. Save them.
        if(!err) {
            oauth2Client.setCredentials(tokens);
            plus.people.get({ userId: 'me', auth: oauth2Client }, 
            function(err, response) {
                if(err){
                    console.log('get people error');
                    res.render('error', {
                        message: err.message,
                        error: err
                    });
                }
                else{
                    var User = Parse.Object.extend('User');
                    var query = new Parse.Query(User)
                    var email = response.emails[0].value;
                    query.equalTo('email', email).first({
                        success: function(user){
                            if(user){
                                console.log('Login success');
                                req.session.user = {
                                    id: user.id,
                                    displayName: user.get('displayName'),
                                    email: user.get('email'),
                                };
                                res.redirect('/');
                            }
                            else{
                                req.session.registerUser = {
                                    email: email
                                }
                                console.log('Create new user');
                                var newUser = new User();
                                newUser.set('email', email);
                                newUser.set('displayName', response.displayName);
                                console.log(newUser);
                                res.render('users/register', {email: email, displayName: response.displayName});
                                // newUser.save(null, {
                                //     success: function(data){
                                //         console.log('Saved user');
                                //         res.render('users/register', newUser);
                                //     },
                                //     error: function(error, data){
                                //         console.log('Saved user error');
                                //         console.log(error);
                                //         console.log(data);
                                //         res.render('error', {
                                //             message: error.message,
                                //             error: error
                                //         });
                                //     }
                                // });
                            }
                        },
                        error: function(error, data){
                            res.render('error', {
                                message: error.message,
                                error: error
                            });
                        }
                    });
                }
            });
        }
        else{
            res.render('error', {
                message: err.message,
                error: err
            });
        }
    });
});

router.post('/register', function(req, res, next) {
    console.log('Recieved post register');
    if(!req.session.registerUser){
        res.render('error', { 
            error: {
                message: 'Something wrong.'
            }
        });
        return;
    }
    else if(req.session.registerUser.email != req.body.email){
        res.render('error', { 
            error: {
                message: 'Email register is not correct.'
            }
        });
        return;
    }
    var user = new Parse.User();
    //use username same as email
    user.set('username', req.body.email);
    //use username same as email
    user.set('email', req.body.email);
    user.set('displayName', req.body.displayName);
    user.set('password', 'aSdFgH1@3$');
    user.set('isPasswordDefault', true);
    user.signUp(null, {
        success: function(userResult){
            console.log('User is registered');
            req.session.user = {
                id: user.id,
                displayName: user.get('displayName'),
                email: user.get('email'),
            };
            res.redirect('/');
        },
        error: function(userResult, err){
            console.log('Register user is error');
            console.log(err);
            res.render('users/register', 
            {
                email: userResult.get('email'), 
                displayName: userResult.get('displayName'), 
                isError: true, 
                errorMessage: err.message
            });
        }
    });
    req.session.registerUser = null;
});

router.get('/logout', function(req, res, next) {
    res.locals.user = null;
    req.session.user = null;
    res.redirect('/');
});

router.get('/dropme', function(req, res, next) {
   var query = new Parse.Query(Parse.User);
   console.log(req.session.user.id);
   Parse.Cloud.useMasterKey();
   query.get(req.session.user.id)
        .then(function(userResult){
            userResult.destroy().then(function(userDestroyed){
                console.log('removed user');
                req.session.user = null;
                res.render('index', {
                    info: {
                        message: 'User removed'
                    }
                });
            }, function(error) {
                console.log(error);
                res.render('error', { 
                    error: {
                        message: 'User removing error'
                    }
                });
            });
        }, function (error) {
            res.render('error', { 
                error: {
                    message: 'User removing error'
                }
            });
        });
});

module.exports = router;
