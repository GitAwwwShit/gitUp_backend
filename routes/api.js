var express = require('express');
var router = express.Router();
var knex = require('../local_modules/knex');


router.get('/', function(req, res) {
  var userInfo = getUserData(req.user.id)
  console.log(userInfo);
  res.json(userInfo);
});

  var userData = {};
// determine user
function getUserData(userID) {
  knex('user_login').where('auth_id', userID).first()
  .then(function(user){
    userData.user = user;
  })
  .catch(function(error){
    console.error(error);
  })
  return userData;
}

module.exports = router;


// .then(function(user){
//   return knex('child').where('user_login_id', user.id).return(children)
// })
