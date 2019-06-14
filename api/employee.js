const express = require('express');
const employeeRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const timeRouter = require('./timesheets.js');
employeeRouter.use('/:employeeId/timesheets', timeRouter);

employeeRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Employee WHERE is_current_employee = 1`, (err, rows) => {
        if (err) {next(err)};
        res.status(200).json({employees: rows});
    });
});

employeeRouter.post('/', (req, res, next) => {
    const {name, position, wage, isCurrentEmployee} = req.body.employee;
    if (!name || !position || !wage) {
        return res.sendStatus(400);
    };
    const values = {$name: name, $position: position, $wage: wage, $isCurrentEmployee: isCurrentEmployee || 1}
    db.run(`INSERT INTO Employee (name, position, wage, is_current_employee) 
            VALUES ($name, $position, $wage, $isCurrentEmployee)`, values, function(err) {
        if (err) {next(err)};
        db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`, function(err, row) {
            if (err) {next(err)};
            res.status(201).json({employee: row});
        });
    });
});

employeeRouter.param('employeeId', (req, res, next, employeeId) => {
    db.get(`SELECT * FROM Employee WHERE id=${employeeId}`, (err, row) => {
        if (err) {next(err)};
        if (row) {
            req.employee = row;
            next();
        } else {
            return res.sendStatus(404);
        }
    })
})

module.exports = employeeRouter;