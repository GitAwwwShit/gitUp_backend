var express = require('express');
var router = express.Router();
var knex = require('../local_modules/knex');
var Promise = require('bluebird');

// user with associated children
router.get('/', function(req, res) {
  getUserData(req.user.id).then(function(userData){
    res.json(userData);
  })
});

// goals associated with a given child
router.get('/childGoals', function(req, res) {
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
      user.children = {};
      children.forEach(function(child){
        user.children[child.id] = child;
      });
      return user
    })
  })
  .then(function(user){
    var childrenIDs = Object.keys(user.children);
    return Promise.map(childrenIDs, function(childID){
      return knex('child_goal').where('child_id', parseInt(childID))
    })
    .then(function(childGoals){
      console.log(childGoals);
      console.log(user);
      childGoals.forEach(function(childGoal){
        console.log(childGoal[0].child_id);
        user.children[childGoal[0].child_id].goals = {};
        childGoal.forEach(function(goal){
          user.children[childGoal[0].child_id].goals[goal.id] = goal;
        })
      })
      return user
    })
  })

  .catch(function(error){
    console.error(error);
  })
}

module.exports = router;
