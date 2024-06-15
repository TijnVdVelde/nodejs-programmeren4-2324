const chai = require('chai')
const chaiHttp = require('chai-http')
const { app } = require('../index') // Adjust the path to your main application file
const database = require('../src/dao/mysql-db')
const { expect } = chai

chai.use(chaiHttp)

let serverInstance
let validToken
let anotherValidToken

describe('UC-305 Verwijderen van maaltijd', () => {
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
        serverInstance = app.listen(3000, () => {
            // Login to get valid tokens for both users
            chai.request(serverInstance)
                .post('/api/login')
                .send({ emailAdress: 'hvd@server.nl', password: 'secret' })
                .end((err, res) => {
                    if (err) done(err)
                    validToken = res.body.data.token

                    chai.request(serverInstance)
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
        if (serverInstance && serverInstance.listening) {
            serverInstance.close(done)
        } else {
            done()
        }
    })

    it('should delete meal successfully', (done) => {
        chai.request(serverInstance)
            .delete('/api/meal/0')
            .set('Authorization', `Bearer ${validToken}`)
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 200)
                expect(res.body).to.have.property(
                    'message',
                    'Meal deleted successfully.'
                )
                done()
            })
    })

    it('should return an error if user is not the owner', (done) => {
        chai.request(serverInstance)
            .delete('/api/meal/0')
            .set('Authorization', `Bearer ${anotherValidToken}`)
            .end((err, res) => {
                expect(res).to.have.status(404)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 404)
                expect(res.body).to.have.property(
                    'message',
                    'Error: id 0 does not exist!'
                )
                done()
            })
    })

    it('should return an error if the meal does not exist', (done) => {
        chai.request(serverInstance)
            .delete('/api/meal/999')
            .set('Authorization', `Bearer ${validToken}`)
            .end((err, res) => {
                expect(res).to.have.status(404)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 404)
                expect(res.body).to.have.property(
                    'message',
                    'Error: id 999 does not exist!'
                )
                done()
            })
    })

    it('should return an error for invalid token', (done) => {
        chai.request(serverInstance)
            .delete('/api/meal/0')
            .set('Authorization', 'Bearer invalidToken')
            .end((err, res) => {
                expect(res).to.have.status(403)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 403)
                expect(res.body).to.have.property('message', 'Forbidden')
                done()
            })
    })
})
