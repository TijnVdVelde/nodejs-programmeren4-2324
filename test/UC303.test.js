const chai = require('chai')
const chaiHttp = require('chai-http')
const { app } = require('../index') // Adjust the path to your main application file
const database = require('../src/dao/mysql-db')
const { expect } = chai

chai.use(chaiHttp)

let server

describe('UC-303 Opvragen van alle maaltijden', () => {
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
        }

        // Start the server
        server = app.listen(3000, () => {
            done()
        })
    })

    after((done) => {
        // Stop the server after all tests if it's running
        if (server && server.listening) {
            server.close(done)
        } else {
            done()
        }
    })

    it.skip('should retrieve all meals successfully', (done) => {
        chai.request(server)
            .get('/api/meals')
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 200)
                expect(res.body).to.have.property(
                    'message',
                    'Meals retrieved successfully'
                )
                expect(res.body.data).to.be.an('array')
                expect(res.body.data).to.have.length(2)
                done()
            })
    })
})
