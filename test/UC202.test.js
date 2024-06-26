const chai = require('chai')
const chaiHttp = require('chai-http')
const { app } = require('../index')
const { resetDatabase } = require('../src/util/reset-db.js')
const { expect } = chai

chai.use(chaiHttp)

let server
let token

describe('UC-202 Opvragen overzicht van users', () => {
    before(async () => {
        // Start the server
        server = app.listen(3000)

        // Reset the database and keep the admin account
        await resetDatabase()
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
            .send({
                emailAdress: 'tmh.vandevelde@student.avans.nl',
                password: 'secret'
            })
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
            .get('/api/user?firstName=Tijn&city=Breda')
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
                    firstName: 'Tijn',
                    city: 'Breda'
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
