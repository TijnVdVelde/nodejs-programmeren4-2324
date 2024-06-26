const chai = require('chai');
const chaiHttp = require('chai-http');
const { app } = require('../index'); // Adjust the path to your main application file
const { resetDatabase } = require('../src/util/reset-db.js');
const { expect } = chai;

chai.use(chaiHttp);

let server;

describe('UC-303 Opvragen van alle maaltijden', () => {
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

    it('should retrieve all meals successfully', (done) => {
        chai.request(server)
            .get('/api/meal')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status', 200);
                expect(res.body).to.have.property('message', 'Found 1 meals.');
                expect(res.body.data).to.be.an('array');
                expect(res.body.data).to.have.length.above(0);
                done();
            });
    });
});