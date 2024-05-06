const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const expect = chai.expect;

chai.use(chaiHttp);

describe('UC-206 Verwijderen van user', function() {
    it('TC-206-1 Unauthorized deletion attempt', function(done) {
        chai.request(server)
            .delete('/api/user/1')  // Assuming user 1 exists but the requester is not the owner
            .end(function(err, res) {
                expect(res).to.have.status(403);
                expect(res.body).to.have.property('message').equal('Unauthorized to delete this user');
                done();
            });
    });

    it('TC-206-2 Successfully delete user', function(done) {
        chai.request(server)
            .delete('/api/user/2')  // Assuming user 2 exists and requester is the owner
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message').equal('User deleted successfully');
                done();
            });
    });
});
