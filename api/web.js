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
    partyEvent       = require('./event'),
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

app.get('/api', function (req, res) {
  res.send('PS API is running');
});

/**
+++++++++++++++++++++++++++++++++++++++++++++++++++
+++                                             +++
+                  User Object                    +
+++                                             +++
+++++++++++++++++++++++++++++++++++++++++++++++++++
**/
// Create
app.post('/user', function (req,res){
  user.createUser(res,req.body.user,client);
});
// Read User
app.get('/user/:id', function (req,res) {
    user.readUser(res,req.params.id,client);
});
// Read Users
app.get('/user', function (req,res) {
    user.readUsers(res,client);
});
// Update
app.put('/user', function (req,res){
  user.updateUser(res,req.body.user,client);
});
// Delete
app.delete('/user/:id', function (req,res) {
  user.deleteUser(res,req.params.id,client);
});

/**
+++++++++++++++++++++++++++++++++++++++++++++++++++
+++                                             +++
+                  Event Object                   +
+++                                             +++
+++++++++++++++++++++++++++++++++++++++++++++++++++
**/
// Create
app.post('/event', function (req,res){
  partyEvent.createEvent(res,req.body.partyEvent,client);
});
// Read User
app.get('/event/:id', function (req,res) {
    partyEvent.readEvent(res,req.params.id,client);
});
// Update
app.put('/event', function (req,res){
  partyEvent.updateEvent(res,req.body.partyEvent,client);
});
// Delete
app.delete('/event/:id', function (req,res) {
  partyEvent.deleteEvent(res,req.params.id,client);
});

/**
+++++++++++++++++++++++++++++++++++++++++++++++++++
+++                                             +++
+                  Pictures Object
+++                                             +++
+++++++++++++++++++++++++++++++++++++++++++++++++++
**/
// Create
app.post('/picture', function (req,res){
  pictures.createPicture(res,req.body.eventId,req.body.userId,req.files.picture,s3,client);
});
// Read Pictures
app.get('/pictures/:eventId', function (req,res) {
    pictures.readPictures(res,req.params.eventId,client);
});
// Read A Picture
app.get('/picture/:pictureId', function (req,res) {
    pictures.readPicture(res,req.params.eventId,req.params.pictureId,client,s3);
});

// Launch server
app.listen(port);