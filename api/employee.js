const express = require('express');
const employeeRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const timeRouter = require('./timesheets.js');
employeeRouter.use('/:employeeId/timesheets', timeRouter);


module.exports = employeeRouter;