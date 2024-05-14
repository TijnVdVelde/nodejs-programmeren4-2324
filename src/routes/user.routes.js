const express = require('express');
const router = express.Router();
const assert = require('assert');
const chai = require('chai');
chai.should();
const userController = require('../controllers/user.controller');
const { authenticateToken } = require('../middleware/auth');

const validateUserCreateChaiExpect = (req, res, next) => {
    try {
        assert(req.body.firstName, 'Missing required fields');
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
router.get('/api/user', authenticateToken, userController.getAll);
router.get('/api/user/profile', authenticateToken, userController.getProfile);
router.get('/api/user/:userId', authenticateToken, userController.getById);
router.delete('/api/user/:userId', authenticateToken, userController.delete);
router.put('/api/user/:userId', authenticateToken, validateUserCreateChaiExpect, userController.update);

module.exports = router;
