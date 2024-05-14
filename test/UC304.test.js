const chai = require('chai');
const chaiHttp = require('chai-http');
const { app, server } = require('../index'); // Ensure this path is correct and points to your index.js
const database = require('../src/dao/inmem-db');
const { expect } = chai;

chai.use(chaiHttp);

describe('UC-304 Opvragen van maaltijd bij ID', () => {
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
            meals: [
                {
                    id: 0,
                    name: 'Pasta',
                    description: 'Delicious pasta with tomato sauce',
                    dateTime: '2024-05-15T18:00:00Z',
                    price: 10,
                    cook: { id: 0 }
                },
                {
                    id: 1,
                    name: 'Salad',
                    description: 'Fresh garden salad',
                    dateTime: '2024-05-16T12:00:00Z',
                    price: 8,
                    cook: { id: 1 }
                }
            ]
        };

        // Start the server
        done();
    });

    after((done) => {
        // Stop the server after all tests if it's running
        if (server && server.listening) {
            server.close(done);
        } else {
            done();
        }
    });

    it.skip('should retrieve meal details by ID successfully', (done) => {
        chai.request(app)
            .get('/api/meals/0')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status', 200);
                expect(res.body).to.have.property('message', 'Meal retrieved successfully');
                expect(res.body.data).to.be.an('object');
                expect(res.body.data).to.have.property('name', 'Pasta');
                expect(res.body.data).to.have.property('description', 'Delicious pasta with tomato sauce');
                expect(res.body.data).to.have.property('dateTime', '2024-05-15T18:00:00Z');
                expect(res.body.data).to.have.property('price', 10);
                done();
            });
    });

    it('should return an error if the meal does not exist', (done) => {
        chai.request(app)
            .get('/api/meals/999')
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status', 404);
                expect(res.body).to.have.property('message', 'Route not found');
                done();
            });
    });
});
