const express = require('express');
const itemsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

itemsRouter.param('menuId', (req, res, next, menuId) => {
    db.get(`SELECT * FROM Menu WHERE id = ${menuId}`, (err, row) => {
        if (err) {next(err)};
        if (row) {
            next()
        } else {
            return res.sendStatus(404);
        }
    });
});

itemsRouter.get('/', (req, res, next) => {
    const menuId = req.params.menuId; 
    db.all(`SELECT * FROM MenuItem WHERE menu_id = ${menuId}`, (err, rows) => {
        if (err) {next(err)};
        return res.status(200).json({menuItems: rows});
    });
});

itemsRouter.post('/', (req, res, next) => {
    const menuId = req.params.menuId;
    const {name, description, inventory, price} = req.body.menuItem;
    if (!name || !description || !inventory || !price) {
        return res.sendStatus(400);
    } else {
        db.run(`INSERT INTO MenuItem (name, description, inventory, price, menu_id) 
            VALUES ($name, $description, $inventory, $price, $menuId)`, {
                $name: name,
                $description: description,
                $inventory: inventory,
                $price: price,
                $menuId: menuId
                }, function(err) {
                if (err) {next(err)};
                db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`, function(err, row) {
                    if (err) {next(err)};
                    return res.status(201).json({menuItem: row});
                });
        });
    }
});

itemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
    db.get(`SELECT * FROM MenuItem WHERE id = ${menuItemId}`, (err, row) => {
        if (err) {next(err)};
        if (row) {
            next()
        } else {
            return res.sendStatus(404);
        }
    });
});

itemsRouter.put('/:menuItemId', (req, res, next) => {
    const menuId = req.params.menuId;
    const {name, description, inventory, price} = req.body.menuItem;
    if (!name || !description || !inventory || !price) {
        return res.sendStatus(400);
    }
    const values = {
        $id: req.params.menuItemId,
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuId: menuId
    };
        
    db.run(`UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price, menu_id = $menuId
            WHERE id = $id`, values, err => {
                if (err) {next(err)};
                db.get(`SELECT * FROM MenuItem WHERE id = ${values.$id}`, (err, row) => {
                    return res.status(200).json({menuItem: row});
                });
        }
    );

});

itemsRouter.delete('/:menuItemId', (req, res, next) => {
    const id = req.params.menuItemId;
    db.run(`DELETE FROM MenuItem WHERE id = ${id}`, err => {
        if (err) {next(err)};
        res.sendStatus(204);
    });
});

module.exports = itemsRouter;