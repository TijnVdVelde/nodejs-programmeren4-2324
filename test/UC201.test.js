const chai = require('chai')
const chaiHttp = require('chai-http')
const { app } = require('../index') // Adjust the path to your main application file
const database = require('../src/dao/mysql-db')
const { expect } = chai

chai.use(chaiHttp)

let server

describe('UC-201 Registreren als nieuwe user', () => {
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

    it('should register a new user successfully', (done) => {
        chai.request(server)
            .post('/api/user')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                street: 'Main Street 1',
                city: 'Rotterdam',
                emailAdress: 'john.doe@example.com',
                password: 'password',
                phoneNumber: '06-12345678'
            })
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 200)
                expect(res.body)
                    .to.have.property('message')
                    .that.includes('User created with id')
                expect(res.body.data).to.include({
                    firstName: 'John',
                    lastName: 'Doe',
                    street: 'Main Street 1',
                    city: 'Rotterdam',
                    emailAdress: 'john.doe@example.com',
                    phoneNumber: '06-12345678'
                })
                done()
            })
    })

    it('should return an error for missing required fields', (done) => {
        chai.request(server)
            .post('/api/user')
            .send({
                firstName: '',
                lastName: '',
                emailAdress: '',
                password: ''
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

    it('should return an error for non-unique email address', (done) => {
        chai.request(server)
            .post('/api/user')
            .send({
                firstName: 'Jane',
                lastName: 'Doe',
                street: 'Main Street 2',
                city: 'Rotterdam',
                emailAdress: 'hvd@server.nl', // Existing email
                password: 'password',
                phoneNumber: '06-12345679'
            })
            .end((err, res) => {
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
