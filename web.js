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
    path             = require("path"),
    mongoose         = require('mongoose'),
    url              = require("url") ,
    user             = require('./user');

var app = express.createServer();

// testVars
var testUserObject         = {};
testUserObject['username'] = "userone";
testUserObject['password'] = "12345";
testUserObject['lang']     = "eng";

// console.log(JSON.stringify(testUserObject));


// Database

mongoose.connect('mongodb://localhost/photostream');

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
  user.createUser(res,req.body.user);
});
// Read
app.get('/user:id', function (req,res) {
    user.readUser(res,req.params.id);
});

// Launch server

app.listen(5000);