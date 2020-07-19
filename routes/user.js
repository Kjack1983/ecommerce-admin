const express = require('express');

const router = express.Router();

const { requireSignin, isAuth, isAdmin } = require('../controllers/auth');

const { userById, read, update } = require('../controllers/user');

router.get('/secret/:userId', requireSignin, isAuth, isAdmin, (req, res) => {
    res.json({
        user: req.profile
    })
});

// Test router.
router.get('/hello', requireSignin, isAuth, (req, res) => {
    res.send("Hello world");
})

// Read and update
router.get('/user/:userId', requireSignin, isAuth, read);
router.put('/user/:userId', requireSignin, isAuth, update);

// Routes get the parameter we dont need POST or GET method.
router.param('userId', userById);

module.exports = router;