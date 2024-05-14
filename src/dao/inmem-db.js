const logger = require('../util/logger');

const database = {
    _data: [
        {
            id: 0,
            firstName: 'Hendrik',
            lastName: 'van Dam',
            street: 'Kerkstraat 1',
            city: 'Utrecht',
            isActive: true,
            emailAdress: 'hvd@server.nl',
            password: 'secret',
            phoneNumber: '06-12345678'
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
            phoneNumber: '06-87654321'
        }
    ],
    _index: 2,
    _delayTime: 500,

    getAll(callback) {
        setTimeout(() => {
            callback(null, this._data);
        }, this._delayTime);
    },

    getById(id, callback) {
        setTimeout(() => {
            const item = this._data.find(user => user.id === id);
            if (item) {
                callback(null, item);
            } else {
                const errMsg = `Error: id ${id} does not exist!`;
                logger.error(errMsg);
                callback({ status: 404, message: errMsg }, null);
            }
        }, this._delayTime);
    },

    add(item, callback) {
        setTimeout(() => {
            item.id = this._index++;
            this._data.push(item);
            callback(null, item);
        }, this._delayTime);
    },

    update(id, updatedItem, callback) {
        setTimeout(() => {
            const index = this._data.findIndex(item => item.id === id);
            if (index === -1) {
                const errMsg = `Error: id ${id} does not exist!`;
                logger.error(errMsg);
                callback({ status: 404, message: errMsg }, null);
            } else {
                this._data[index] = { ...this._data[index], ...updatedItem };
                callback(null, this._data[index]);
            }
        }, this._delayTime);
    },

    delete(id, callback) {
        setTimeout(() => {
            const index = this._data.findIndex(item => item.id === id);
            if (index === -1) {
                const errMsg = `Error: id ${id} does not exist!`;
                logger.error(errMsg);
                callback({ status: 404, message: errMsg }, null);
            } else {
                this._data.splice(index, 1);
                callback(null, { message: `User with id ${id} deleted successfully.` });
            }
        }, this._delayTime);
    }
};

module.exports = database;
