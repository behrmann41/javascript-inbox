var express = require('express');
var router = express.Router();
var db = require('monk')('localhost/js-inbox')
var Users = db.get('users')
var bcrypt = require('bcrypt')

/* GET users listing. */
router.get('/register', function(req, res, next) {
  res.render('users/register', {  title: "Create Account"})
});

router.post('/register', function (req, res, next){
  var errors = [];
  var hash = bcrypt.hashSync(req.body.password, 10)
  if (!req.body.username.trim()){
    errors.push('Username is required');
  }
  if (!req.body.email.trim()){
    errors.push('Email is required')
  }
  if (!req.body.email.match(/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i)){
    errors.push("Invalid Email")
  }
  if (!req.body.password.trim()){
    errors.push('Invalid password')
  }
  if (req.body.password.length < 8){
    errors.push('Password needs to be at least 8 characters')
  }
  if (req.body.password !== req.body.pwconfirm){
    errors.push('Passwords do not match')
  }
  if (errors.length){
    res.render('users/register', { title: 'Create Account', errors: errors})
  } else {
    Users.find({ email: req.body.email}, function (err, user){
      if (user.length > 0){
        errors.push('Email already in use')
        res.render('users/register', {  title: 'Create Account', errors: errors})
      } else {
        Users.insert({  username: req.body.username,
                        email: req.body.email,
                        passwordDigest: hash
                    })
        req.session.user = req.body.username
        res.redirect('/mailbox')
      }
    })
  }
})

router.get('/login', function (req, res, next){
  res.render('users/login', { title: 'Login to Account'})
})

router.post('/login', function (req, res, next){
  var errors = []
  if (!req.body.email.trim()){
    errors.push('Please Enter a valid email')
  }
  if (!req.body.password.trim()){
    errors.push('Please enter a password')
  }
  if (errors.length){
    res.render('users/login', { title: 'Login to Account', errors: errors})
  } else {
    Users.findOne({ email: req.body.email}, function (err, user){
      if (!user){
        errors.push('Invalid Email / Password')
        res.render('users/login', { title: 'Login to Account', errors: errors})
      } else {
        if (bcrypt.compareSync(req.body.password, user.passwordDigest)){
          req.session.user = user.username
          res.redirect('/mailbox')
        } else {
          errors.push('Invalid Email / Password')
          res.render('users/login', { title: 'Login to Account', errors: errors})
        }
      }
    })
  }
})

router.get('/logout', function (req, res, next){
  req.session = null
  res.redirect('/')
})

module.exports = router;
