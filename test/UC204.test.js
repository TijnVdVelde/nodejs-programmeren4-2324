const chai = require('chai')
const chaiHttp = require('chai-http')
const { app } = require('../index')
const { resetDatabase } = require('../src/util/reset-db.js')
const { expect } = chai

chai.use(chaiHttp)

let server
let token

describe('UC-204 Opvragen van usergegevens bij ID', () => {
    before(async () => {
        server = app.listen(3000)
        await resetDatabase()
    })

    after((done) => {
        if (server && server.listening) {
            server.close(done)
        } else {
            done()
        }
    })

    beforeEach(async () => {
        await resetDatabase()
        const res = await chai.request(server).post('/api/login').send({
            emailAdress: 'tmh.vandevelde@student.avans.nl',
            password: 'secret'
        })
        token = res.body.data.token
    })

    it('should retrieve the user details by ID successfully', (done) => {
        chai.request(server)
            .get('/api/user/1')
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
                        'User found with id 1.'
                    )
                    expect(res.body.data).to.have.property('user')
                    expect(res.body.data.user).to.include({
                        id: 1,
                        firstName: 'Tijn',
                        lastName: 'Van de Velde',
                        emailAdress: 'tmh.vandevelde@student.avans.nl'
                    })
                    expect(res.body.data)
                        .to.have.property('meal')
                        .that.is.an('array')
                    done()
                }
            })
    })

    it('should return an error for non-existent user ID', (done) => {
        chai.request(server)
            .get('/api/user/99')
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res).to.have.status(404)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 404)
                expect(res.body).to.have.property(
                    'message',
                    'User not found with id 99'
                )
                done()
            })
    })

    it('should return an error for missing token', (done) => {
        chai.request(server)
            .get('/api/user/0')
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
            .get('/api/user/0')
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
