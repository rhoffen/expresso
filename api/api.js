const express = require('express');
const apiRouter = express.Router();

const employeeRouter = require('./employee.js');
apiRouter.use('/employees', employeeRouter);

const menusRouter = require('./menu.js');
apiRouter.use('/menus', menusRouter);


module.exports = apiRouter;