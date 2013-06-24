var request = require('superagent');
var expect = require('expect.js');

describe('Get User ID 1', function(){
    it (function(done){
        request.get('localhost:5000/users/1').end(function(res){
            expect(res).to.exist;
            expect(res.status).to.equal(200);
            expect(res.body).to.contain('username');
            done();
        });
    });
});
