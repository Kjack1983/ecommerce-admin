const express = require('express');

const router = express.Router();

const { create, productById, read, remove, update, list, listRelated, listCategories, listBySearch, photo } = require('../controllers/product');
const { requireSignin, isAuth, isAdmin } = require('../controllers/auth');
const { userById } = require('../controllers/user');

router.get('/product/:productId', read);

// Delete Product Route.
router.delete(
    '/product/:productId/:userId', 
    requireSignin, 
    isAuth, 
    isAdmin, 
    remove
);

//Update Product Route.
router.put(
    '/product/:productId/:userId', 
    requireSignin, 
    isAuth, 
    isAdmin, 
    update
);

// Create product Route
router.post(
    '/product/create/:userId',
    requireSignin, 
    isAuth, 
    isAdmin, 
    create
);

router.get('/products', list);
router.get('/product/related/:productId', listRelated);
router.get('/products/categories', listCategories);
router.post("/products/by/search", listBySearch);
router.get('/product/photo/:productId', photo);

// Routes get the parameter we dont need POST or GET method.
router.param('userId', userById);
router.param('productId', productById);

module.exports = router;