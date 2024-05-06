const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');  // Adjust this path as necessary
const expect = chai.expect;

chai.use(chaiHttp);

describe('UC-201 Registreren als nieuwe user', function() {
    it('TC-201-1 Missing required field', function(done) {
        chai.request(server)
            .post('/api/user')
            .send({
                lastName: 'Doe',  // firstName is missing
                emailAdress: 'johndoe@example.com'
            })
            .end(function(err, res) {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message').equal('Missing required fields');
                done();
            });
    });

    it('TC-201-2 Duplicate email address', function(done) {
        chai.request(server)
            .post('/api/user')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                emailAdress: 'johndoe@example.com'  // Assuming this email already exists
            })
            .end(function(err, res) {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message').equal('Email already exists');
                done();
            });
    });

    it('TC-201-3 Successfully registered', function(done) {
        chai.request(server)
            .post('/api/user')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                emailAdress: 'johnnew@example.com'
            })
            .end(function(err, res) {
                expect(res).to.have.status(201);
                expect(res.body).to.have.property('message').equal('User registered successfully');
                done();
            });
    });
});
