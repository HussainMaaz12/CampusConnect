const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 404;
        message = 'Resource not found';
    }

    if (statusCode === 500) {
        logger.error(`[ERROR] ${err.message}`, { stack: err.stack });
    } else {
        logger.warn(`[WARN] ${err.message}`);
    }

    res.status(statusCode).json({
        success: false,
        message: message,
        code: statusCode,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

module.exports = { errorHandler, notFound };
