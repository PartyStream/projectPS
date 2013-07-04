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
    client           = new pg.Client(process.env.DATABASE_URL);

AWS.config.update({accessKeyId: process.env.AWS_ACCESS_KEY, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY});
AWS.config.update({region: 'us-east-1'});

var s3 = new AWS.S3();

// console.log(process.env.DATABASE_URL); return 1;

// Connect To DB
client.connect();

var app = express();

// Config
app.configure(function () {
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(application_root, "public")));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

/*
    app.post(/object)          (create)
    app.get(/object/:id)       (read)
    app.get(/object)           (read all)
    app.put(/object/:id)       (update)
    app.delete(/object/:id)    (remove)
*/

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
// Create
app.post('/authenticate',function(req,res){
  authenticate.createToken(res,req.body.credentials,client);
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
// TODO: DELETE PHOTOS (DELETE)

// Launch server
console.log('Listening on port: '+ port);
app.listen(port);
module.exports = app;
