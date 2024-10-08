var express = require('express');
var passport = require('passport');
var OpenIDConnectStrategy = require('passport-openidconnect');


passport.use(new OpenIDConnectStrategy({
  issuer: 'https://openidconnect.test.tuakiri.ac.nz',
  authorizationURL: 'https://openidconnect.test.tuakiri.ac.nz/OIDC/authorization',
  tokenURL: 'https://openidconnect.test.tuakiri.ac.nz/OIDC/token',
  userInfoURL: 'https://openidconnect.test.tuakiri.ac.nz/OIDC/userinfo',
  clientID: '1726206339_dev.academicfellows.com_openidconnect.test.tuakiri.ac.nz',
  clientSecret: 'LLR3FRT7WqifPzC+u0h9dUqg',
  callbackURL: 'http://localhost:8080/redirect',
  scope: [ 'profile' ]
}, function verify(issuer, profile, cb) {
  
  const code = req.query.code;
  console.log("code--> ", code);
}));

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username, name: user.displayName });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});


var router = express.Router();

router.get('/login', passport.authenticate('openidconnect'));

router.get('/oauth2/redirect', passport.authenticate('openidconnect', {
  successReturnToOrRedirect: '/',
  failureRedirect: '/login'
}));

router.post('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
});

module.exports = router;
