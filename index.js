const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./src/routes/user.routes');
const mealRoutes = require('./src/routes/meal.routes');
const logger = require('./src/util/logger');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(userRoutes);
app.use(mealRoutes);

app.use((req, res, next) => {
    res.status(404).json({
        status: 404,
        message: "Route not found",
        data: {}
    });
});

app.use((err, req, res, next) => {
    logger.error(err.message);
    res.status(err.status || 500).json({
        status: err.status || 500,
        message: err.message,
        data: err.data || {}
    });
});

let server;
if (!module.parent) {
    server = app.listen(port, () => {
        logger.info(`Server running on port ${port}`);
    });
}

module.exports = { app, server }; // Export the app and server instance
