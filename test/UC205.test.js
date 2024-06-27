const chai = require('chai')
const chaiHttp = require('chai-http')
const { app } = require('../index')
const { resetDatabase } = require('../src/util/reset-db.js')
const { expect } = chai

chai.use(chaiHttp)

let server
let validToken

describe('UC-205 Updaten van usergegevens', () => {
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
        validToken = res.body.data.token
    })

    it('should update user details successfully', (done) => {
        chai.request(server)
            .put('/api/user/1')
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                firstName: 'Updated',
                lastName: 'User'
            })
            .end((err, res) => {
                console.log('Update user details response:', res.body)
                expect(res).to.have.status(200)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 200)
                expect(res.body.data).to.have.property('firstName', 'Updated')
                expect(res.body.data).to.have.property('lastName', 'User')
                done()
            })
    })

    it('should return an error if user is not the owner', (done) => {
        chai.request(server)
            .put('/api/user/2')
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                firstName: 'Updated',
                lastName: 'User'
            })
            .end((err, res) => {
                console.log(
                    'Error if user is not the owner response:',
                    res.body
                )
                expect(res).to.have.status(403)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 403)
                expect(res.body).to.have.property(
                    'message',
                    'You are not authorized to update this user'
                )
                done()
            })
    })

    it('should return an error if the user does not exist', (done) => {
        chai.request(server)
            .put('/api/user/999')
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                firstName: 'Updated',
                lastName: 'User'
            })
            .end((err, res) => {
                console.log('Error if user does not exist response:', res.body)
                expect(res).to.have.status(404)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 404)
                expect(res.body).to.have.property(
                    'message',
                    'User not found with id 999'
                )
                done()
            })
    })

    it('should return an error for invalid token', (done) => {
        chai.request(server)
            .put('/api/user/1')
            .set('Authorization', 'Bearer invalidToken')
            .send({
                firstName: 'Updated',
                lastName: 'User'
            })
            .end((err, res) => {
                console.log('Error for invalid token response:', res.body)
                expect(res).to.have.status(403)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 403)
                expect(res.body).to.have.property('message', 'Forbidden')
                done()
            })
    })
})
