require('dotenv').config() // Import and load environment variables from .env file

const config = {
    secretkey: process.env.SECRETKEY || 'DitIsEenGeheim', // Secret key for signing JWTs
    dbHost: process.env.DB_HOST || 'localhost', // Database host
    dbUser: process.env.DB_USER || 'root', // Database user
    dbPassword: process.env.DB_PASSWORD || '', // Database password
    dbPort: process.env.DB_PORT || 3306, // Database port
    dbDatabase: process.env.DB_DATABASE || 'share_a_meal' // Database name
}

console.log('Database Config:', config) // Log the configuration settings

module.exports = config // Export the configuration