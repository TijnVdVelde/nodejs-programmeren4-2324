const chai = require('chai')
const chaiHttp = require('chai-http')
const { app } = require('../index') // Adjust the path to your main application file
const database = require('../src/dao/mysql-db')
const { expect } = chai

chai.use(chaiHttp)

let server
let token

describe('UC-202 Opvragen overzicht van users', () => {
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
            meals: []
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

    beforeEach((done) => {
        // Log in to get a token
        chai.request(server)
            .post('/api/login')
            .send({ emailAdress: 'hvd@server.nl', password: 'secret' })
            .end((err, res) => {
                if (err) {
                    done(err)
                } else {
                    token = res.body.data.token
                    done()
                }
            })
    })

    it('should retrieve all users successfully', (done) => {
        chai.request(server)
            .get('/api/user')
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 200)
                expect(res.body)
                    .to.have.property('message')
                    .that.includes('Found')
                expect(res.body.data).to.be.an('array')
                expect(res.body.data).to.have.lengthOf(2)
                done()
            })
    })

    it('should return an error for missing token', (done) => {
        chai.request(server)
            .get('/api/user')
            .end((err, res) => {
                expect(res).to.have.status(401)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 401)
                expect(res.body).to.have.property('message', 'Unauthorized')
                done()
            })
    })

    it('should filter active users', (done) => {
        chai.request(server)
            .get('/api/user?isActive=true')
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 200)
                expect(res.body)
                    .to.have.property('message')
                    .that.includes('Found')
                expect(res.body.data).to.be.an('array')
                expect(res.body.data.every((user) => user.isActive)).to.be.true
                done()
            })
    })

    it('should filter users based on search criteria', (done) => {
        chai.request(server)
            .get('/api/user?firstName=Hendrik&city=Utrecht')
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 200)
                expect(res.body)
                    .to.have.property('message')
                    .that.includes('Found 1 users.')
                expect(res.body.data).to.be.an('array')
                expect(res.body.data).to.have.lengthOf(1)
                expect(res.body.data[0]).to.include({
                    firstName: 'Hendrik',
                    city: 'Utrecht'
                })
                done()
            })
    })

    it('should return an empty list for non-existing search criteria', (done) => {
        chai.request(server)
            .get('/api/user?firstName=NonExisting&city=NonExistingCity')
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 200)
                expect(res.body)
                    .to.have.property('message')
                    .that.includes('Found 0 users.')
                expect(res.body.data).to.be.an('array')
                expect(res.body.data).to.have.lengthOf(0)
                done()
            })
    })
})
