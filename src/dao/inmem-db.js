const database = {
    _data: [
        {
            id: 0,
            firstName: 'Hendrik',
            lastName: 'van Dam',
            emailAdress: 'hvd@server.nl'
        },
        {
            id: 1,
            firstName: 'Marieke',
            lastName: 'Jansen',
            emailAdress: 'm@server.nl'
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
                callback({ message: `Error: id ${id} does not exist!` }, null);
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


    // Voeg zelf de overige database functionaliteit toe
}

module.exports = database;