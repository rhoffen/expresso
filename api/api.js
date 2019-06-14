const express = require('express');
const apiRouter = express.Router();

const employeeRouter = require('./employee.js');
apiRouter.use('/employees', employeeRouter);

const menuRouter = require('./menu.js');
apiRouter.use('/menu', menuRouter);


module.exports = apiRouter;