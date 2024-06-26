const chai = require('chai');
const chaiHttp = require('chai-http');
const { app } = require('../index'); // Adjust the path to your main application file
const { resetDatabase } = require('../src/util/reset-db.js');
const { expect } = chai;

chai.use(chaiHttp);

let server;

describe('UC-304 Opvragen van maaltijd bij ID', () => {
    before(async () => {
        // Start the server
        server = app.listen(3000);

        // Reset the database
        await resetDatabase();
    });

    after((done) => {
        // Stop the server after all tests if it's running
        if (server && server.listening) {
            server.close(done);
        } else {
            done();
        }
    });

    beforeEach(async () => {
        // Reset the database to its initial state before each test
        await resetDatabase();
    });

    it('should retrieve meal details successfully by ID', (done) => {
        chai.request(server)
            .get('/api/meal/1') // Assuming meal with ID 1 exists
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status', 200);
                expect(res.body).to.have.property('message', 'Meal found with id 1.');
                expect(res.body.data).to.be.an('object');
                expect(res.body.data).to.have.property('id', 1);
                expect(res.body.data).to.have.property('name');
                expect(res.body.data).to.have.property('description');
                expect(res.body.data).to.have.property('dateTime');
                expect(res.body.data).to.have.property('price');
                done();
            });
    });

    it('should return an error if the meal does not exist', (done) => {
        chai.request(server)
            .get('/api/meal/999') // Assuming meal with ID 999 does not exist
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status', 404);
                expect(res.body).to.have.property('message', 'Meal not found with id 999');
                done();
            });
    });
});
