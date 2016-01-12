var express = require('express');
var router = express.Router();
var knex = require('../local_modules/knex');


router.get('/', function(req, res) {
  getUserData(req.user.id).then(function(userData){
    var userInfo = {
      userdata: userData
    };
    res.json(userInfo);
  })
});

// determine user
function getUserData(userID) {
  return knex('user_login').where('auth_id', userID).first()
  .then(function(user){
    return knex('child').where('user_login_id', user.id)
    .then(function(children){
      user.children = children;
      return user
    })
  })
  .then(function(user){
    return user // do other knex calls if needed
  })
  .catch(function(error){
    console.error(error);
  })
}

module.exports = router;


// .then(function(user){
//   return knex('child').where('user_login_id', user.id).return(children)
// })
