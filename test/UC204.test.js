const chai = require('chai');
const chaiHttp = require('chai-http');
const { app } = require('../index'); // Adjust the path to your main application file
const database = require('../src/dao/inmem-db');
const { expect } = chai;

chai.use(chaiHttp);

let server;
let token;

describe('UC-204 Opvragen van usergegevens bij ID', () => {
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
                    token: 'token1'
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
                    token: 'token2'
                }
            ],
            meals: [
                {
                    id: 0,
                    name: 'Pasta Carbonara',
                    description: 'Spaghetti with pancetta, eggs, and cheese',
                    isActive: true,
                    isVega: false,
                    isVegan: false,
                    isToTakeHome: false,
                    dateTime: '2024-06-01T18:00:00',
                    maxAmountOfParticipants: 5,
                    price: 10.50,
                    imageUrl: 'https://www.simplyrecipes.com/thmb/1',
                    allergens: ['gluten', 'lactose'],
                    cook: {
                        id: 0
                    },
                    participants: [
                        {
                            id: 1
                        }
                    ]
                }
            ]
        };

        // Start the server
        server = app.listen(3000, () => {
            done();
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

    beforeEach((done) => {
        // Log in to get a token
        chai.request(server)
            .post('/api/login')
            .send({ emailAdress: 'hvd@server.nl', password: 'secret' })
            .end((err, res) => {
                if (err) {
                    done(err);
                } else {
                    token = res.body.data.token;
                    done();
                }
            });
    });

    it('should retrieve the user details by ID successfully', (done) => {
        chai.request(server)
            .get('/api/user/0')
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status', 200);
                expect(res.body).to.have.property('message', 'User found with id 0.');
                expect(res.body.data).to.have.property('user');
                expect(res.body.data.user).to.include({
                    id: 0,
                    firstName: 'Hendrik',
                    lastName: 'van Dam',
                    emailAdress: 'hvd@server.nl'
                });
                expect(res.body.data).to.have.property('meals').that.is.an('array');
                expect(res.body.data.meals).to.have.lengthOf(1);
                done();
            });
    });

    it('should return an error for non-existent user ID', (done) => {
        chai.request(server)
            .get('/api/user/99')
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status', 404);
                expect(res.body).to.have.property('message', 'User not found with id 99');
                done();
            });
    });

    it('should return an error for missing token', (done) => {
        chai.request(server)
            .get('/api/user/0')
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status', 401);
                expect(res.body).to.have.property('message', 'Unauthorized');
                done();
            });
    });

    it('should return an error for invalid token', (done) => {
        chai.request(server)
            .get('/api/user/0')
            .set('Authorization', 'Bearer invalidtoken')
            .end((err, res) => {
                expect(res).to.have.status(403);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status', 403);
                expect(res.body).to.have.property('message', 'Forbidden');
                done();
            });
    });
});
