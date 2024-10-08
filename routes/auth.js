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
  try {
      const grant_type = "authorization_code";
      const client_id = process.env.TUAKIRI_CLIENT_ID;
      const client_secret = process.env.TUAKIRI_CLIENT_SECRET;
      const redirect_uri = process.env.BACKEND_API_BASE_URL + process.env.TUAKIRI_REDIRECT_URI;
      const url = process.env.TUAKIRI_TOKEN_URL;
      const tokenData = await getOpenIdToken(
          grant_type,
          code,
          client_id,
          client_secret,
          redirect_uri,
          url
      );
      if (tokenData) {
          console.log("tokenData: ", tokenData);
          let dbUser = await getUserProfileByPrimaryEmail(tokenData.email);
          if (!dbUser) {
              // if not, create user in our db
              const userProfile = {
                  usertypeid: 1,
                  institution_id: null,
                  faculty_id: null,
                  organization_id: null,
                  first_name: tokenData.given_name,
                  last_name: tokenData.family_name,
                  preferred_name: null,
                  title: "Ms",
                  primary_email: tokenData.email,
                  department: "",
                  orcid_identifier: null,
                  linkedin_url: "",
                  secondary_email: "",
                  mobile_phone: "",
                  bio: "",
                  research_area: "",
                  skills: "",
                  research_tags: "",
                  expertise: "",
                  positions: "",
                  tools: "",
                  profile_picture: tokenData.picture,
                  is_verified: false,
                  signup_datetime: new Date(),
              };
              dbUser = await createUserProfile(userProfile);
              if (dbUser) {
                  console.log("Saving Successfully");
              } else {
                  return this.fail({ message: 'Invalid credentials' }, 401);
              }
          }
          let currentUser = { id: dbUser.id, email: dbUser.primary_email, is_verified: dbUser.is_verified };
          console.log("currentUser: ", currentUser);
          return this.success(currentUser);
      }
      else {
          return this.fail({ message: 'Invalid tokenData' }, 401);
      }

  } catch (error) {
      console.error("Error during test:", error);
  }

  
  //return cb(null, profile);
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
