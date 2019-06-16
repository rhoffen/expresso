const express = require('express');
const timeRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timeRouter.param('employeeId', (req, res, next, employeeId) => {
    db.get(`SELECT * FROM Employee WHERE id=${employeeId}`, (err, row) => {
        if (err) {next(err)};
        if (row) {
            req.employee = row;
            next();
        } else {
            return res.sendStatus(404);
        }
    });
});

timeRouter.get('/', (req, res, next) => {
    const id = req.params.employeeId;
    db.all(`SELECT * FROM Timesheet WHERE employee_id = ${id}`, (err, rows) => {
        if (err) {next(err)};
        res.status(200).send({timesheets: rows});
    });
});

timeRouter.post('/', (req, res, next) => {
    const id = Number(req.params.employeeId);
    const {hours, rate, date} = req.body.timesheet;
    if (!hours || !rate || !date) {
        return res.sendStatus(400);
    }
    const values = {$hours: hours, $rate: rate, $date: date, $employeeId: id};
    db.run(`INSERT INTO Timesheet (hours, rate, date, employee_id)
            VALUES ($hours, $rate, $date, $employeeId)`, values, function(err) {
            if (err) {next(err)};
            db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID}`, function(err, row) {
                res.status(201).json({timesheet: row});
            });
    });
});

timeRouter.param('timesheetId', (req, res, next, timesheetId) => {
    db.get(`SELECT * FROM Timesheet WHERE id=${timesheetId}`, (err, row) => {
        if (err) {next(err)};
        if (row) {
            next();
        } else {
            return res.sendStatus(404);
        }
    });
});

timeRouter.put('/:timesheetId', (req, res, next) => {
    const employeeId = req.params.employeeId;   
    const timesheetId = req.params.timesheetId;
    const {hours, rate, date} = req.body.timesheet;
    
    if (!hours || !rate || !date) {
        return res.sendStatus(400);
    };

    const values = {$hours: hours, $rate: rate, $date: date};
    db.run(`UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = ${employeeId}
            WHERE id = ${timesheetId}`, values, function(err) {
            if (err) {next(err)};
            db.get(`SELECT * FROM Timesheet WHERE id = ${timesheetId}`, function(err, row) {
                return res.status(200).json({timesheet: row});
            });
    });
});


timeRouter.delete('/:timesheetId', (req, res, next) => {
    const timesheetId = req.params.timesheetId;
    db.run(`DELETE FROM Timesheet WHERE id = ${timesheetId}`, err => {
        if (err) {next(err)};
        res.sendStatus(204);
    });
});

module.exports = timeRouter;