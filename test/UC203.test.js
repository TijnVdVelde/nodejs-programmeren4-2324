const chai = require('chai')
const chaiHttp = require('chai-http')
const { app } = require('../index')
const { resetDatabase } = require('../src/util/reset-db.js')
const { expect } = chai

chai.use(chaiHttp)

let server
let token

describe('UC-203 Opvragen van gebruikersprofiel', () => {
    before(async () => {
        // Start the server
        server = app.listen(3000)

        // Reset the database
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

    beforeEach(async () => {
        // Reset the database to its initial state before each test
        await resetDatabase()

        // Log in to get a token
        const res = await chai.request(server).post('/api/login').send({
            emailAdress: 'tmh.vandevelde@student.avans.nl',
            password: 'secret'
        })
        token = res.body.data.token
    })

    it('should retrieve the user profile successfully', (done) => {
        chai.request(server)
            .get('/api/user/profile')
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                if (err) {
                    done(err)
                } else {
                    expect(res).to.have.status(200)
                    expect(res.body).to.be.an('object')
                    expect(res.body).to.have.property('status', 200)
                    expect(res.body).to.have.property(
                        'message',
                        'Profile retrieved successfully.'
                    )
                    expect(res.body.data).to.have.property('user')
                    expect(res.body.data.user).to.include({
                        emailAdress: 'tmh.vandevelde@student.avans.nl'
                    })
                    expect(res.body.data)
                        .to.have.property('meal')
                        .that.is.an('array')
                    done()
                }
            })
    })

    it('should return an error for missing token', (done) => {
        chai.request(server)
            .get('/api/user/profile')
            .end((err, res) => {
                expect(res).to.have.status(401)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 401)
                expect(res.body).to.have.property('message', 'Unauthorized')
                done()
            })
    })

    it('should return an error for invalid token', (done) => {
        chai.request(server)
            .get('/api/user/profile')
            .set('Authorization', 'Bearer invalidtoken')
            .end((err, res) => {
                expect(res).to.have.status(403)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 403)
                expect(res.body).to.have.property('message', 'Forbidden')
                done()
            })
    })
})
