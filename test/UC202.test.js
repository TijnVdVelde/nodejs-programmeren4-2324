const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const expect = chai.expect;

chai.use(chaiHttp);

describe('UC-202 Opvragen overzicht van users', function() {
    it('TC-202-1 Successfully retrieve all users', function(done) {
        chai.request(server)
            .get('/api/users')
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                done();
            });
    });

    it('TC-202-2 Retrieve users with specific criteria', function(done) {
        chai.request(server)
            .get('/api/users?status=active')
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.satisfy(users => users.every(user => user.isActive));
                done();
            });
    });

    it('TC-202-3 Request with invalid field filter', function(done) {
        chai.request(server)
            .get('/api/users?nonexistentField=value')
            .end(function(err, res) {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message').equal('Invalid filter field');
                done();
            });
    });
});
