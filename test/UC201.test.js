const chai = require('chai')
const chaiHttp = require('chai-http')
const { app } = require('../index')
const { resetDatabase } = require('../src/util/reset-db.js')
const { expect } = chai

chai.use(chaiHttp)

let server

describe('UC-201 Registreren als nieuwe user', () => {
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

    it('should register a new user successfully', (done) => {
        chai.request(server)
            .post('/api/user')
            .send({
                firstName: 'Tijn',
                lastName: 'From the Fields',
                street: 'Lovensdijkstreet 16',
                city: 'London',
                isActive: 1,
                emailAdress: 'tmh.fromthefields@student.avans.nl',
                password: 'secret', // Adjust the password as needed
                phoneNumber: '0612312345'
            })
            .end((err, res) => {
                if (err) {
                    console.error('Error details:', err)
                    console.error('Response body:', res.body)
                    done(err)
                } else {
                    expect(res).to.have.status(200)
                    expect(res.body).to.be.an('object')
                    expect(res.body).to.have.property('status', 200)
                    expect(res.body)
                        .to.have.property('message')
                        .that.includes('User created with id')
                    expect(res.body.data).to.include({
                        firstName: 'Tijn',
                        lastName: 'From the Fields',
                        street: 'Lovensdijkstreet 16',
                        city: 'London',
                        emailAdress: 'tmh.fromthefields@student.avans.nl',
                        phoneNumber: '0612312345'
                    })
                    done()
                }
            })
    })

    it('should return an error for missing required fields', (done) => {
        chai.request(server)
            .post('/api/user')
            .send({
                firstName: '',
                lastName: '',
                emailAdress: '',
                password: '',
                isActive: 1
            })
            .end((err, res) => {
                if (err) {
                    console.error('Error details:', err)
                    console.error('Response body:', res.body)
                }
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

    it('should return an error for non-unique email address', (done) => {
        chai.request(server)
            .post('/api/user')
            .send({
                firstName: 'Jane',
                lastName: 'Doe',
                street: 'Main Street 2',
                city: 'Rotterdam',
                isActive: 1,
                emailAdress: 'tmh.vandevelde@student.avans.nl', // Existing email
                password: 'password',
                phoneNumber: '06-12345679'
            })
            .end((err, res) => {
                if (err) {
                    console.error('Error details:', err)
                    console.error('Response body:', res.body)
                }
                expect(res).to.have.status(400)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 400)
                expect(res.body).to.have.property(
                    'message',
                    'Email address already in use'
                )
                done()
            })
    })
})
