const chai = require('chai')
const chaiHttp = require('chai-http')
const { app } = require('../index') // Adjust the path to your main application file
const database = require('../src/dao/mysql-db')
const { expect } = chai

chai.use(chaiHttp)

let server
let validToken
let anotherValidToken

describe('UC-302 Wijzigen van maaltijdgegevens', () => {
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
                }
            ]
        }

        // Start the server
        server = app.listen(3000, () => {
            // Login to get valid tokens for both users
            chai.request(server)
                .post('/api/login')
                .send({ emailAdress: 'hvd@server.nl', password: 'secret' })
                .end((err, res) => {
                    if (err) done(err)
                    validToken = res.body.data.token

                    chai.request(server)
                        .post('/api/login')
                        .send({
                            emailAdress: 'm@server.nl',
                            password: 'secret'
                        })
                        .end((err, res) => {
                            if (err) done(err)
                            anotherValidToken = res.body.data.token
                            done()
                        })
                })
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

    it.skip('should update meal details successfully', (done) => {
        chai.request(server)
            .put('/api/meal/0')
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                name: 'Updated Pasta',
                description: 'Updated description',
                dateTime: '2024-05-16T18:00:00Z',
                price: 12
            })
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 200)
                expect(res.body.data).to.have.property('name', 'Updated Pasta')
                expect(res.body.data).to.have.property(
                    'description',
                    'Updated description'
                )
                expect(res.body.data).to.have.property(
                    'dateTime',
                    '2024-05-16T18:00:00Z'
                )
                expect(res.body.data).to.have.property('price', 12)
                done()
            })
    })

    it('should return an error for invalid token', (done) => {
        chai.request(server)
            .put('/api/meal/0')
            .set('Authorization', 'Bearer invalidToken')
            .send({
                name: 'Updated Pasta',
                description: 'Updated description',
                dateTime: '2024-05-16T18:00:00Z',
                price: 12
            })
            .end((err, res) => {
                expect(res).to.have.status(403)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 403)
                expect(res.body).to.have.property('message', 'Forbidden')
                done()
            })
    })

    it.skip('should return an error if the meal does not exist', (done) => {
        chai.request(server)
            .put('/api/meal/999')
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                name: 'Updated Pasta',
                description: 'Updated description',
                dateTime: '2024-05-16T18:00:00Z',
                price: 12
            })
            .end((err, res) => {
                expect(res).to.have.status(404)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 404)
                expect(res.body).to.have.property(
                    'message',
                    'Meal not found with id 999'
                )
                done()
            })
    })

    it('should return an error if user is not the owner', (done) => {
        chai.request(server)
            .put('/api/meal/0')
            .set('Authorization', `Bearer ${anotherValidToken}`)
            .send({
                name: 'Updated Pasta',
                description: 'Updated description',
                dateTime: '2024-05-16T18:00:00Z',
                price: 12
            })
            .end((err, res) => {
                expect(res).to.have.status(403)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 403)
                expect(res.body).to.have.property(
                    'message',
                    'User not authorized to update meal with id 0'
                )
                done()
            })
    })

    it.skip('should return an error for missing required fields', (done) => {
        chai.request(server)
            .put('/api/meal/0')
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                name: '',
                description: '',
                dateTime: '',
                price: ''
            })
            .end((err, res) => {
                expect(res).to.have.status(400)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 400)
                expect(res.body).to.have.property(
                    'message',
                    'Missing required fields'
                )
                done()
            })
    })
})
