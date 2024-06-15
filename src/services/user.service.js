const database = require('../dao/mysql-db')
const logger = require('../util/logger')

const userService = {
    create: (user, callback) => {
        logger.info('create user', user)

        // Check for unique email address
        const existingUser = database._data.users.find(
            (u) => u.emailAdress === user.emailAdress
        )
        if (existingUser) {
            const errMsg = 'Email address already in use'
            logger.info(errMsg)
            return callback({ status: 400, message: errMsg }, null)
        }

        // Validate required fields
        if (
            !user.firstName ||
            !user.lastName ||
            !user.emailAdress ||
            !user.password
        ) {
            const errMsg = 'Missing required fields'
            logger.info(errMsg)
            return callback({ status: 400, message: errMsg }, null)
        }

        database.addUser(user, (err, data) => {
            if (err) {
                logger.info(
                    'error creating user: ',
                    err.message || 'unknown error'
                )
                callback(err, null)
            } else {
                logger.trace(`User created with id ${data.id}.`)
                callback(null, {
                    status: 200,
                    message: `User created with id ${data.id}.`,
                    data: data
                })
            }
        })
    },

    getAll: (criteria, callback) => {
        logger.info('getAll users')
        database.getAllUsers((err, data) => {
            if (err) {
                callback(err, null)
            } else {
                let filteredData = data
                if (criteria) {
                    if (criteria.isActive !== undefined) {
                        filteredData = filteredData.filter(
                            (user) =>
                                user.isActive === (criteria.isActive === 'true')
                        )
                    }
                    if (criteria.firstName) {
                        filteredData = filteredData.filter(
                            (user) => user.firstName === criteria.firstName
                        )
                    }
                    if (criteria.city) {
                        filteredData = filteredData.filter(
                            (user) => user.city === criteria.city
                        )
                    }
                }
                callback(null, {
                    status: 200,
                    message: `Found ${filteredData.length} users.`,
                    data: filteredData
                })
            }
        })
    },

    getById: (id, callback) => {
        logger.info(`getById with id ${id}`)
        if (isNaN(id)) {
            const errMsg = `Error: id ${id} is not a valid number!`
            logger.error(errMsg)
            callback({ status: 400, message: errMsg }, null)
            return
        }
        database.getUserById(id, (err, data) => {
            if (err) {
                logger.error(
                    'error getting user: ',
                    err.message || 'unknown error'
                )
                callback(err, null)
            } else if (!data) {
                const errMsg = `User not found with id ${id}`
                logger.info(errMsg)
                callback({ status: 404, message: errMsg }, null)
            } else {
                const futureMeals = database._data.meals.filter(
                    (meal) =>
                        meal.cook.id === id &&
                        new Date(meal.dateTime) >= new Date()
                )
                callback(null, {
                    status: 200,
                    message: `User found with id ${id}.`,
                    data: { user: data, meals: futureMeals }
                })
            }
        })
    },

    delete: (id, callback) => {
        logger.info(`delete user with id ${id}`)
        if (isNaN(id)) {
            const errMsg = `Error: id ${id} is not a valid number!`
            logger.error(errMsg)
            callback({ status: 400, message: errMsg }, null)
            return
        }
        database.deleteUser(id, (err, result) => {
            if (err) {
                logger.error(
                    'error deleting user: ',
                    err.message || 'unknown error'
                )
                callback(err, null)
            } else {
                callback(null, {
                    status: 200,
                    message: result.message
                })
            }
        })
    },

    update: (userId, updatedData, callback) => {
        database.getUserById(userId, (err, user) => {
            if (err || !user) {
                return callback(
                    {
                        status: 404,
                        message: `User not found with id ${userId}`
                    },
                    null
                )
            }

            // Validate the updated data (e.g., email should be unique)
            if (updatedData.emailAdress) {
                const existingUser = database._data.users.find(
                    (user) =>
                        user.emailAdress === updatedData.emailAdress &&
                        user.id !== userId
                )
                if (existingUser) {
                    return callback(
                        {
                            status: 400,
                            message: 'Email address already in use'
                        },
                        null
                    )
                }
            }

            // Perform the update
            Object.assign(user, updatedData)
            database.updateUser(userId, user, (err, updatedUser) => {
                if (err) {
                    return callback(err, null)
                }
                callback(null, {
                    status: 200,
                    message: 'User updated successfully',
                    data: updatedUser
                })
            })
        })
    },

    login: (email, password, callback) => {
        logger.info('Attempting login for', email)
        const user = database._data.users.find(
            (user) => user.emailAdress === email
        )

        if (!user) {
            logger.warn('User not found:', email)
            callback({ status: 404, message: 'User not found' }, null)
        } else if (user.password !== password) {
            logger.warn('Incorrect password for user:', email)
            callback({ status: 401, message: 'Incorrect password' }, null)
        } else {
            const token = Buffer.from(
                `${user.id}:${new Date().getTime()}`
            ).toString('base64')
            user.token = token
            logger.info('Login successful for', email, 'with token', token)
            callback(null, {
                status: 200,
                message: 'Login successful',
                data: {
                    user: {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        emailAdress: user.emailAdress
                    },
                    token
                }
            })
        }
    },

    getProfile: (userId, callback) => {
        logger.info(`getProfile for user with id ${userId}`)
        database.getUserById(userId, (err, user) => {
            if (err) {
                return callback(err, null)
            }
            if (!user) {
                return callback(
                    {
                        status: 404,
                        message: `User not found with id ${userId}`
                    },
                    null
                )
            }
            // Assuming meals are stored in the database._data.meals
            const futureMeals = database._data.meals.filter(
                (meal) =>
                    meal.cook.id === userId &&
                    new Date(meal.dateTime) >= new Date()
            )
            callback(null, {
                status: 200,
                message: `Profile retrieved successfully.`,
                data: {
                    user: user,
                    meals: futureMeals
                }
            })
        })
    }
}

module.exports = userService
