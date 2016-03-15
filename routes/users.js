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
                    // {
                    //     "kind": "plus#person",
                    //     "etag": "\"4OZ_Kt6ujOh1jaML_U6RM6APqoE/rTdLP6u2_HZ_5dcoX9ipBZ0iDJk\"",
                    //     "occupation": "Sinh Viên",
                    //     "gender": "male",
                    //     "emails": [{
                    //         "value": "d.tr.tho@gmail.com",
                    //         "type": "account"
                    //     }],
                    //     "urls": [{
                    //         "value": "http://picasaweb.google.com/d.tr.tho",
                    //         "type": "otherProfile",
                    //         "label": "Picasa Web Albums"
                    //     }],
                    //     "objectType": "person",
                    //     "id": "112401372696727232983",
                    //     "displayName": "Trường Thọ Đinh",
                    //     "name": {
                    //         "familyName": "Đinh",
                    //         "givenName": "Trường Thọ"
                    //     },
                    //     "aboutMe": "Sinh ra ở ấp Bờ Đập, xã Viên An, huyện Mỹ Xuyên, tỉnh Sóc Trăng. Hiện tại đang sống và học tại Cần Thơ...<br />",
                    //     "url": "https://plus.google.com/112401372696727232983",
                    //     "image": {
                    //         "url": "https://lh5.googleusercontent.com/-FaGs61wZkI4/AAAAAAAAAAI/AAAAAAAACD4/lkCzlOWVfTo/photo.jpg?sz=50",
                    //         "isDefault": false
                    //     },
                    //     "organizations": [{
                    //         "name": "ĐH Cần Thơ",
                    //         "type": "school",
                    //         "primary": true
                    //     }, {
                    //         "name": "PTCS Viên Bình",
                    //         "type": "school",
                    //         "primary": false
                    //     }, {
                    //         "name": "TH Viên Bình",
                    //         "type": "school",
                    //         "primary": false
                    //     }, {
                    //         "name": "THCS Viên Bình",
                    //         "type": "school",
                    //         "primary": false
                    //     }, {
                    //         "name": "THPT Mỹ Xuyên",
                    //         "type": "school",
                    //         "primary": false
                    //     }, {
                    //         "title": "Sinh Viên",
                    //         "type": "work",
                    //         "primary": true
                    //     }],
                    //     "placesLived": [{
                    //         "value": "Cần Thơ",
                    //         "primary": true
                    //     }, {
                    //         "value": "Sóc Trăng"
                    //     }, {
                    //         "value": "Sóc Trăng"
                    //     }, {
                    //         "value": "Cần Thơ"
                    //     }],
                    //     "isPlusUser": true,
                    //     "circledByCount": 0,
                    //     "verified": false
                    // }
                    ////////////////////////////////
                    var User = Parse.Object.extend('User');
                    var query = new Parse.Query(User)
                    var email = response.emails[0].value;
                    query.equalTo('email', email).first({
                        success: function(user){
                            if(user){
                                console.log('Login success');
                                session.user = {
                                    id: user.id,
                                    displayName: user.get('displayName'),
                                    email: user.get('email'),
                                };
                                res.redirect('/');
                            }
                            else{
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
            res.render('users/register', {email: userResult.get('email'), displayName: userResult.get('displayName')});
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
    })
});

router.get('/logout', function(req, res, next) {
   session.user = null;
   res.redirect('/');
});

module.exports = router;
