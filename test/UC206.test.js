const chai = require('chai');
const chaiHttp = require('chai-http');
const { app } = require('../index'); // Adjust the path to your main application file
const database = require('../src/dao/inmem-db');
const { expect } = chai;

chai.use(chaiHttp);

let server;
let validToken;

describe('UC-206 Verwijderen van user', () => {
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

    it('should delete user successfully', (done) => {
        chai.request(server)
            .delete('/api/user/0')
            .set('Authorization', `Bearer ${validToken}`)
            .end((err, res) => {
                console.log('Delete user response:', res.body);
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status', 200);
                expect(res.body).to.have.property('message').that.includes('User deleted successfully');
                done();
            });
    });

    it('should return an error if user is not the owner', (done) => {
        chai.request(server)
            .delete('/api/user/1')
            .set('Authorization', `Bearer ${validToken}`)
            .end((err, res) => {
                console.log('Error if user is not the owner response:', res.body);
                expect(res).to.have.status(403);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status', 403);
                expect(res.body).to.have.property('message', 'Forbidden');
                done();
            });
    });

    it('should return an error if the user does not exist', (done) => {
        chai.request(server)
            .delete('/api/user/999')
            .set('Authorization', `Bearer ${validToken}`)
            .end((err, res) => {
                console.log('Error if user does not exist response:', res.body);
                expect(res).to.have.status(403);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status', 403);
                expect(res.body).to.have.property('message', 'Forbidden');
                done();
            });
    });

    it('should return an error for invalid token', (done) => {
        chai.request(server)
            .delete('/api/user/0')
            .set('Authorization', 'Bearer invalidToken')
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
