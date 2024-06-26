const chai = require('chai');
const chaiHttp = require('chai-http');
const { app } = require('../index'); // Adjust the path to your main application file
const { resetDatabase } = require('../src/util/reset-db.js');
const { expect } = chai;

chai.use(chaiHttp);

let server;
let validToken;
let anotherValidToken;

describe('UC-302 Wijzigen van maaltijdgegevens', () => {
    before(async () => {
        // Start the server
        server = app.listen(3000);

        // Reset the database
        await resetDatabase();

        // Login to get valid tokens for both users
        const res1 = await chai.request(server)
            .post('/api/login')
            .send({ emailAdress: 'tmh.vandevelde@student.avans.nl', password: 'secret' });
        validToken = res1.body.data.token;

        const res2 = await chai.request(server)
            .post('/api/login')
            .send({ emailAdress: 'name@email.com', password: 'secret' });
        anotherValidToken = res2.body.data.token;
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

        // Log in to get valid tokens for both users
        const res1 = await chai.request(server)
            .post('/api/login')
            .send({ emailAdress: 'tmh.vandevelde@student.avans.nl', password: 'secret' });
        validToken = res1.body.data.token;

        const res2 = await chai.request(server)
            .post('/api/login')
            .send({ emailAdress: 'name@email.com', password: 'secret' });
        anotherValidToken = res2.body.data.token;
    });

    it('should return an error for invalid token', (done) => {
        chai.request(server)
            .put('/api/meal/1')
            .set('Authorization', 'Bearer invalidToken')
            .send({
                name: 'Updated Pasta',
                description: 'Updated description',
                price: 12.00,
                dateTime: '2024-05-16T18:00:00Z'
            })
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

    it('should return an error if the meal does not exist', (done) => {
        chai.request(server)
            .put('/api/meal/999')
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                name: 'Updated Pasta',
                description: 'Updated description',
                price: 12.00,
                dateTime: '2024-05-16T18:00:00Z'
            })
            .end((err, res) => {
                if (err) {
                    console.error('Error details:', err);
                }
                expect(res).to.have.status(404);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status', 404);
                expect(res.body).to.have.property('message', 'Meal not found with id 999');
                done();
            });
    });

    it('should return an error if user is not the owner', (done) => {
        chai.request(server)
            .put('/api/meal/1')
            .set('Authorization', `Bearer ${anotherValidToken}`)
            .send({
                name: 'Updated Pasta',
                description: 'Updated description',
                price: 12.00,
                dateTime: '2024-05-16T18:00:00Z'
            })
            .end((err, res) => {
                if (err) {
                    console.error('Error details:', err);
                }
                expect(res).to.have.status(403);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status', 403);
                expect(res.body).to.have.property('message', 'User not authorized to update meal with id 1');
                done();
            });
    });

    it('should return an error for missing required fields', (done) => {
        chai.request(server)
            .put('/api/meal/1')
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                name: '',
                description: '',
                price: '',
                dateTime: ''
            })
            .end((err, res) => {
                if (err) {
                    console.error('Error details:', err);
                }
                expect(res).to.have.status(400);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status', 400);
                expect(res.body).to.have.property('message', 'Missing required fields');
                done();
            });
    });
});