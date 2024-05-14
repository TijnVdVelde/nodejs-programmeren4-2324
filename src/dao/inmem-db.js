const logger = require('../util/logger');

const database = {
    _data: {
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
    },
    _userIndex: 2,
    _mealIndex: 1,
    _delayTime: 500,

    getAllUsers(callback) {
        setTimeout(() => {
            callback(null, this._data.users);
        }, this._delayTime);
    },

    getUserById(id, callback) {
        setTimeout(() => {
            const item = this._data.users.find(user => user.id === id);
            if (item) {
                callback(null, item);
            } else {
                const errMsg = `Error: id ${id} does not exist!`;
                logger.error(errMsg);
                callback({ status: 404, message: errMsg }, null);
            }
        }, this._delayTime);
    },

    addUser(item, callback) {
        setTimeout(() => {
            item.id = this._userIndex++;
            this._data.users.push(item);
            callback(null, item);
        }, this._delayTime);
    },

    updateUser(id, updatedItem, callback) {
        setTimeout(() => {
            const index = this._data.users.findIndex(item => item.id === id);
            if (index === -1) {
                const errMsg = `Error: id ${id} does not exist!`;
                logger.error(errMsg);
                callback({ status: 404, message: errMsg }, null);
            } else {
                this._data.users[index] = { ...this._data.users[index], ...updatedItem };
                callback(null, this._data.users[index]);
            }
        }, this._delayTime);
    },

    deleteUser(id, callback) {
        setTimeout(() => {
            const index = this._data.users.findIndex(item => item.id === id);
            if (index === -1) {
                const errMsg = `Error: id ${id} does not exist!`;
                logger.error(errMsg);
                callback({ status: 404, message: errMsg }, null);
            } else {
                this._data.users.splice(index, 1);
                callback(null, { message: `User with id ${id} deleted successfully.` });
            }
        }, this._delayTime);
    },

    getAllMeals(callback) {
        setTimeout(() => {
            callback(null, this._data.meals);
        }, this._delayTime);
    },

    getMealById(id, callback) {
        setTimeout(() => {
            const item = this._data.meals.find(meal => meal.id === id);
            if (item) {
                callback(null, item);
            } else {
                const errMsg = `Error: id ${id} does not exist!`;
                logger.error(errMsg);
                callback({ status: 404, message: errMsg }, null);
            }
        }, this._delayTime);
    },

    addMeal(meal, callback) {
        setTimeout(() => {
            meal.id = this._mealIndex++;
            this._data.meals.push(meal);
            callback(null, meal);
        }, this._delayTime);
    },

    updateMeal(id, updatedItem, callback) {
        setTimeout(() => {
            const index = this._data.meals.findIndex(item => item.id === id);
            if (index === -1) {
                const errMsg = `Error: id ${id} does not exist!`;
                logger.error(errMsg);
                callback({ status: 404, message: errMsg }, null);
            } else {
                this._data.meals[index] = { ...this._data.meals[index], ...updatedItem };
                callback(null, this._data.meals[index]);
            }
        }, this._delayTime);
    },

    deleteMeal(id, callback) {
        setTimeout(() => {
            const index = this._data.meals.findIndex(item => item.id === id);
            if (index === -1) {
                const errMsg = `Error: id ${id} does not exist!`;
                logger.error(errMsg);
                callback({ status: 404, message: errMsg }, null);
            } else {
                this._data.meals.splice(index, 1);
                callback(null, { message: `Meal with id ${id} deleted successfully.` });
            }
        }, this._delayTime);
    }
};

module.exports = database;
