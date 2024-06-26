const chai = require('chai');
const chaiHttp = require('chai-http');
const { app } = require('../index'); // Adjust the path to your main application file
const { resetDatabase } = require('../src/util/reset-db.js');
const { expect } = chai;

chai.use(chaiHttp);

let server;
let validToken;

describe('UC-206 Verwijderen van user', () => {
    before(async () => {
        // Start the server
        server = app.listen(3000);

        // Reset the database
        await resetDatabase();

        // Log in to get a valid token
        const res = await chai.request(server)
            .post('/api/login')
            .send({ emailAdress: 'tmh.vandevelde@student.avans.nl', password: 'secret' });
        validToken = res.body.data.token;
    });

    after((done) => {
        // Stop the server after all tests if it's running
        if (server && server.listening) {
            server.close(done);
        } else {
            done();
        }
    });

    beforeEach(async () => {
        // Reset the database to its initial state before each test
        await resetDatabase();

        // Log in to get a valid token
        const res = await chai.request(server)
            .post('/api/login')
            .send({ emailAdress: 'tmh.vandevelde@student.avans.nl', password: 'secret' });
        validToken = res.body.data.token;
    });

    it('should delete user successfully', (done) => {
        chai.request(server)
            .delete('/api/user/2')
            .set('Authorization', `Bearer ${validToken}`)
            .end((err, res) => {
                if (err) {
                    console.error('Error details:', err);
                }
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status', 200);
                expect(res.body)
                    .to.have.property('message')
                    .that.includes('User with id 2 successfully deleted.');
                done();
            });
    });

    it('should return an error if the user does not exist', (done) => {
        chai.request(server)
            .delete('/api/user/999')
            .set('Authorization', `Bearer ${validToken}`)
            .end((err, res) => {
                if (err) {
                    console.error('Error details:', err);
                }
                expect(res).to.have.status(404);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status', 404);
                expect(res.body).to.have.property('message', 'User not found with id 999');
                done();
            });
    });

    it('should return an error for invalid token', (done) => {
        chai.request(server)
            .delete('/api/user/2')
            .set('Authorization', 'Bearer invalidToken')
            .end((err, res) => {
                if (err) {
                    console.error('Error details:', err);
                }
                expect(res).to.have.status(403);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status', 403);
                expect(res.body).to.have.property('message', 'Forbidden');
                done();
            });
    });
});