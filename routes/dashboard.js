var express = require('express');
var router = express.Router();
var knex = require('../local_modules/knex');


router.get('/', function(req, res) {
  console.log(req.user);
  userData(req.user.id).then(function(getUserData){
    console.log(getUserData);
    var userInfo = {
      userdata: getUserData
    };
    res.json(userInfo);
  });
});

// determine user type
function userData(userID) {
  console.log(userID);
  return knex('user_login').where('auth_id', userID).first()
  .then(function(user){
    console.log(user);
    return user;
  })
  .catch(function(error){
    console.error(error);
  })
}

module.exports = router;
