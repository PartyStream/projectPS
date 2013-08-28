var request = require('supertest');
var assert  = require('assert');
var app     = require('../api/web.js');
var should  = require('should');

describe('Get /', function(){
    it('should respond OK',function(done){
        request(app)
        .get('/')
        .end(function(err, res){
          res.status.should.equal(200);
          done(err);
        });
    });
});

describe('Get /api', function(){
    it('should respond OK',function(done){
        request(app)
        .get('/api')
        .end(function(err, res){
          res.status.should.equal(200);
          done(err);
        });
    });
});

// Getting All Users
describe('Get /users', function(){
    it('should respond OK',function(done){
        request(app)
        .get('/users?username=jsnow&password=test')
        .end(function(err, res){
          res.status.should.equal(200);
          done(err);
        });
    });
});
