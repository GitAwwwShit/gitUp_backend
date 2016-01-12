var express = require('express');
var router = express.Router();
var knex = require('../local_modules/knex');


router.get('/', function(req, res) {
  var userInfo = {};
  getUserData(req.user.id).then(function(userData){
    userInfo.userdata = userData
  });
  res.json(userInfo);
});

// determine user
function getUserData(userID) {
  return knex('user_login').where('auth_id', userID).first()
  .then(function(user){
    return knex('child').where('user_login_id', user.id).return(children)
  })

  .catch(function(error){
    console.error(error);
  })
}

module.exports = router;
