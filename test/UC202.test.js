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

    it('should filter users based on search criteria', (done) => {
        chai.request(server)
            .get('/api/user?firstName=Tijn')
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 200)
                expect(res.body).to.have.property('message', 'Found 1 users.')
                expect(res.body.data).to.be.an('array').that.has.lengthOf(1)
                done()
            })
    })

    it('should return an empty list for non-existing search criteria', (done) => {
        chai.request(server)
            .get('/api/user?firstName=Nonexistent')
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 200)
                expect(res.body).to.have.property('message', 'Found 0 users.')
                expect(res.body.data).to.be.an('array').that.is.empty
                done()
            })
    })
})
