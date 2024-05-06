const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const expect = chai.expect;

chai.use(chaiHttp);

describe('UC-205 Wijzigen van usergegevens', function() {
    it('TC-205-1 Missing required field', function(done) {
        chai.request(server)
            .put('/api/user/1')
            .send({
                // Missing emailAdress
                firstName: 'John',
                lastName: 'Doe'
            })
            .end(function(err, res) {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message').equal('Missing required fields');
                done();
            });
    });

    it('TC-205-2 Invalid email format', function(done) {
        chai.request(server)
            .put('/api/user/1')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                emailAdress: 'johnemail.com'  // Invalid email format
            })
            .end(function(err, res) {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message').equal('Invalid email format');
                done();
            });
    });

    it('TC-205-3 Successful update', function(done) {
        chai.request(server)
            .put('/api/user/1')
            .send({
                firstName: 'John',
                lastName: 'Doe Updated',
                emailAdress: 'johndoeupdated@example.com'
            })
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message').equal('User updated successfully');
                done();
            });
    });
});
