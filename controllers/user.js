const User = require('../models/user');

/**
 * find user by id 
 * @param { object } req
 * @param { object } res
 * @param { function } next
 * @param { string } id of the user.
 * 
 */
exports.userById = (req, res, next, id) => {

    console.log('req.body :>> ', req.body);
    console.log('id :>> ', id);
    // find user by id
    User.findById(id).exec((err, user) => {
        if(err || !user) {
            return res.status(400).json({
                error: 'User not found'
            })
        }

        // if error not found we want to add the user information to request profile.
        req.profile = user;
        next();
    })
}

exports.read = (req, res) => {
    console.log(req.profile);
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;

    return res.json(req.profile);
}

exports.update = (req, res) => {
    User.findOneAndUpdate(
        {_id: req.profile._id},
        {$set: req.body},
        {new: true},
        (err, user) => {
            if(err || !user) {
                return res.status(400).json({
                    error: 'You are not authorized to perform this action'
                })
            }
            user.hashed_password = undefined;
            user.salt = undefined;
            res.json(user);
        }
    )
}