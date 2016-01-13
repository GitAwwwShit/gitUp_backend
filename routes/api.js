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
    .then(function(ParentChildGoals){
      console.log(ParentChildGoals);
      console.log(user);
      ParentChildGoals.forEach(function(childGoals){
        console.log(childGoals);
        console.log(childGoals[0].child_id);
        user.children[childGoals[0].child_id].cGolds = {};
        childGoals.forEach(function(OneChildGoal){
          console.log(OneChildGoal);
          user.children[childGoals[0].child_id].cGolds[OneChildGoal.id] = OneChildGoal;
          knex('child_goal')
            .join('reward', 'child_goal.reward_id', '=', 'reward.id')
            .join('entry', 'child_goal.id', '=', 'entry.child_goal_id')
            .join('goal', 'child_goal.goal_id', '=', 'goal.id')
            .where({
              'child_goal.id': OneChildGoal.id,
              'child_id': OneChildGoal.child_id
             })
            .sum('amount as entry_amount_sum')
            .select('child_id',
              'goal_id',
              'child_goal.id as child_goal_id',
              'entry.date_time as entry_date_time',
              'reward.date_time as reward_date_time',
              'reward_id',
              'type',
              'minute_amount as goal_amount',
              'activity_id',
              'badge_id'
            )
            .groupBy('child_goal.child_id')
            .groupBy('child_goal.goal_id')
            .groupBy('child_goal.id')
            .groupBy('entry.date_time')
            .groupBy('reward.date_time')
            .groupBy('reward.type')
            .groupBy('goal.minute_amount')
            .groupBy('goal.activity_id')
            .groupBy('goal.badge_id')
            .first()
            .then(function(CG_data){
              console.log(CG_data);
              var OCG_temp = user.children[childGoals[0].child_id].cGolds[OneChildGoal.id]
              OCG_temp.entry_amount_sum = parseInt(CG_data.entry_amount_sum);
              OCG_temp.reward_type = CG_data.type;
              OCG_temp.goal_amount = CG_data.goal_amount;
              console.log(user);
            })
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
