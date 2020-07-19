const express = require('express');

const router = express.Router();

const { create, categoryById, read,  update, remove, list } = require('../controllers/category');
const { requireSignin, isAuth, isAdmin } = require('../controllers/auth');

const { userById } = require('../controllers/user');


router.get('/category/:categoryId', read);

// Create
router.post(
    '/category/create/:userId',
    requireSignin, 
    isAuth, 
    isAdmin, 
    create
);

// Update
router.put(
    '/category/:categoryId/:userId',
    requireSignin,
    isAuth, 
    isAdmin, 
    update
);

// Update
router.delete(
    '/category/:categoryId/:userId',
    requireSignin, 
    isAuth, 
    isAdmin, 
    remove
);

//list of categories
router.get('/categories', list);

// Routes get the parameter we dont need POST or GET method.
router.param('categoryId', categoryById);
router.param('userId', userById);

module.exports = router;