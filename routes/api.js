var express = require('express');
var router = express.Router();
var knex = require('../local_modules/knex');
var Promise = require('bluebird');

// user with associated children

router.post('/entry/:childGoalID/:amount', function(req, res) {  // add this back when its added to the '/' GET route: /:activityID
  console.log('hello there');
  var childGoal = req.params.childGoalID;
  var amount = req.params.amount;
  var activity = req.params.activityID;
    knex('entry').insert({
      child_goal_id: childGoal,
      amount: amount
    })
    .then(function(results){
      res.json(results)
      console.log(results);
      return results;
    })
    .catch(function(err){
      res.json(err);
    })
})

// add a new child for the logged in user
router.post('/child', function(req, res) {
  var firstName = req.body.first_name;
  var gender = req.body.gender;
  var dob = req.body.dob;
  var userId = req.body.user_id;
  Promise.all(
   knex('child')
     .join('user_login', 'user_login_id', '=', 'user_login.id')
       .insert({
         first_name: firstName ,
         gender: gender,
         dob: dob,
         user_login_id: userId
       })
   )
  .then(function(results){
    console.log(results);
    return results;
  })
  .catch(function(err){
    console.log('Oh NO');
    res.json(err);
  })
})


// add a goal for a given child
router.post('/:childID/:goalID/:rewardID', function(req, res) {  // add this back when its added to the '/' GET route: /:activityID
  var user = req.session.passport.user.id;
  var child = req.params.childID;
  var goal = req.params.goalID;
  var reward = req.params.rewardID;
  // var activity = req.params.activityID;
  Promise.all(
    Knex('child_goal').insert({child_id: child, goal_id: goal, reward_id: reward})
  )
  .then(function(results){
    console.log(results);
    return results;
  })
  .catch(function(err){
    res.json(err);
  })
});

// update a goal for a given child


// delete a child and their childGoals. (Change this to archive later, requires massive query updates)
router.delete('/:childID', function(req, res) {
  var user = req.session.passport.user.id;
  var child = req.params.childID;
  Promise.all(                      // first query chlid_goals on child_id returning/transforming
    knex('child_goal').where('child_id', child).del(),              // it into an array of child_goal_id's. Then delete those and child
    knex('child').where('id', child).del(),
    kenx('entry').where('child_id', child).del()
  )
  .then(function(results){
    console.log(results);
    return results;
  })
  .catch(function(err){
    res.json(err);
  })
})

// delete a given child_goal for a child. (Change this to archive later, requires massive query updates)
router.delete('/:childID/:childGoalID', function(req, res) {
  var user = req.session.passport.user.id;
  var child = req.params.childID;
  var childGoal = req.params.childGoalID
  Promise.all(
    Knex('child_goal').where('')
  )
  .then(function(results){
    console.log(results);
    return results;
  })
  .catch(function(err){
    res.json(err);
  })
})


router.get('/', function(req, res) {
  getUserData(req.user.id)
  .then(function(userData){
    res.json(userData);
  })
  .catch(function(err){
    res.json(err);
  })
});

// determine user
function getUserData(userID) {
  return knex('user_login').where('auth_id', userID).first()
  .then(function(user){
    user.profilePic = user.user_image;
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
      .then(function(ParentChildGoals){
        user.children[childID].cGoals = {}
        ParentChildGoals.forEach(function(cGoal){
          console.log(cGoal);
          user.children[childID].cGoals[cGoal.id] = cGoal;
        });
        console.log(user);
      })
    })
    .then(function(){
      return user
    })
  })
  .then(function(user){
    console.log(user);
    var childrenIDs = Object.keys(user.children);
    return Promise.map(childrenIDs, function(childID){
      var cGoalsIDs = Object.keys(user.children[childID].cGoals)
      return Promise.map(cGoalsIDs, function(cGoalID){
        return knex('child_goal')
          .join('reward', 'child_goal.reward_id', '=', 'reward.id')
          .join('entry', 'child_goal.id', '=', 'entry.child_goal_id')
          .join('goal', 'child_goal.goal_id', '=', 'goal.id')
          .where({
            'child_goal.id': cGoalID,
            'child_id': childID
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
        .then(function(cGoal){
          console.log(cGoal)
          var OCG_temp = user.children[childID].cGoals[cGoal.child_goal_id]
          console.log(OCG_temp);
          OCG_temp.entry_amount_sum = parseInt(cGoal.entry_amount_sum);
          OCG_temp.reward_type = cGoal.type;
          OCG_temp.goal_amount = cGoal.goal_amount;
          OCG_temp.goal_percent = ((cGoal.entry_amount_sum / cGoal.goal_amount)*100);

        })
      })
    })
    .then(function(){
      console.log(user);
      return user
    })
  })
  .catch(function(err){
    console.error(err);
    throw err
  })
}

module.exports = router;
