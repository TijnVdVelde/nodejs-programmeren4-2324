const express = require('express');
const router = express.Router();
const assert = require('assert');
const chai = require('chai');
chai.should();
const userController = require('../controllers/user.controller');
const { authenticateToken } = require('../middleware/auth');

const validateUserCreate = (req, res, next) => {
    if (!req.body.emailAdress || !req.body.firstName || !req.body.lastName) {
        next({
            status: 400,
            message: 'Missing email or password',
            data: {}
        });
    }
    next();
};

const validateUserCreateAssert = (req, res, next) => {
    try {
        assert(req.body.emailAdress, 'Missing email');
        assert(req.body.firstName, 'Missing or incorrect first name');
        assert(req.body.lastName, 'Missing last name');
        next();
    } catch (ex) {
        next({
            status: 400,
            message: ex.message,
            data: {}
        });
    }
};

const validateUserCreateChaiShould = (req, res, next) => {
    try {
        req.body.firstName.should.not.be.empty.and.a('string');
        req.body.lastName.should.not.be.empty.and.a('string');
        req.body.emailAdress.should.not.be.empty.and.a('string').and.match(/@/);
        next();
    } catch (ex) {
        next({
            status: 400,
            message: ex.message,
            data: {}
        });
    }
};

const validateUserCreateChaiExpect = (req, res, next) => {
    try {
        assert(req.body.firstName, 'Missing or incorrect firstName field');
        chai.expect(req.body.firstName).to.not.be.empty;
        chai.expect(req.body.firstName).to.be.a('string');
        chai.expect(req.body.firstName).to.match(
            /^[a-zA-Z]+$/,
            'firstName must be a string'
        );
        next();
    } catch (ex) {
        next({
            status: 400,
            message: ex.message,
            data: {}
        });
    }
};

const validateLogin = (req, res, next) => {
    const { emailAdress, password } = req.body;
    if (!emailAdress || !password) {
        next({
            status: 400,
            message: 'Email and password are required',
            data: {}
        });
    } else {
        next();
    }
};

router.post('/api/login', validateLogin, userController.login);
router.post('/api/user', validateUserCreateChaiExpect, userController.create);
router.get('/api/user', userController.getAll);
router.get('/api/user/:userId', userController.getById);
router.delete('/api/user/:userId', authenticateToken, userController.delete);
router.put('/api/user/:userId', authenticateToken, validateUserCreateChaiExpect, userController.update);
router.get('/api/user/profile', authenticateToken, userController.getProfile);

module.exports = router;
