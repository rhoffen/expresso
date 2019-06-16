const express = require('express');
const menusRouter = express.Router();

// const itemsRouter = require('./menu-items.js');
// menusRouter.use('/:menuId/menu-items', itemsRouter);

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menusRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Menu`, (err, rows) => {
        if (err) {next(err)};  
        return res.status(200).json({menus: rows});
    });
});

menusRouter.post('/', (req, res, next) => {
    const title = req.body.menu.title;
    
    if (!title) {
        return res.sendStatus(400);
    };
    db.run(`INSERT INTO Menu (title) VALUES ($title)`, {$title: title}, function(err) {
        if (err) {next(err)};
        db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`, function(err, row) {
            if (err) {next(err)};
            return res.status(201).json({menu: row});
        });
    });
});

menusRouter.param('menuId', (req, res, next, menuId) => {
    db.get(`SELECT * FROM Menu where id = ${menuId}`, (err, menu) => {
        if (err) {next(err)};
        if (menu) {
            req.menu = menu;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});
menusRouter.get('/:menuId', (req, res, next) => {
    res.status(200).json({menu: req.menu});
});

menusRouter.put('/:menuId', (req, res, next) => {
    const id = req.params.menuId;
    const title = req.body.menu.title;

    if (!title) {
        res.sendStatus(400);
    };

    db.run(`UPDATE Menu SET title = $title WHERE id = $id`, {$title: title, $id: id}, err => {
        if (err) {next(err)};
        
        db.get(`SELECT * FROM Menu WHERE id = ${id}`, (err, row) => {
            if (err) {next(err)};
            return res.status(200).json({menu: row});
        });
    });
});

menusRouter.delete('/:menuId', (req, res, next) => {
    const id = req.params.menuId;

    db.get(`SELECT * FROM MenuItem WHERE menu_id = ${id}`, (err, row) => {
        if (err) {next(err)};
        if (row) {
            return res.sendStatus(400);
        } else {
            db.run(`DELETE FROM Menu WHERE id = $id`, {$id: id}, err => {
                return res.sendStatus(204);
            });
        }
    });
});


module.exports = menusRouter;