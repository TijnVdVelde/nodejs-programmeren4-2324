const chai = require('chai');
const chaiHttp = require('chai-http');
const { app } = require('../index');
const { resetDatabase } = require('../src/util/reset-db.js');
const { expect } = chai;

chai.use(chaiHttp);

let server;

describe('UC-101 Inloggen', () => {
    before(async () => {
        // Start the server
        server = app.listen(3000);

        // Reset the database and keep the admin account
        await resetDatabase();
    });

    after((done) => {
        // Stop the server after all tests if it's running
        if (server && server.listening) {
            server.close(done);
        } else {
            done();
        }
    });

    it('should login successfully with valid credentials', (done) => {
        chai.request(server)
            .post('/api/login')
            .send({
                emailAdress: 'tmh.vandevelde@student.avans.nl',
                password: 'secret'
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status', 200);
                expect(res.body).to.have.property('message', 'Login successful');
                expect(res.body.data).to.have.property('token');
                expect(res.body.data.user).to.include({
                    emailAdress: 'tmh.vandevelde@student.avans.nl'
                });
                done();
            });
    });

    it('should return an error for missing email or password', (done) => {
        chai.request(server)
            .post('/api/login')
            .send({
                emailAdress: '',
                password: ''
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status', 400);
                expect(res.body).to.have.property(
                    'message',
                    'Email and password are required'
                );
                done();
            });
    });

    it('should return an error for incorrect password', (done) => {
        chai.request(server)
            .post('/api/login')
            .send({
                emailAdress: 'tmh.vandevelde@student.avans.nl',
                password: 'wrongpassword'
            })
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status', 401);
                expect(res.body).to.have.property(
                    'message',
                    'Incorrect password'
                );
                done();
            });
    });

    it('should return an error for non-existent user', (done) => {
        chai.request(server)
            .post('/api/login')
            .send({
                emailAdress: 'nonexistent@server.nl',
                password: 'secret'
            })
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status', 404);
                expect(res.body).to.have.property('message', 'User not found');
                done();
            });
    });
});