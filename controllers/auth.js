const User = require('../models/user');
const jwt = require('jsonwebtoken'); // to grenerate signed token.
const expressJwt = require('express-jwt'); // authorization check.
const { errorHandler } = require('../helpers/dbErrorHandlers');
// required to read the env file.
require('dotenv').config()

exports.signup = (req, res) => {
    console.log('req.body :', req.body);
    const user = new User(req.body);

    /**
     * Save is a model db Schema callback function 
     * to determine wheather the request was sent or not.
     */
    user.save((err, user) => {
        if(err) {
            return res.status(400).json({
                err: errorHandler(err)
            })
        }

        user.salt = undefined;
        user.hashed_password = undefined;

        res.json({
            user
        });

    })

}

exports.signin = (req, res) => {
    // find the user based on email.
    const { email, password } = req.body;

    User.findOne({ email }, (error, user) => {

        // Send a response in case of an error or if the user is not found.
        if (error || !user) {
            return res.status(400).json({
                error: 'User with that email does not exists. Please sign up'
            })
        }

        // if User is found make sure the email and password match.
        // create authenticate method in the user model
        if(!user.authenticate(password)) {
            // 401 unauthorized access
            return res.status(401).json({
                error: 'Email and Password do not match'
            })
        }


        // Generate a signed token with user id and secret.
        const token = jwt.sign({_id: user.id }, process.env.JWT_SECRET);

        // Persist the token as 't' in cookie with expired date.
        res.cookie('t', token, {expire: new Date() + 9999})

        const { _id, name, email, role } = user;

        return res.json({
            token,
            user: {
                _id,
                email,
                name,
                role
            }
        })

    })
}

exports.signout = (req, res) => {
    res.clearCookie('t');
    res.json({
        message: 'Signout success'
    });
}


exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    userProperty: "auth"
});

exports.isAuth = (req, res, next) => {
    let user = req.profile && req.auth && req.profile._id == req.auth._id;

    if(!user) {
        res.status(403).json({
            error: "Access denied"
        });
        return;
    }

    next();
}

exports.isAdmin = (req, res, next) => {

    console.log(req.profile.role);

    if (req.profile.role === 0) {
        res.status(403).json({
            error: 'Admin resource! access denied'
        })
    }

    next();
}