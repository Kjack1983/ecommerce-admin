const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const expressValidator = require('express-validator');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/category');
const productRoutes = require('./routes/product');

// db connection
const dbConnection = require('./connection/db-connection');
require('dotenv').config() // this will allow us to use the env variable.

// app
const app = express(); //invoke express in app variable.

//db connection
const dbconnectobj = new dbConnection();
dbconnectobj.connectToDb();

// middleware
app.use(morgan('dev')); // e.g POST /api/signup 200 208.108 ms - 302
app.use(bodyParser.json()); // fetch data from the request body.
app.use(cookieParser()); // store cookie in json format?
app.use(expressValidator()); // e.g display a successfull message for successfull signup.
app.use(cors()); // handle API that are coming from different origin. Avoid cross origin errors.

// Routes niddleware
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', categoryRoutes);
app.use('/api', productRoutes);

const port = process.env.PORT || 8000;

app.listen(port, () => {
    console.log('%c%s', 'color: #b6f2c3', `server up and running on port number ${port}`);
});