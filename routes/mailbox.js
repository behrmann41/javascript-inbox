var express = require('express');
var router = express.Router();
var db = require('monk')('localhost/js-inbox')
var Users = db.get('users')

router.get('/', function (req, res, next){
  var username = req.session.user
  res.render('mailbox', { title: 'Mailbox',
                          user: username
                        })
})

module.exports = router;