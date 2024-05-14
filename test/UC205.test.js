const chai = require('chai');
const chaiHttp = require('chai-http');
const { app } = require('../index'); // Adjust the path to your main application file
const database = require('../src/dao/inmem-db');
const { expect } = chai;

chai.use(chaiHttp);

let server;
let validToken;

describe('UC-205 Updaten van usergegevens', () => {
    before((done) => {
        // Reset the database to its initial state before starting the tests
        database._data = {
            users: [
                {
                    id: 0,
                    firstName: 'Hendrik',
                    lastName: 'van Dam',
                    street: 'Kerkstraat 1',
                    city: 'Utrecht',
                    isActive: true,
                    emailAdress: 'hvd@server.nl',
                    password: 'secret',
                    phoneNumber: '06-12345678',
                    token: null
                },
                {
                    id: 1,
                    firstName: 'Marieke',
                    lastName: 'Jansen',
                    street: 'Schipweg 10',
                    city: 'Amsterdam',
                    isActive: true,
                    emailAdress: 'm@server.nl',
                    password: 'secret',
                    phoneNumber: '06-87654321',
                    token: null
                }
            ],
            meals: []
        };

        // Start the server
        server = app.listen(3000, () => {
            // Login to get a valid token
            chai.request(server)
                .post('/api/login')
                .send({ emailAdress: 'hvd@server.nl', password: 'secret' })
                .end((err, res) => {
                    if (err) done(err);
                    validToken = res.body.data.token;
                    done();
                });
        });
    });

    after((done) => {
        // Stop the server after all tests if it's running
        if (server && server.listening) {
            server.close(done);
        } else {
            done();
        }
    });

    it('should update user details successfully', (done) => {
        chai.request(server)
            .put('/api/user/0') // Update the user with ID 0
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                firstName: 'Updated',
                lastName: 'User'
            })
            .end((err, res) => {
                console.log('Update user details response:', res.body);
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status', 200);
                expect(res.body.data).to.have.property('firstName', 'Updated');
                expect(res.body.data).to.have.property('lastName', 'User');
                done();
            });
    });

    it('should return an error if user is not the owner', (done) => {
        chai.request(server)
            .put('/api/user/1')
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                firstName: 'Updated',
                lastName: 'User'
            })
            .end((err, res) => {
                console.log('Error if user is not the owner response:', res.body);
                expect(res).to.have.status(403);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status', 403);
                expect(res.body).to.have.property('message').that.includes('You are not authorized to update this user');
                done();
            });
    });

    it('should return an error if the user does not exist', (done) => {
        chai.request(server)
            .put('/api/user/999')
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                firstName: 'Updated',
                lastName: 'User'
            })
            .end((err, res) => {
                console.log('Error if user does not exist response:', res.body);
                expect(res).to.have.status(404);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status', 404);
                expect(res.body).to.have.property('message', 'User not found with id 999');
                done();
            });
    });

    it('should return an error for invalid token', (done) => {
        chai.request(server)
            .put('/api/user/0')
            .set('Authorization', 'Bearer invalidToken')
            .send({
                firstName: 'Updated',
                lastName: 'User'
            })
            .end((err, res) => {
                console.log('Error for invalid token response:', res.body);
                expect(res).to.have.status(403);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status', 403);
                expect(res.body).to.have.property('message', 'Forbidden');
                done();
            });
    });
});
