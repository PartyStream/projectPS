var application_root = __dirname,
    express          = require("express"),
    path             = require("path"),
    mongoose         = require('mongoose'),
    url              = require("url") ,
    user             = require('./user');

var app = express.createServer();

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

app.get('/user:id', function (req,res) {
    user.readUser(res,req.params.id);
});

// Launch server

app.listen(5000);