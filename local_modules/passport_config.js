var authID = require('../oauth_IDs.js');
var knex = require('../local_modules/knex');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

// serialize and deserialize
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// strategies config
passport.use(new GoogleStrategy({
  clientID: authID.google.clientID,
  clientSecret: authID.google.clientSecret,
  callbackURL: authID.google.callbackURL
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      return done(null, profile);
    });
  }
));

passport.use(new FacebookStrategy({
    clientID: authID.facebook.clientID,
    clientSecret: authID.facebook.clientSecret,
    callbackURL: authID.facebook.callbackURL,
    profileFields: ['id', 'displayName', 'photos'],
    enableProof: false
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      return done(null, profile);
    });
  }
));

module.exports = passport;
