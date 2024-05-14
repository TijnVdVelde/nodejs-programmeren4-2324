const chai = require('chai');
const chaiHttp = require('chai-http');
const { app } = require('../index'); // Adjust the path to your main application file
const database = require('../src/dao/inmem-db');
const { expect } = chai;

chai.use(chaiHttp);

let server;
let validToken;

describe('UC-301 Toevoegen van maaltijden', () => {
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

    it('should add a meal successfully', (done) => {
        chai.request(server)
            .post('/api/meal')
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                name: 'Pasta',
                description: 'Delicious pasta with tomato sauce',
                dateTime: '2024-05-15T18:00:00Z',
                price: 10
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status', 200);
                expect(res.body.data).to.have.property('name', 'Pasta');
                expect(res.body.data).to.have.property('description', 'Delicious pasta with tomato sauce');
                expect(res.body.data).to.have.property('dateTime', '2024-05-15T18:00:00Z');
                expect(res.body.data).to.have.property('price', 10);
                done();
            });
    });

    it('should return an error if not logged in', (done) => {
        chai.request(server)
            .post('/api/meal')
            .send({
                name: 'Pasta',
                description: 'Delicious pasta with tomato sauce',
                dateTime: '2024-05-15T18:00:00Z',
                price: 10
            })
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status', 401);
                expect(res.body).to.have.property('message', 'Unauthorized');
                done();
            });
    });

    it('should return an error for missing required fields', (done) => {
        chai.request(server)
            .post('/api/meal')
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                name: '',
                description: '',
                dateTime: '',
                price: ''
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status', 400);
                expect(res.body).to.have.property('message', 'Missing required fields');
                done();
            });
    });
});
