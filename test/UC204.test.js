const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');  // Adjust this path as necessary
const expect = chai.expect;

chai.use(chaiHttp);

describe('UC-204 Opvragen van usergegevens bij ID', function() {
    it('TC-204-1 Nonexistent user ID', function(done) {
        chai.request(server)
            .get('/api/user/999')  // Assuming ID 999 does not exist
            .end(function(err, res) {
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('message').equal('User not found');
                done();
            });
    });

    it('TC-204-2 Successfully retrieve user details', function(done) {
        chai.request(server)
            .get('/api/user/1')  // Assuming ID 1 exists
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body.data).to.include.keys('firstName', 'lastName', 'emailAdress');
                done();
            });
    });
});
