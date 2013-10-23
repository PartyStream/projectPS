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

// =================
// = LOAD ENV VARS =
// =================
var nconf = require('nconf');

nconf.env();
nconf.argv();
nconf.file({ file: 'local.json' });

console.log('Environment: ' + nconf.get('NODE_ENV'));

var application_root = __dirname,
    express          = require("express"),
    port             = nconf.get('PORT');
    path             = require("path"),
    url              = require("url") ,
    user             = require('./user'),
    event            = require('./event'),
    eventInvite      = require('./eventInvitations'),
    pictures         = require('./pictures'),
    restResponse     = require("./helpers/response.js"),
    dbHelper         = require("./helpers/db.js"),
    pg               = require('pg').native,
    AWS              = require('aws-sdk'),
    client           = new pg.Client(nconf.get('DATABASE_URL')),
    bcrypt           = require('bcrypt-nodejs'),
    passport         = require("passport"),
    LocalStrategy    = require('passport-local').Strategy;

AWS.config.update({
  accessKeyId: nconf.get('AWS_ACCESS_KEY'),
  secretAccessKey: nconf.get('AWS_SECRET_ACCESS_KEY')
});
AWS.config.update({region: 'us-east-1'});

var s3 = new AWS.S3();

// Connect To DB
client.connect();

// ==================
// = PASSPORT START =
// ==================
// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  findById(id, function (err, user) {
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
        if (err) { throw err };
        if (!user) {
          console.log('Could not find user with username '+ username);
          return done(null, false, { message: 'Unknown user ' + username });
        }
        var result = bcrypt.compareSync(password, user.password);
        if (result) {
          console.log('User credentials valid');
          return done(null, user);
        }
        else {
          console.log('Could not compare passwords');
          return done(null, false, { message: 'Invalid password' });
        }
      });
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
  accessDenied(res);
}

function accessDenied(res){
  res.writeHead(401, {'content-type':'text/plain'});
  res.write("ahh ahh ahh, not without the password!");
  res.end();
}

// ================
// = PASSPORT END =
// ================

var app = express();

// Config
app.configure(function () {
  app.use(express.logger());
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'my super secret password is 12345' }));
  app.use(passport.initialize());
  app.use(passport.session());
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
// This function will be used to issue auth tokens
// POST /login
app.post('/login',
  passport.authenticate('local', { session: false }),
  function(req, res) {
    res.writeHead(200,{"Content-Type":"text/plain"});
    res.write("Authenticated! ");
    res.end();
  });

app.get('/encrypt/:str',
  function(req,res){
    bcrypt.hash(req.params.str, null, null, function(err, hash) {
      res.writeHead(200,{"Content-Type":"text/plain"});
      res.write(hash);
      res.end();
    });
});

/**
+++++++++++++++++++++++++++++++++++++++++++++++++++
+++                                             +++
+                  User Object                    +
+++                                             +++
+++++++++++++++++++++++++++++++++++++++++++++++++++
**/
// Create
app.post('/users',
  passport.authenticate('local', { session: false }),
  function (req,res){
    user.createUser(res,req.body.user,client);
});
// Read User
app.get('/users/:username',
  passport.authenticate('local', { session: false }),
  function (req,res) {
    user.readUser(res,req.params.username,client);
});
// Read Users
app.get('/users',
  passport.authenticate('local', { session: false }),
  function (req,res) {
    user.readUsers(res,client,req.query.start,req.query.limit);
});
// Update
app.put('/users/:id',
  passport.authenticate('local', { session: false }),
  function (req,res){
    user.updateUser(res,req.params.id, req.body.user,client);
});
// Delete
app.delete('/users/:id',
  passport.authenticate('local', { session: false }),
  function (req,res) {
    user.deleteUser(res,req.params.id,client);
});
// Get events for a user
app.get('/users/:id/events',
  passport.authenticate('local', { session: false }),
  function (req,res) {
    event.getEvents(
      res,
      req.params.id,
      client,
      req.query.start,
      req.query.limit
    );
});

/**
+++++++++++++++++++++++++++++++++++++++++++++++++++
+++                                             +++
+                  Event Object                   +
+++                                             +++
+++++++++++++++++++++++++++++++++++++++++++++++++++
**/
// Create
app.post('/events',
  passport.authenticate('local', { session: false }),
  function (req,res){
    event.createEvent(res,req.body.event,client);
});
// Read Event
app.get('/events/:id',
  passport.authenticate('local', { session: false }),
  function (req,res) {
    event.readEvent(res,req.params.id,client);
});
// Update
app.put('/events/:id',
  passport.authenticate('local', { session: false }),
  function (req,res){
    event.updateEvent(res,req.params.id,req.body.event,client);
});
// Delete
app.delete('/events/:id',
  passport.authenticate('local', { session: false }),
  function (req,res) {
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
app.get('/events/:eventId/invite/:userId' ,
  passport.authenticate('local', { session: false }),
  function (req,res){
    eventInvite.inviteAUser(res,req.params.eventId,req.params.userId,client);
});
// Invite many users to an event
app.post('/events/:eventId/invite' ,
  passport.authenticate('local', { session: false }),
  function (req,res){
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
app.post('/photos',
  passport.authenticate('local', { session: false }),
  function (req,res){
    pictures.createPicture(
      res,
      req.body.eventId,
      req.body.userId,
      req.files.picture,
      s3,
      client
    );
});
// Read Pictures For Event
app.get('/events/:eventId/photos',
  passport.authenticate('local', { session: false }),
  function (req,res) {
    pictures.readPictures(
      res,
      req.params.eventId,
      client,
      req.query.start,
      req.query.limit
    );
});
// Read A Picture
app.get('/photos/:eventId/:pictureId',
  passport.authenticate('local', { session: false }),
  function (req,res) {
    pictures.readPicture(
      res,
      req.params.eventId,
      req.params.pictureId,
      client,
      s3
    );
});
// Update
app.put('/photos/:id',
  passport.authenticate('local', { session: false }),
  function (req,res){
    pictures.updatePicture(res,req.params.id,client,req.body.photo);
});
// Delete
app.delete('/photos/:eventId/:pictureId',
  passport.authenticate('local', { session: false }),
  function (req,res) {
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
