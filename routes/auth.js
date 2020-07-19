const express = require('express');

const router = express.Router();
const { signup, signin, signout, isAuth, requireSignin } = require('../controllers/auth');

const { userSignupValidator } = require('../validator')

// Routes
router.post('/signup', userSignupValidator, signup);
router.post('/signin', signin);
router.get('/signout', signout);

router.get('/hello', requireSignin, isAuth, (req, res) => {
    res.send({
        message : "Hello word"
    })
});

module.exports = router;