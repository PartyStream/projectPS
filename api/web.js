/**
//
//  web.js
//  projectPS
//
//  This is the main server for the PhotoStream project running on NodeJS
//
//  Created by Salvatore D'Agostino on 2012-10-14 21:53
//  Copyright 2012. All rights reserved.
//
**/

var application_root = __dirname,
    express          = require("express"),
    port             = process.env.PORT || 4482;
    path             = require("path"),
    url              = require("url") ,
    user             = require('./user'),
    event            = require('./event'),
    eventInvite      = require('./eventInvitations'),
    pictures         = require('./pictures'),
    pg               = require('pg').native,
    AWS              = require('aws-sdk'),
    client           = new pg.Client(process.env.DATABASE_URL),
    passport         = require("passport"),
    // LocalStrategy    = require('passport-local').Strategy,
    DigestStrategy   = require('passport-http').DigestStrategy;

AWS.config.update({accessKeyId: process.env.AWS_ACCESS_KEY, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY});
AWS.config.update({region: 'us-east-1'});

var s3 = new AWS.S3();

// Connect To DB
client.connect();

// ==================
// = PASSPORT START =
// ==================
/*
// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  if (typeof user.id === 'undefined'){
    done(null,null);
  } else {
    done(null, (user.id).toString());

  }
});

passport.deserializeUser(function(id, done) {
  user.getUserByIdForAuth(id,client, function (err, user) {
    done(err, user);
  });
});

// Use the LocalStrategy within Passport.
passport.use(new LocalStrategy(
  function(username, password, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {

      // Find the user by username.  If there is no user with the given
      // username, or the password is not correct, set the user to `false` to
      // indicate failure and set a flash message.  Otherwise, return the
      // authenticated `user`.
      user.getUserByNameForAuth(username,client, function(err, user) {
        console.log('Getting user for auth');
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
        return done(null, user);
      })
    });
  }
));
*/

// Use the DigestStrategy within Passport.
//   This strategy requires a `secret`function, which is used to look up the
//   use and the user's password known to both the client and server.  The
//   password is used to compute a hash, and authentication will fail if the
//   computed value does not match that of the request.  Also required is a
//   `validate` function, which can be used to validate nonces and other
//   authentication parameters contained in the request.
passport.use(new DigestStrategy({ qop: 'auth' },
  function(username, done) {
    // Find the user by username.  If there is no user with the given username
    // set the user to `false` to indicate failure.  Otherwise, return the
    // user and user's password.
    user.getUserByNameForAuth(username,client, function(err, user) {
      console.log('Hello World');
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      return done(null, user, user.password);
    });
  },
  function(params, done) {
    // asynchronous validation, for effect...
    process.nextTick(function () {
      // check nonces in params here, if desired
      return done(null, true);
    });
  }
));

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  console.log('Unauthorized request sent');
  res.writeHead(401, {'content-type':'text/plain'});
  res.write("Unauthorized");
  res.end();
}

// ================
// = PASSPORT END =
// ================

var app = express();

// Config
app.configure(function () {
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'my super secret password is 12345' }));
  app.use(passport.initialize());
  // app.use(passport.session()); // Not needed for Digest Strategy
  app.use(app.router);
  app.use(express.static(path.join(application_root, "public")));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

/**
+++++++++++++++++++++++++++++++++++++++++++++++++++
+++                                             +++
+                     CORS FIX                    +
+++                                             +++
+++++++++++++++++++++++++++++++++++++++++++++++++++
**/
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });

app.get('/api', function (req, res) {
  res.send('PS API is running');
});
app.get('/', function (req, res) {
  res.send('PS API is running');
});

/**
+++++++++++++++++++++++++++++++++++++++++++++++++++
+++                                             +++
+                  Auth Object                    +
+++                                             +++
+++++++++++++++++++++++++++++++++++++++++++++++++++
**/
// POST /login
// app.post('/login', function(req, res, next) {

//   user = req.body.user;

//   if (typeof user === 'undefined'){
//     console.log('No user passed into login');
//     res.writeHead(400, {'content-type':'text/plain'});
//     res.write("Missing Parameters");
//     res.end();
//   } else {
//     passport.authenticate('local', function(err, user, info) {
//       console.dir(user);
//       process.reallyExit();
//       if (err) { return next(err) }
//       if (!user) {
//         // Login Error
//         console.log('Login Failed');
//         res.writeHead(401, {'content-type':'text/plain'});
//         res.write("Unauthorized");
//         res.end();
//       }
//       req.logIn(user, function(err) {
//         if (err) { return next(err); }
//         // Login Success
//         res.writeHead(200,{"Content-Type":"text/plain"});
//         res.write("Authenticated");
//         res.end();
//       });
//     })(req, res, next);
//   }
// });

app.post('/login',
  // Authenticate using HTTP Digest credentials, with session support disabled.
  passport.authenticate('digest', { session: false }),
  function(req, res){
    console.log('Success!');
    res.json({ username: req.user.username, email: req.user.email });
  });

/**
+++++++++++++++++++++++++++++++++++++++++++++++++++
+++                                             +++
+                  User Object                    +
+++                                             +++
+++++++++++++++++++++++++++++++++++++++++++++++++++
**/
// Create
app.post('/users', function (req,res){
  user.createUser(res,req.body.user,client);
});
// Read User
app.get('/users/:id', function (req,res) {
    user.readUser(res,req.params.id,client);
});
// Read Users
app.get('/users', function (req,res) {
    user.readUsers(res,client);
});
// Update
app.put('/users/:id', function (req,res){
  user.updateUser(res,req.params.id, req.body.user,client);
});
// Delete
app.delete('/users/:id', function (req,res) {
  user.deleteUser(res,req.params.id,client);
});
// Get events for a user
app.get('/users/:id/events', function (req,res) {
    event.getEvents(res,req.params.id,client);
});

/**
+++++++++++++++++++++++++++++++++++++++++++++++++++
+++                                             +++
+                  Event Object                   +
+++                                             +++
+++++++++++++++++++++++++++++++++++++++++++++++++++
**/
// Create
app.post('/events', function (req,res){
  event.createEvent(res,req.body.event,client);
});
// Read Event
app.get('/events/:id', function (req,res) {
    event.readEvent(res,req.params.id,client);
});
// Update
app.put('/events/:id', function (req,res){
  event.updateEvent(res,req.params.id,req.body.event,client);
});
// Delete
app.delete('/events/:id', function (req,res) {
  event.deleteEvent(res,req.params.id,client);
});

/**
+++++++++++++++++++++++++++++++++++++++++++++++++++
+++                                             +++
+                  Event Invites
+++                                             +++
+++++++++++++++++++++++++++++++++++++++++++++++++++
**/
// Invite a user to an event
app.get('/events/:eventId/invite/:userId' , function (req,res){
  eventInvite.inviteAUser(res,req.params.eventId,req.params.userId,client);
});

// Invite many users to an event
app.post('/events/:eventId/invite' , function (req,res){
  eventInvite.inviteManyUser(res,req.params.eventId,req.body.users,client);
});

/**
+++++++++++++++++++++++++++++++++++++++++++++++++++
+++                                             +++
+                  Pictures Object
+++                                             +++
+++++++++++++++++++++++++++++++++++++++++++++++++++
**/
// Create
app.post('/photos', function (req,res){
  pictures.createPicture(res,req.body.eventId,req.body.userId,req.files.picture,s3,client);
});
// Read Pictures For Event
app.get('/events/:eventId/photos', function (req,res) {
    pictures.readPictures(res,req.params.eventId,client);
});
// Read A Picture
app.get('/photos/:eventId/:pictureId', function (req,res) {
    pictures.readPicture(res,req.params.eventId,req.params.pictureId,client,s3);
});
// Update
app.put('/photos/:id', function (req,res){
  pictures.updatePicture(res,req.params.id,client,req.body.photo);
});
// Delete
app.delete('/photos/:eventId/:pictureId', function (req,res) {
  pictures.deletePicture(
    res,
    req.params.eventId,
    req.params.pictureId,
    client,
    s3);
});



// Launch server
console.log('Listening on port: '+ port);
app.listen(port);
module.exports = app;
