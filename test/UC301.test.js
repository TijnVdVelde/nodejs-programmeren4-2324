const chai = require('chai')
const chaiHttp = require('chai-http')
const { app } = require('../index')
const { resetDatabase } = require('../src/util/reset-db.js')
const { expect } = chai

chai.use(chaiHttp)

let server
let validToken

describe('UC-301 Toevoegen van maaltijden', () => {
    before(async () => {
        server = app.listen(3000)
        await resetDatabase()
        const res = await chai.request(server).post('/api/login').send({
            emailAdress: 'tmh.vandevelde@student.avans.nl',
            password: 'secret'
        })
        validToken = res.body.data.token
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

    it('should add a meal successfully', (done) => {
        chai.request(server)
            .post('/api/meal')
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                name: 'Spaghetti Bolognese',
                description: 'A classic Italian pasta dish with meat sauce',
                isActive: true,
                isVega: false,
                isVegan: false,
                isToTakeHome: true,
                dateTime: '2024-05-14T18:00:00',
                imageUrl: 'https://example.com/spaghetti.jpg',
                allergens: ['gluten', 'lactose'],
                maxAmountOfParticipants: 10,
                price: 12.5
            })
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 200)
                expect(res.body.data).to.have.property(
                    'name',
                    'Spaghetti Bolognese'
                )
                expect(res.body.data).to.have.property(
                    'description',
                    'A classic Italian pasta dish with meat sauce'
                )
                expect(res.body.data).to.have.property('isActive', true)
                expect(res.body.data).to.have.property('isVega', false)
                expect(res.body.data).to.have.property('isVegan', false)
                expect(res.body.data).to.have.property('isToTakeHome', true)
                expect(res.body.data).to.have.property(
                    'dateTime',
                    '2024-05-14T18:00:00'
                )
                expect(res.body.data).to.have.property(
                    'imageUrl',
                    'https://example.com/spaghetti.jpg'
                )
                expect(res.body.data)
                    .to.have.property('allergens')
                    .that.includes('gluten')
                    .and.includes('lactose')
                expect(res.body.data).to.have.property(
                    'maxAmountOfParticipants',
                    10
                )
                expect(res.body.data).to.have.property('price', 12.5)
                done()
            })
    })

    it('should return an error if not logged in', (done) => {
        chai.request(server)
            .post('/api/meal')
            .send({
                name: 'Spaghetti Bolognese',
                description: 'A classic Italian pasta dish with meat sauce',
                isActive: true,
                isVega: false,
                isVegan: false,
                isToTakeHome: true,
                dateTime: '2024-05-14T18:00:00',
                imageUrl: 'https://example.com/spaghetti.jpg',
                allergens: ['gluten', 'lactose'],
                maxAmountOfParticipants: 10,
                price: 12.5
            })
            .end((err, res) => {
                expect(res).to.have.status(401)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 401)
                expect(res.body).to.have.property('message', 'Unauthorized')
                done()
            })
    })

    it('should return an error for missing required fields', (done) => {
        chai.request(server)
            .post('/api/meal')
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
