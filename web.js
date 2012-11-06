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
    url              = require("url") ,
    user             = require('./user'),
    pg               = require('pg').native,
    // client           = new pg.Client(process.env.DATABASE_URL);
    client           = new pg.Client({
      user: 'ywvaxcfcyvqipg',
      password: 'rrKizy0m_X1TeNhAQj8lXsZ1mQ',
      database: 'deqbs2oph32c36',
      host: 'ec2-54-243-38-139.compute-1.amazonaws.com',
      port: 5432
    });
    // console.dir(process.env); return 1;

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


// Launch server

app.listen(5000);