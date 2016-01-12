var express = require('express');
var router = express.Router();
var passport = require('../local_modules/passport_config');
var knex = require('../local_modules/knex');

// auth routes

// google
router.get('/google',
  passport.authenticate('google', { scope: 'https://www.googleapis.com/auth/plus.login' }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/shit' }),
  function(req, res) {
    insertUser(req.user);
    res.redirect('/');
  });

// app logout
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


// insert user into users table
function insertUser(userObj) {
  knex('user_login').where('auth_id', userObj.id)
  .then(function(user){
    if (user.length === 0) {
      return knex('user_login').insert({
        username: userObj.displayName,
        auth_id:      userObj.id,
        provider:     userObj.provider,
        times_visited:   1
      })
    } else {
      return knex('user_login').where('auth_id', user[0].auth_id).increment('times_visited', 1)
    }
  })
  .then(function(result){
    console.log(result)
  })
  .catch(function(error){
    console.error(error);
  })
}

module.exports = router;
